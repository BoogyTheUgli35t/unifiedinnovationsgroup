import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAccountsTool from "./tools/list-accounts";
import listTransactionsTool from "./tools/list-transactions";
import getPortfolioTool from "./tools/get-portfolio";
import listSupportTicketsTool from "./tools/list-support-tickets";
import createSupportTicketTool from "./tools/create-support-ticket";
import getProfileTool from "./tools/get-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "uig-apex-portal",
  title: "UIG Apex Portal",
  version: "0.1.0",
  instructions:
    "Tools for the UIG Apex Portal digital banking app. All tools act as the signed-in user: read accounts, transactions, crypto holdings, profile and support tickets, and open new support tickets.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfileTool,
    listAccountsTool,
    listTransactionsTool,
    getPortfolioTool,
    listSupportTicketsTool,
    createSupportTicketTool,
  ],
});
