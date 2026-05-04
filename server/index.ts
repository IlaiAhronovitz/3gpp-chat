import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load knowledge base at startup
function loadKnowledge(): string {
  const knowledgeDir = join(__dirname, "knowledge");
  const files = [
    "SKILL.md",
    "references/releases.md",
    "references/phy-layer.md",
    "references/working-groups.md",
  ];

  let systemPrompt = "";
  for (const file of files) {
    try {
      const content = readFileSync(join(knowledgeDir, file), "utf-8");
      systemPrompt += `\n\n--- ${file} ---\n\n${content}`;
    } catch (e) {
      console.warn(`Warning: Could not load ${file}`);
    }
  }
  return systemPrompt.trim();
}

const knowledgeBase = loadKnowledge();
console.log(
  `Loaded knowledge base: ${knowledgeBase.length} characters from ${4} files`
);

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = join(__dirname, "..", "dist");
  app.use(express.static(distPath));
}

// Chat endpoint with streaming
app.post("/api/chat", async (req, res) => {
  const { messages, apiKey, model } = req.body;

  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    res.status(400).json({
      error:
        "No API key configured. Set ANTHROPIC_API_KEY in .env or provide it in Settings.",
    });
    return;
  }

  const client = new Anthropic({ apiKey: resolvedKey });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  let closed = false;

  try {
    const stream = await client.messages.create({
      model: model || "claude-sonnet-4-6",
      max_tokens: 8192,
      system: knowledgeBase,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    for await (const event of stream) {
      if (closed) break;
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(
          `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
        );
      }
    }

    if (!closed) {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[chat] Error:", message);
    if (!closed) {
      closed = true;
      if (res.headersSent) {
        try {
          res.write(
            `data: ${JSON.stringify({ type: "error", error: message })}\n\n`
          );
        } catch {}
        res.end();
      } else {
        res.status(500).json({ error: message });
      }
    }
  }
});

// SPA fallback in production
if (process.env.NODE_ENV === "production") {
  const distPath = join(__dirname, "..", "dist");
  app.get("*", (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
