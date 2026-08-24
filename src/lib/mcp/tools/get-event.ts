import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_event",
  title: "Get event details",
  description:
    "Get one event the signed-in organizer can access, by event id or registration page slug, including a registration count.",
  inputSchema: {
    event_id: z.string().uuid().optional().describe("Event id."),
    slug: z.string().trim().min(1).optional().describe("Registration page slug, used when no event id is given."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ event_id, slug }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!event_id && !slug) {
      return { content: [{ type: "text", text: "Provide either event_id or slug." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase.from("events").select("*").limit(1);
    query = event_id ? query.eq("id", event_id) : query.eq("slug", slug!);
    const { data, error } = await query.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Event not found or not accessible." }], isError: true };

    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", data.id);

    const event = { ...data, registration_count: count ?? 0 };
    return {
      content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
      structuredContent: { event },
    };
  },
});
