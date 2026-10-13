import { checkDbConnection } from "@plant-ai/core";

/** Liveness + DB readiness probe. */
export async function GET() {
  const db = await checkDbConnection();
  if (!db.ok) {
    return Response.json({ status: "error", db }, { status: 503 });
  }
  return Response.json({ status: "ok", db });
}
