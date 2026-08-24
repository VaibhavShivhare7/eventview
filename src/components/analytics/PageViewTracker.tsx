import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/** Records a page_view on first load and on every client-side route change. */
export function PageViewTracker() {
  const { pathname, search } = useLocation();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const key = pathname + search;
    if (last.current === key) return;
    last.current = key;
    trackPageView(key);
  }, [pathname, search]);

  return null;
}
