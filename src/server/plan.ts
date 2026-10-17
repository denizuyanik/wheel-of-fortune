import { auth, httpClient } from "@wix/essentials";

/**
 * Whether this site has an active plan for the app. Without one the website
 * widget is switched off; the dashboard stays open so the owner can see why
 * and choose a plan. No site data is touched either way.
 *
 * Fails OPEN: if the install cannot be read, a paying site is never locked out
 * by a transient error.
 */
const APP_ID = "1a5328a6-a435-4bf4-9e85-036480ce73ad";

export interface PlanStatus {
  active: boolean;
  upgradeUrl?: string;
}

interface InstanceInfo {
  instanceId?: string;
  isFree?: boolean;
  billing?: unknown;
  availablePlans?: unknown[];
}

/** A paid plan, a running trial, billing details or a plan from a bundle all count as active. */
export function planFromInstance(instance?: InstanceInfo | null): PlanStatus {
  if (!instance || typeof instance.isFree !== "boolean") return { active: true };
  const paid =
    instance.isFree === false ||
    Boolean(instance.billing) ||
    (Array.isArray(instance.availablePlans) && instance.availablePlans.length > 0);
  const upgradeUrl = instance.instanceId
    ? `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${encodeURIComponent(instance.instanceId)}`
    : undefined;
  return { active: paid, upgradeUrl };
}

const TTL_MS = 60_000;
let cache: { at: number; value: PlanStatus } | null = null;

export async function getPlanStatus(): Promise<PlanStatus> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  try {
    const res = await auth.elevate(httpClient.fetchWithAuth)("https://www.wixapis.com/apps/v1/instance");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const value = planFromInstance((await res.json())?.instance);
    cache = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.warn("Plan lookup failed, using the last known plan:", e);
    return cache?.value ?? { active: true };
  }
}
