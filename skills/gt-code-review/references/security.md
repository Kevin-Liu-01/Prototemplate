# Security and keys

## S1. Keys come from the environment through the key runner and are never printed

**Look for:** a key in code, a config file, a test, a URL query or a log
line; `print` or `console.log` of a token, secret or password; a client
that reads a key file itself.

**Why:** a printed key is in the transcript, the CI log or the log store
for good. Code reads keys from the environment only. On Kevin's Mac a
command that needs a key runs through the key runner `withkeys.py`, which
puts only the keys a service needs into that command's environment.

```ts
// Bad
logger.info(`calling Modal with ${process.env.ERASE_GPU_PROXY_TOKEN_SECRET}`);
// Good
logger.info('calling the media GPU server', { operation: 'erase' });
```

**Source:** Kevin's key rules 1 and 2 for his translation pipeline
repositories: "Never print, log, commit or put a key in a URL".

## S2. No key in the sandbox

**Look for:** a provider key, proxy token or credential passed into an
agent sandbox's environment or files, and a sandbox script that calls a
paid API itself.

**Why:** the agent runs code it writes in the sandbox. A sandboxed step
writes its request to a file and exits; a smart tool outside the sandbox,
which holds the key, answers it and runs the step again.

**Sources:** Brian's
[#6184](https://github.com/generaltranslation/gt-cloud/pull/6184) body ("No
key in the sandbox") and
[#6185](https://github.com/generaltranslation/gt-cloud/pull/6185) body (the
sandbox "holds no token and opens no port"). Kevin's memory note
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

**Source:** Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189):
`upload-fonts` passes the archive path to `aws` as an argument instead of
through a shell.

## S4. Untrusted sizes and shapes are checked before they are read

**Look for:** a server that reads a request body before it knows the
operation, a missing or negative `Content-Length` accepted, and a file or
image loaded before its size and format are checked.

**Why:** a body read first lets one request take the server's memory. Look
up the operation, check the length against its cap, then read.

**Source:** Brian's
[#6189](https://github.com/generaltranslation/gt-cloud/pull/6189): the GPU
server looks up the operation before reading the body and rejects a
missing, negative or oversize `Content-Length`.

## S5. New dependencies are pinned and held back seven days

**Look for:** a new package with a floating version, a lockfile change that
takes a release from the last week, and a model or weights file with no
hash.

**Why:** a compromised release is usually found and pulled within days. A
seven-day hold keeps it out of the image, and a pinned hash makes the build
refuse a changed file.

**Sources:** Brian's
[aa4d8d0](https://github.com/generaltranslation/gt-cloud/commit/aa4d8d0dd21f62898c45d354cef625dca05f47a0)
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

**Sources:** Kevin's key rule 4 ("Customer content goes only to paid API
tiers under business terms") and his rented machine rule 1 (no service but
ssh on a public interface), both for his translation pipeline repositories.
