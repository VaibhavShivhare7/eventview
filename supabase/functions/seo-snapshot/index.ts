import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

type SiteEntry = { siteUrl: string; permissionLevel?: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function gatewayHeaders() {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const connectionKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovableKey || !connectionKey) return null;
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connectionKey,
  };
}

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

async function listVerifiedSites(headers: Record<string, string>, targetUrl?: string) {
  const res = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Could not list properties [${res.status}]: ${body}`);
    throw new Error(`[${res.status}]: ${body}`);
  }
  const { siteEntry = [] } = (await res.json()) as { siteEntry?: SiteEntry[] };
  const verified = siteEntry.filter((e) => e.permissionLevel !== "siteUnverifiedUser");
  if (!targetUrl) return verified.map((e) => e.siteUrl);
  let target: URL | null = null;
  try {
    target = new URL(targetUrl);
  } catch {
    target = null;
  }
  const matches = target ? verified.filter((e) => coversTarget(e.siteUrl, target!)) : [];
  return (matches.length ? matches : verified).map((e) => e.siteUrl);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function queryAnalytics(
  headers: Record<string, string>,
  siteUrl: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(
    `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) {
    const text = await res.text();
    console.error(`Search Console query failed [${res.status}]: ${text}`);
    throw new Error(`[${res.status}]: ${text}`);
  }
  return (await res.json()) as { rows?: Array<{ keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }> };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
  const userId = claims?.claims?.sub as string | undefined;
  if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

  const { data: adminRole } = await userClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminRole) return json({ error: "Admins only" }, 403);

  let payload: { action?: string; site_url?: string; target_url?: string; days?: number } = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }
  const action = payload.action ?? "refresh";
  if (!["refresh", "list_properties", "set_property"].includes(action)) {
    return json({ error: "Unknown action" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  if (action === "set_property") {
    const siteUrl = typeof payload.site_url === "string" ? payload.site_url.trim() : "";
    if (!siteUrl || siteUrl.length > 300) return json({ error: "site_url is required" }, 400);
    const headers = gatewayHeaders();
    if (!headers) return json({ status: "not_connected" });
    const allowed = await listVerifiedSites(headers);
    if (!allowed.includes(siteUrl)) return json({ error: "That property is not verified for this account" }, 400);
    await admin.from("seo_settings").upsert({ id: true, site_url: siteUrl, updated_at: new Date().toISOString() });
    return json({ status: "ok", site_url: siteUrl });
  }

  const headers = gatewayHeaders();
  if (!headers) return json({ status: "not_connected" });

  const targetUrl = typeof payload.target_url === "string" ? payload.target_url : undefined;

  try {
    if (action === "list_properties") {
      return json({ status: "ok", properties: await listVerifiedSites(headers, targetUrl) });
    }

    const { data: settings } = await admin.from("seo_settings").select("site_url").eq("id", true).maybeSingle();
    let siteUrl = settings?.site_url ?? null;
    if (!siteUrl) {
      const candidates = await listVerifiedSites(headers, targetUrl);
      if (candidates.length === 0) return json({ status: "no_property" });
      if (candidates.length > 1) return json({ status: "selection_required", properties: candidates });
      siteUrl = candidates[0];
      await admin.from("seo_settings").upsert({ id: true, site_url: siteUrl, updated_at: new Date().toISOString() });
    }

    const days = Math.min(Math.max(payload.days ?? 28, 7), 90);
    const end = new Date(Date.now() - 2 * 86_400_000);
    const start = new Date(end.getTime() - (days - 1) * 86_400_000);
    const range = { startDate: isoDate(start), endDate: isoDate(end) };

    const [byDate, byQuery, byPage] = await Promise.all([
      queryAnalytics(headers, siteUrl, { ...range, dimensions: ["date"], rowLimit: 100 }),
      queryAnalytics(headers, siteUrl, { ...range, dimensions: ["query"], rowLimit: 25 }),
      queryAnalytics(headers, siteUrl, { ...range, dimensions: ["page"], rowLimit: 25 }),
    ]);

    const rows = byDate.rows ?? [];
    const clicks = rows.reduce((sum, r) => sum + (r.clicks ?? 0), 0);
    const impressions = rows.reduce((sum, r) => sum + (r.impressions ?? 0), 0);
    const position = rows.length
      ? rows.reduce((sum, r) => sum + (r.position ?? 0) * (r.impressions ?? 0), 0) / Math.max(impressions, 1)
      : 0;

    const snapshot = {
      site_url: siteUrl,
      range_start: range.startDate,
      range_end: range.endDate,
      totals: { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position },
      by_date: rows.map((r) => ({ date: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      top_queries: (byQuery.rows ?? []).map((r) => ({ query: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      top_pages: (byPage.rows ?? []).map((r) => ({ page: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
      fetched_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await admin.from("seo_snapshots").insert(snapshot).select().single();
    if (insertError) {
      console.error("Failed to store snapshot", insertError);
      return json({ error: "Could not store snapshot", details: insertError.message }, 500);
    }

    return json({ status: "ok", snapshot: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("[403]")) {
      return json({ status: "forbidden", error: "The connected Google account cannot access this property", details: message }, 403);
    }
    return json({ error: "Search Console request failed", details: message }, 502);
  }
});
