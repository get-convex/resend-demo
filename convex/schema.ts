import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { vEmailId } from "@convex-dev/resend";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  emails: defineTable({
    userId: v.id("users"),
    emailId: vEmailId,
    subject: v.string(),
    to: v.string(),
  }).index("userId", ["userId"]),
});
