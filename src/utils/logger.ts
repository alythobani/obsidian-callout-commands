const PLUGIN_NAME = "Callout Toggle Commands";

export function logInfo(message: string): void {
  console.log(`${PLUGIN_NAME}: ${message}`);
}

export function logError(message: string): void {
  console.error(`${PLUGIN_NAME}: ${message}`);
}
