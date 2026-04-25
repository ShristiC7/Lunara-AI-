import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@lunara.dev' },
    update: {},
    create: {
      email: 'test@lunara.dev',
      passwordHash,
      displayName: 'Test User',
    },
  });

  // Create 3 cycles with 28-day spacing
  const now = new Date();
  
  const cycle1Start = new Date(now);
  cycle1Start.setDate(now.getDate() - 84); // ~3 months ago
  const cycle1End = new Date(cycle1Start);
  cycle1End.setDate(cycle1Start.getDate() + 5);

  const cycle2Start = new Date(cycle1Start);
  cycle2Start.setDate(cycle1Start.getDate() + 28);
  const cycle2End = new Date(cycle2Start);
  cycle2End.setDate(cycle2Start.getDate() + 5);

  const cycle3Start = new Date(cycle2Start);
  cycle3Start.setDate(cycle2Start.getDate() + 28);
  const cycle3End = new Date(cycle3Start);
  cycle3End.setDate(cycle3Start.getDate() + 5);

  await prisma.cycle.createMany({
    data: [
      { userId: user.id, startDate: cycle1Start, endDate: cycle1End, cycleLength: 28 },
      { userId: user.id, startDate: cycle2Start, endDate: cycle2End, cycleLength: 28 },
      { userId: user.id, startDate: cycle3Start, endDate: cycle3End, cycleLength: 28 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete. Test user: test@lunara.dev / TestPassword123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
