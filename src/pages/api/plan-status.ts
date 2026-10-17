import type { APIRoute } from "astro";
import { getPlanStatus } from "../../server/plan";

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export const OPTIONS: APIRoute = async () => new Response(null, { status: 204, headers: HEADERS });

/** GET /api/plan-status: whether the website widget is switched on. Contains nothing sensitive. */
export const GET: APIRoute = async () => {
  const plan = await getPlanStatus();
  return new Response(JSON.stringify({ active: plan.active, upgradeUrl: plan.upgradeUrl }), { status: 200, headers: HEADERS });
};
