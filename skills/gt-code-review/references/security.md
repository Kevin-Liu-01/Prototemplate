# Security and keys

## S1. Keys come from the environment through the key runner and are never printed

**Look for:** a key in code, a config file, a test, a URL query or a log
line; `print` or `console.log` of a token, secret or password; a client
that reads a key file itself. A session or host token in a request URL
counts: the URL is written to Worker logs, Sentry and proxies. A browser
WebSocket cannot set a header, so it carries a one-time ticket, not the
token. An authenticated request with the token in its Authorization header
mints the ticket, the server stores it for 30 seconds, and the socket sends
it once in Sec-WebSocket-Protocol. The token itself never goes in that
header either: Cloudflare's request logs redact Authorization and keep
Sec-WebSocket-Protocol as sent. Every other request sends its token in a
header.

**Why:** a printed key is in the transcript, the CI log or the log store
for good. Code reads keys from the environment only. On the build Mac a
command that needs a key runs through the key runner `withkeys.py`, which
puts only the keys a service needs into that command's environment.

```ts
// Bad
logger.info(`calling Modal with ${process.env.ERASE_GPU_PROXY_TOKEN_SECRET}`);
// Good
logger.info('calling the media GPU server', { operation: 'erase' });
```

**Sources:** Key rules 1 and 2 of the translation pipelines'
agent rules: "Never print, log, commit or put a key in a URL". The
[#6213](https://github.com/generaltranslation/gt-cloud/pull/6213) review,
a host token in the query of normal fetches in
[room.ts:273](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216382). The captions audio
socket's ticket, from the round 4 review of the same stack.

## S2. No key in the sandbox

**Look for:** a provider key, proxy token or credential passed into an
agent sandbox's environment or files, and a sandbox script that calls a
paid API itself.

**Why:** the agent runs code it writes in the sandbox. A sandboxed step
writes its request to a file and exits; a smart tool outside the sandbox,
which holds the key, answers it and runs the step again.

**Sources:** [#6184](https://github.com/generaltranslation/gt-cloud/pull/6184) body ("No
key in the sandbox") and
[#6185](https://github.com/generaltranslation/gt-cloud/pull/6185) body (the
sandbox "holds no token and opens no port"). Memory note
`smart-tools-1123`.

## S3. Arguments, not shell strings

**Look for:** `shell=True`, `os.system`, `exec` or `execSync` with a
template string that holds a path or a value from input.

**Why:** a path with a space or a quote breaks the command, and a crafted
one runs another command. Pass an argument list.

```ts
// Bad
execSync(`aws s3 cp ${archive} s3://fonts/`);
// Good
execFileSync('aws', ['s3', 'cp', archive, 's3://fonts/']);
```

**Source:** [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189):
`upload-fonts` passes the archive path to `aws` as an argument instead of
through a shell.

## S4. Untrusted sizes and shapes are checked before they are read

**Look for:** a server that reads a request body before it knows the
operation, a missing or negative `Content-Length` accepted, and a file or
image loaded before its size and format are checked.

**Why:** a body read first lets one request take the server's memory. Look
up the operation, check the length against its cap, then read.

**Source:** [#6189](https://github.com/generaltranslation/gt-cloud/pull/6189): the GPU
server looks up the operation before reading the body and rejects a
missing, negative or oversize `Content-Length`.

## S5. New dependencies are pinned and held back seven days

**Look for:** a new package with a floating version, a lockfile change that
takes a release from the last week, and a model or weights file with no
hash.

**Why:** a compromised release is usually found and pulled within days. A
seven-day hold keeps it out of the image, and a pinned hash makes the build
refuse a changed file.

**Sources:** [aa4d8d0](https://github.com/generaltranslation/gt-cloud/commit/aa4d8d0dd21f62898c45d354cef625dca05f47a0)
(hold new Python packages back 7 days in every uv project and the GPU
deploy) and
[d858ade](https://github.com/generaltranslation/gt-cloud/commit/d858adea6b31a6f89bc57889b0df66a4b7d668f8)
(the big-lama weights pinned by `PIN_SHA256`).

## S6. Customer content goes only to paid API tiers, and services bind 127.0.0.1

**Look for:** a call that sends customer text, images or video to a free
tier or a provider without business terms, and a service, scheduler or
debug server that listens on every interface.

**Why:** free tiers may train on what they receive. A service on a public
interface is reachable by anyone who scans the address, so only ssh
listens there and every other service binds 127.0.0.1.

**Sources:** Key rule 4 ("Customer content goes only to paid API
tiers under business terms") and rented machine rule 1 (no service but
ssh on a public interface), both of the translation pipelines' agent rules.

## S7. Anonymous writes are throttled, and a client's ids are checked against their owner

**Look for:** a write that a client with no account can reach, such as a
message from anyone holding a public room link, with no limit per client;
each such write that also stores a record or broadcasts to every viewer;
and an id from a request (a session, a namespace, a project) used without a
check that the caller's org owns it.

**Why:** a public link is shared, so whoever holds it can send as fast as
the socket allows, and each message costs a storage write and a broadcast
to everyone in the room. Throttle per socket or per client, drop what is
over the limit, and say so. An id that is "globally unique" is still
checked against the caller's org, since uniqueness says nothing about who
may use it.

```ts
// Bad: every viewer message is stored and broadcast.
socket.addEventListener('message', (event) => this.rename(event.data));
// Good
socket.addEventListener('message', (event) => {
  if (!this.viewerLimit.take(socket)) return;
  this.rename(event.data);
});
```

**Sources:** The [#6213](https://github.com/generaltranslation/gt-cloud/pull/6213)
review, viewer messages with no throttle in
[room.ts:374](https://github.com/generaltranslation/gt-cloud/pull/6213#discussion_r4712216389).
[#4882](https://github.com/generaltranslation/gt-cloud/pull/4882#discussion_r4087975340)
(a session namespace used without checking the org).
