// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Create two sample users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      passwordHash: "hashedpassword1", // (in real code, use bcrypt.hash)
      provider: "MEA",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      passwordHash: "hashedpassword2",
      provider: "PEA",
    },
  });

  // 2) Insert schedule rows for June 7, 2025
  const date = new Date("2025-06-07T00:00:00+07:00");
  const peakStartMEA = new Date("2025-06-07T17:00:00+07:00");
  const peakEndMEA   = new Date("2025-06-07T20:00:00+07:00");

  await prisma.schedule.upsert({
    where: { date_provider: { date, provider: "MEA" } },
    create: {
      provider: "MEA",
      date,
      peakStart: peakStartMEA,
      peakEnd: peakEndMEA,
    },
    update: {
      peakStart: peakStartMEA,
      peakEnd: peakEndMEA,
    },
  });

  const peakStartPEA = new Date("2025-06-07T18:00:00+07:00");
  const peakEndPEA   = new Date("2025-06-07T21:00:00+07:00");

  await prisma.schedule.upsert({
    where: { date_provider: { date, provider: "PEA" } },
    create: {
      provider: "PEA",
      date,
      peakStart: peakStartPEA,
      peakEnd: peakEndPEA,
    },
    update: {
      peakStart: peakStartPEA,
      peakEnd: peakEndPEA,
    },
  });

  // 3) Create sample notes for Alice & Bob (these will appear in the home‐screen carousel)
  await prisma.note.createMany({
    data: [
      {
        userId: alice.id,
        content: "Remember to run the washing machine at 9 PM for cheaper rates.",
        synced: true,
      },
      {
        userId: alice.id,
        content: "Buy LED bulbs this weekend to save on electricity.",
        synced: false,
      },
      {
        userId: bob.id,
        content: "Set phone on airplane mode during peak hours to reduce phantom drain.",
        synced: true,
      },
    ],
  });

  console.log("🌱 Database seeded with sample Users, Schedules, and Notes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
