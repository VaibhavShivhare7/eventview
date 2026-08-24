import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type AuthorizationDetails = {
  client?: { name?: string | null; client_name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error: detailsError } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error: decideError } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "this app";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 sm:p-7">
          {error ? (
            <>
              <h1 className="text-xl font-display font-bold mb-2">Authorization failed</h1>
              <p className="text-sm text-muted-foreground">Could not load this authorization request: {error}</p>
            </>
          ) : !details ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <h1 className="text-xl font-display font-bold mb-2">Connect {clientName} to your account</h1>
              <p className="text-sm text-muted-foreground mb-6">
                {clientName} will be able to read your events and attendees and check attendees in, acting as you.
              </p>
              <div className="flex gap-3">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  Approve
                </Button>
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  Deny
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
