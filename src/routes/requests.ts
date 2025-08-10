import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../auth.js";
import { z } from "zod";

export const requests = Router();

requests.get("/", async (req, res) => {
  try {
    const { email } = await requireAuth(req.headers.authorization);
    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email } });
    const data = await prisma.request.findMany({ where: { userId: user.id }, include: { agency: true } });
    res.json(data);
  } catch (e:any) { res.status(401).json({ error: e.message }); }
});

requests.post("/", async (req, res) => {
  try {
    const { email } = await requireAuth(req.headers.authorization);
    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email } });

    const schema = z.object({
      title: z.string().min(1),
      body: z.string().default(""),
      delivery: z.enum(["proxy","self","pdf"]).default("proxy"),
      private: z.boolean().default(true),
      agencyName: z.string().optional(),
      appealType: z.string().optional(),
      appealWindow: z.string().optional(),
      appealTarget: z.string().optional()
    });
    const input = schema.parse(req.body);

    let agencyId: string | undefined;
    if (input.agencyName) {
      const agency = await prisma.agency.upsert({
        where: { name: input.agencyName }, update: {},
        create: { name: input.agencyName, jurisdiction: "Unknown" }
      });
      agencyId = agency.id;
    }

    const created = await prisma.request.create({
      data: {
        userId: user.id, agencyId,
        title: input.title, body: input.body,
        delivery: input.delivery, status: "Draft", private: input.private,
        appealType: input.appealType, appealWindow: input.appealWindow, appealTarget: input.appealTarget
      }
    });
    res.status(201).json(created);
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});
