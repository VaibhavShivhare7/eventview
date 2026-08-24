import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listEventsTool from "./tools/list-events";
import getEventTool from "./tools/get-event";
import listRegistrationsTool from "./tools/list-registrations";
import checkInAttendeeTool from "./tools/check-in-attendee";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "remix-of-event-registration-page-template",
  title: "Remix of Event Registration Page Template",
  version: "0.1.0",
  instructions:
    "Tools for the event view registration platform. Use `list_events` to find the signed-in organizer's events, `get_event` for full details of one event, `list_registrations` to see attendees, and `check_in_attendee` to check someone in at the door.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listEventsTool, getEventTool, listRegistrationsTool, checkInAttendeeTool],
});
