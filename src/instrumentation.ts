/*
 * Runs once when a server instance starts. Begin opening the database in the
 * background so the first visitor doesn't pay for it (on a preview deploy the
 * embedded database also migrates and seeds here). Not awaited: the server
 * accepts requests straight away, and catalogue pages fall back to the data
 * files until it is ready.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmDb } = await import("./lib/db");
    warmDb();
  }
}
