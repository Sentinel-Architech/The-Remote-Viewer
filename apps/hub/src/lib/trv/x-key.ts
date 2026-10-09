/** Host secret name. The value is never written to git or returned to the client. */
export const X_KEY_ENV = "X_BEARER_TOKEN";

export function xKeyConfigured(): boolean {
  const value = process.env[X_KEY_ENV];
  return typeof value === "string" && value.length > 0;
}
