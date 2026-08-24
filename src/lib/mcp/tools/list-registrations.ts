import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_registrations",
  title: "List event registrations",
  description:
    "List registrations (attendees) for an event the signed-in organizer can access, including status, VIP flag and check-in time.",
  inputSchema: {
    event_id: z.string().uuid().describe("Event id to list registrations for."),
    status: z
      .enum(["confirmed", "pending", "waitlisted", "cancelled"])
      .optional()
      .describe("Only return registrations with this status."),
    checked_in: z.boolean().optional().describe("Filter by whether the attendee has checked in."),
    limit: z.number().int().min(1).max(200).default(50).describe("Maximum registrations to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ event_id, status, checked_in, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("registrations")
      .select("id, event_id, status, is_vip, notes, checked_in_at, created_at, data")
      .eq("event_id", event_id)
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) query = query.eq("status", status);
    if (checked_in === true) query = query.not("checked_in_at", "is", null);
    if (checked_in === false) query = query.is("checked_in_at", null);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { registrations: data ?? [] },
    };
  },
});
