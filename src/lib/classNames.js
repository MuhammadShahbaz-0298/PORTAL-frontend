/* Join conditional class names without adding a dependency. */
export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}
