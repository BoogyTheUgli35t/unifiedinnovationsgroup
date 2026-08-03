import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_transactions",
  title: "List transactions",
  description: "List the signed-in user's recent transactions, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("How many transactions to return (default 20)."),
    account_id: z.string().uuid().optional().describe("Only return transactions for this account id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, account_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("transactions")
      .select("id, account_id, type, status, amount, currency, description, counterparty, transfer_method, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (account_id) query = query.eq("account_id", account_id);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { transactions: data ?? [] },
    };
  },
});
