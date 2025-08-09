import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    originalFileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    scribbleStyle: v.string(),
    intensity: v.number(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    return await ctx.db.insert("documents", {
      userId: userId || undefined,
      originalFileId: args.originalFileId,
      fileName: args.fileName,
      fileType: args.fileType,
      scribbleStyle: args.scribbleStyle,
      intensity: args.intensity,
      caption: args.caption,
      createdAt: Date.now(),
    });
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) return null;

    const originalUrl = await ctx.storage.getUrl(document.originalFileId);
    const processedUrl = document.processedFileId 
      ? await ctx.storage.getUrl(document.processedFileId)
      : null;

    return {
      ...document,
      originalUrl,
      processedUrl,
    };
  },
});

export const getUserDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    return Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        originalUrl: await ctx.storage.getUrl(doc.originalFileId),
        processedUrl: doc.processedFileId 
          ? await ctx.storage.getUrl(doc.processedFileId)
          : null,
      }))
    );
  },
});

export const updateProcessedFile = mutation({
  args: {
    documentId: v.id("documents"),
    processedFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      processedFileId: args.processedFileId,
    });
  },
});
