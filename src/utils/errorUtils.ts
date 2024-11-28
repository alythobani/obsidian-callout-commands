export function throwNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`); // eslint-disable-line @typescript-eslint/restrict-template-expressions
}
