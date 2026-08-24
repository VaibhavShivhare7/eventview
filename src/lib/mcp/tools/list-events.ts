import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_events",
  title: "List events",
  description:
    "List the events the signed-in organizer can access, with date, status, location and registration link slug.",
  inputSchema: {
    status: z
      .enum(["draft", "published", "cancelled", "completed"])
      .optional()
      .describe("Only return events with this status."),
    limit: z.number().int().min(1).max(100).default(20).describe("Maximum events to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("events")
      .select(
        "id, name, slug, status, event_date, event_end_date, timezone, location_type, location_value, capacity, registration_limit, ticket_price",
      )
      .order("event_date", { ascending: false })
      .limit(limit ?? 20);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
