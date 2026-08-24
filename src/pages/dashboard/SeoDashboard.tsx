import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { CONVERSION_EVENTS } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search } from "lucide-react";

type SearchRow = {
  query?: string;
  page?: string;
  date?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type Snapshot = {
  site_url: string;
  range_start: string;
  range_end: string;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  by_date: SearchRow[];
  top_queries: SearchRow[];
  top_pages: SearchRow[];
  fetched_at: string;
};

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
];

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-3xl font-extrabold">{value}</CardTitle>
      </CardHeader>
      {hint ? <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent> : null}
    </Card>
  );
}

export default function SeoDashboard() {
  const isAdmin = useIsAdmin();
  const [days, setDays] = useState("28");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [properties, setProperties] = useState<string[] | null>(null);
  const [connected, setConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<{ event_name: string; path: string; created_at: string }[]>([]);

  const since = useMemo(
    () => new Date(Date.now() - Number(days) * 86_400_000).toISOString(),
    [days],
  );

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_name, path, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      toast.error("Could not load in-app analytics");
      return;
    }
    setEvents(data ?? []);
  }, [since]);

  const loadSnapshot = useCallback(async () => {
    const { data } = await supabase
      .from("seo_snapshots")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSnapshot((data as Snapshot | null) ?? null);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    void Promise.all([loadEvents(), loadSnapshot()]).finally(() => setLoading(false));
  }, [isAdmin, loadEvents, loadSnapshot]);

  const refresh = useCallback(
    async (siteUrl?: string) => {
      setRefreshing(true);
      try {
        const { data, error } = await supabase.functions.invoke("seo-snapshot", {
          body: siteUrl
            ? { action: "set_property", site_url: siteUrl }
            : { action: "refresh", days: Number(days), target_url: window.location.origin + "/" },
        });
        if (error) throw error;
        const result = data as { status?: string; properties?: string[]; snapshot?: Snapshot };
        if (result.status === "not_connected") {
          setConnected(false);
          return;
        }
        setConnected(true);
        if (result.status === "selection_required") {
          setProperties(result.properties ?? []);
          toast.message("Pick which Search Console property to monitor");
          return;
        }
        if (result.status === "no_property") {
          setProperties([]);
          toast.error("No verified Search Console property covers this site yet");
          return;
        }
        setProperties(null);
        if (siteUrl) {
          await refresh();
          return;
        }
        if (result.snapshot) setSnapshot(result.snapshot);
        toast.success("Search data refreshed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Refresh failed");
      } finally {
        setRefreshing(false);
      }
    },
    [days],
  );

  const inApp = useMemo(() => {
    const pageViews = events.filter((e) => e.event_name === "page_view").length;
    const conversions = events.filter((e) => CONVERSION_EVENTS.includes(e.event_name as never)).length;
    const ctaClicks = events.filter((e) => e.event_name === "cta_click").length;
    const topPaths = Object.entries(
      events
        .filter((e) => e.event_name === "page_view")
        .reduce<Record<string, number>>((acc, e) => {
          acc[e.path] = (acc[e.path] ?? 0) + 1;
          return acc;
        }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return { pageViews, conversions, ctaClicks, topPaths };
  }, [events]);

  if (isAdmin === null) return <Skeleton className="h-64 w-full" />;
  if (!isAdmin) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-extrabold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">You need admin access to view the SEO dashboard.</p>
      </div>
    );
  }

  const totals = snapshot?.totals;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">SEO &amp; traffic</h1>
          <p className="text-sm text-muted-foreground">
            Search impressions and clicks from Google, plus page views and conversions tracked in your app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => void refresh()} disabled={refreshing}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh search data
          </Button>
        </div>
      </header>

      {!connected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-4 w-4" /> Google Search Console not connected
            </CardTitle>
            <CardDescription>
              Connect Google Search Console so impressions, clicks, average position and top queries can be pulled in.
              In-app page views and conversions below already work.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {properties?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a Search Console property</CardTitle>
            <CardDescription>Several verified properties can cover this site.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {properties.map((p) => (
              <Button key={p} variant="outline" onClick={() => void refresh(p)} disabled={refreshing}>
                {p}
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Impressions"
          value={totals ? totals.impressions.toLocaleString() : "—"}
          hint={snapshot ? `${snapshot.range_start} → ${snapshot.range_end}` : "Refresh to load Google data"}
        />
        <Metric label="Clicks" value={totals ? totals.clicks.toLocaleString() : "—"} hint={totals ? `CTR ${pct(totals.ctr)}` : undefined} />
        <Metric label="Avg. position" value={totals ? totals.position.toFixed(1) : "—"} hint="Lower is better" />
        <Metric
          label="Conversions"
          value={inApp.conversions.toLocaleString()}
          hint={`${inApp.pageViews.toLocaleString()} page views · ${inApp.ctaClicks.toLocaleString()} CTA clicks`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top search queries</CardTitle>
            <CardDescription>How people find you on Google</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot?.top_queries?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Impr.</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Pos.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.top_queries.slice(0, 12).map((r) => (
                    <TableRow key={r.query}>
                      <TableCell className="font-medium">{r.query}</TableCell>
                      <TableCell className="text-right">{r.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.position.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No search data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top landing pages</CardTitle>
            <CardDescription>Google impressions vs. in-app page views</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {snapshot?.top_pages?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Impr.</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.top_pages.slice(0, 8).map((r) => (
                    <TableRow key={r.page}>
                      <TableCell className="max-w-[240px] truncate font-medium">{r.page}</TableCell>
                      <TableCell className="text-right">{r.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No Google page data yet.</p>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold">Most viewed paths (in-app)</h3>
              {loading ? (
                <Skeleton className="h-24 w-full" />
              ) : inApp.topPaths.length ? (
                <ul className="space-y-1 text-sm">
                  {inApp.topPaths.map(([path, count]) => (
                    <li key={path} className="flex justify-between gap-4">
                      <span className="truncate text-muted-foreground">{path}</span>
                      <span className="font-medium">{count.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No page views recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {snapshot ? (
        <p className="text-xs text-muted-foreground">
          Search data from {snapshot.site_url}, last refreshed {new Date(snapshot.fetched_at).toLocaleString()}.
        </p>
      ) : null}
    </div>
  );
}
