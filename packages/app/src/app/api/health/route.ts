import { getOrm } from "@plant-ai/core";

/** Liveness + DB readiness probe. MikroORM connects lazily, so run a real query. */
export async function GET() {
  try {
    const orm = await getOrm();
    await orm.em.fork().getConnection().execute("select 1");
    return Response.json({ status: "ok", db: { ok: true } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return Response.json({ status: "error", db: { ok: false, reason } }, { status: 503 });
  }
}
