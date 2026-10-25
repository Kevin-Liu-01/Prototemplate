// The command-line read every script in scripts/ shares.

/** The value after `name` in `argv` (`--base http://localhost:3005`), or undefined when the flag is absent. */
export function option(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
}
