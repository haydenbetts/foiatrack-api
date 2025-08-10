import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@foiatrack.app" }, update: {},
    create: { email: "demo@foiatrack.app", name: "Demo User" }
  });
  const agency = await prisma.agency.upsert({
    where: { name: "DHS" }, update: {},
    create: { name: "DHS", jurisdiction: "Federal", emails: ["foia@dhs.gov"] }
  });
  await prisma.request.create({
    data: { userId: user.id, agencyId: agency.id, title: "All email communications re: X program (Jan–Mar 2024)",
      body: "Describe records…", delivery: "proxy", status: "Draft", private: true, statutoryDue: "TBD", appealType: "FOIA" }
  });
}
main().finally(()=>prisma.$disconnect());
