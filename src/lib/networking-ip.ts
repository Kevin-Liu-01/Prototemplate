/* Vendored from packages/networking/src/ip.ts for the standalone mirror
   (the mirror lacks workspace packages); keep in sync with the source. */
import { lookup } from 'node:dns/promises';
import net from 'node:net';

export type ResolvedAddress = {
  address: string;
  family: 4 | 6;
};

const blockedIpv4 = new net.BlockList();
const blockedIpv6 = new net.BlockList();
const allowedIpv6 = new net.BlockList();

const blockedIpv4Subnets: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 29],
  ['192.0.0.8', 32],
  ['192.0.0.170', 31],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

const blockedIpv6Subnets: [string, number][] = [
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['100:0:0:1::', 64],
  ['2001::', 32],
  ['2001:2::', 48],
  ['2001:10::', 28],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['3fff::', 20],
  ['5f00::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
];

/* IPv6 is allowlist-first: anything outside global unicast and the NAT64
   well-known prefix is blocked, so unlisted transition spellings fail
   closed instead of slipping through. */
const allowedIpv6Subnets: [string, number][] = [
  ['64:ff9b::', 96],
  ['2000::', 3],
];

for (const [subnet, prefix] of blockedIpv4Subnets) {
  blockedIpv4.addSubnet(subnet, prefix, 'ipv4');
  /* NAT64 embeds the target IPv4 in the low 32 bits, so the allowlisted
     well-known prefix mirrors the IPv4 blocklist instead of admitting
     translations to blocked targets. */
  blockedIpv6.addSubnet(`64:ff9b::${subnet}`, 96 + prefix, 'ipv6');
}

for (const [subnet, prefix] of blockedIpv6Subnets) {
  blockedIpv6.addSubnet(subnet, prefix, 'ipv6');
}

for (const [subnet, prefix] of allowedIpv6Subnets) {
  allowedIpv6.addSubnet(subnet, prefix, 'ipv6');
}

export function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return blockedIpv4.check(ip, 'ipv4');
  if (family === 6) {
    return blockedIpv6.check(ip, 'ipv6') || !allowedIpv6.check(ip, 'ipv6');
  }
  return true;
}

export function isPublicIp(ip: string): boolean {
  return net.isIP(ip) !== 0 && !isBlockedIp(ip);
}

export function normalizeHostname(hostname: string): string {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.slice(1, -1);
  }
  return hostname.toLowerCase();
}

export async function resolveHostAddresses(
  hostname: string
): Promise<ResolvedAddress[]> {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address, family }) => {
    if (family !== 4 && family !== 6) {
      throw new Error('Hostname resolved to an invalid IP address');
    }
    return { address, family };
  });
}
