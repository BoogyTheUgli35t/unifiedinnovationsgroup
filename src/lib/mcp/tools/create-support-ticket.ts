import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_support_ticket",
  title: "Create support ticket",
  description: "Open a new support ticket for the signed-in user.",
  inputSchema: {
    subject: z.string().trim().min(1).describe("Short ticket subject."),
    description: z.string().trim().min(1).describe("Detailed description of the issue."),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("Ticket priority (default medium)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ subject, description, priority }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: ctx.getUserId(),
        subject,
        description,
        ticket_number: ticketNumber,
        ...(priority ? { priority: priority as never } : {}),
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created ticket ${data?.ticket_number}` }],
      structuredContent: { ticket: data },
    };
  },
});
