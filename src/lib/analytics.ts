import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ev-analytics-session";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export type AnalyticsEventName =
  | "page_view"
  | "cta_click"
  | "registration_started"
  | "registration_completed"
  | "signup_completed"
  | "event_published";

/** Conversion events shown as "conversions" in the SEO dashboard. */
export const CONVERSION_EVENTS: AnalyticsEventName[] = [
  "registration_completed",
  "signup_completed",
  "event_published",
];

/** Fire-and-forget event tracking. Never throws, never blocks the UI. */
export async function track(
  eventName: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      session_id: sessionId(),
      user_id: data.session?.user?.id ?? null,
      metadata: metadata as never,
    });
  } catch {
    // analytics must never break the app
  }
}

export function trackPageView(path: string): void {
  void track("page_view", { title: document.title, path });
}
