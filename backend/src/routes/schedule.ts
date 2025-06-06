// src/routes/schedule.ts

import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /schedule/status?provider=MEA
router.get("/status", async (req, res) => {
  const prov = (req.query.provider as string)?.toUpperCase();
  if (prov !== "MEA" && prov !== "PEA") {
    return res.status(400).json({ error: "provider must be MEA or PEA" });
  }

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  try {
    const sched = await prisma.schedule.findFirst({
      where: {
        provider: prov,
        date: { gte: today, lt: tomorrow },
      },
    });
    if (!sched) return res.status(404).json({ error: "No schedule found for today" });

    if (now >= sched.peakStart && now < sched.peakEnd) {
      return res.json({
        status: "peak",
        peakEndsAt: sched.peakEnd,
        countdownMs: sched.peakEnd.getTime() - now.getTime(),
      });
    } else if (now < sched.peakStart) {
      return res.json({
        status: "off-peak",
        nextPeakStartsAt: sched.peakStart,
        countdownMs: sched.peakStart.getTime() - now.getTime(),
      });
    } else {
      // after today's peak 
      return res.json({
        status: "off-peak",
        nextPeakStartsAt: null, 
        countdownMs: null,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /schedule/all?provider=MEA&date=2025-06-07
router.get("/all", async (req, res) => {
  const prov = (req.query.provider as string)?.toUpperCase();
  const dateParam = req.query.date as string; // e.g. "2025-06-07"
  if (prov !== "MEA" && prov !== "PEA") {
    return res.status(400).json({ error: "provider must be MEA or PEA" });
  }
  if (!dateParam) return res.status(400).json({ error: "date query missing" });

  try {
    const day = new Date(dateParam + "T00:00:00+07:00");
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

    const sched = await prisma.schedule.findFirst({
      where: {
        provider: prov,
        date: { gte: day, lt: nextDay },
      },
    });
    if (!sched) return res.status(404).json({ error: "No schedule on that date" });

    res.json(sched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
