import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_support_tickets",
  title: "List support tickets",
  description: "List the signed-in user's support tickets with status and priority.",
  inputSchema: {
    status: z.string().optional().describe("Filter by ticket status, e.g. open, closed."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("support_tickets")
      .select("id, ticket_number, subject, description, status, priority, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status as never);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tickets: data ?? [] },
    };
  },
});
