import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateToddlerCaption = action({
  args: {
    fileName: v.string(),
    scribbleStyle: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate a short, adorable toddler-style caption for a document that has been "decorated" with ${args.scribbleStyle} scribbles. The document is called "${args.fileName}". 

The caption should be:
- Written as if by a 2-4 year old
- Apologetic but innocent
- Include simple spelling mistakes or phonetic spelling
- Be 1-2 sentences max
- Examples: "I sorry I color", "I maked it pretty", "Oopsie I drew on it", "I help you daddy"

Generate just the caption text, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "I sorry I drew on it";
  },
});

export const generateScribblePaths = action({
  args: {
    style: v.string(),
    intensity: v.number(),
    canvasWidth: v.number(),
    canvasHeight: v.number(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate SVG path data for ${args.style} toddler scribbles on a ${args.canvasWidth}x${args.canvasHeight} canvas. 
    
Intensity level: ${args.intensity}/10 (higher = more scribbles)

Create ${Math.floor(args.intensity * 2)} different scribble paths that look like:
- ${args.style === 'crayon' ? 'Thick, waxy crayon marks with irregular pressure' : ''}
- ${args.style === 'marker' ? 'Bold marker strokes with some bleeding effects' : ''}
- ${args.style === 'pencil' ? 'Light pencil sketches with varying pressure' : ''}
- ${args.style === 'finger_paint' ? 'Smudgy finger painting with organic shapes' : ''}

Return as JSON array of objects with "path" (SVG path string) and "color" (hex color) properties.
Make paths look authentically childlike - wobbly, imperfect, and random.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.9,
    });

    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content || "[]");
    } catch (error) {
      // Fallback to simple scribbles if AI response isn't valid JSON
      return [
        { path: `M${Math.random() * args.canvasWidth},${Math.random() * args.canvasHeight} Q${Math.random() * args.canvasWidth},${Math.random() * args.canvasHeight} ${Math.random() * args.canvasWidth},${Math.random() * args.canvasHeight}`, color: "#FF6B6B" },
        { path: `M${Math.random() * args.canvasWidth},${Math.random() * args.canvasHeight} L${Math.random() * args.canvasWidth},${Math.random() * args.canvasHeight}`, color: "#4ECDC4" },
      ];
    }
  },
});
