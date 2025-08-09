import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  documents: defineTable({
    userId: v.optional(v.id("users")),
    originalFileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    scribbleStyle: v.string(),
    intensity: v.number(),
    caption: v.optional(v.string()),
    processedFileId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  scribblePresets: defineTable({
    name: v.string(),
    style: v.string(),
    paths: v.array(v.string()),
    colors: v.array(v.string()),
    intensity: v.number(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
