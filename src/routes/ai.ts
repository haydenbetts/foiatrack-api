import { Router } from "express";
import { requireAuth } from "../auth.js";
import OpenAI from "openai";
import { z } from "zod";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
export const ai = Router();

ai.post("/draft", async (req, res) => {
  try {
    await requireAuth(req.headers.authorization);
    const schema = z.object({
      title: z.string().default("Public records request"),
      records: z.string(),
      lawName: z.string().optional(),
      statuteCitation: z.string().optional(),
      appealAuthority: z.string().optional(),
      appealWindow: z.string().optional(),
      dontAssertRules: z.boolean().default(true)
    });
    const input = schema.parse(req.body);

    const prompt = `Draft a concise public-records request. Use the details below but DO NOT assert deadlines or fee rules unless explicitly provided.

Title: ${input.title}
Law name: ${input.lawName ?? "applicable public records law"}
Statute: ${input.statuteCitation ?? "(not provided)"}
Appeal authority: ${input.appealAuthority ?? "(not provided)"}
Appeal window: ${input.appealWindow ?? "(not provided)"}
Dont-assert-rules: ${input.dontAssertRules}

Describe records:
${input.records}`;

    if (!client) return res.json({ text: `DUMMY DRAFT (no OPENAI_API_KEY set):\n\n${prompt.slice(0, 500)}` });

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });
    res.json({ text: resp.choices[0]?.message?.content?.trim() || "" });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});
