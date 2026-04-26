import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating demo user Rii...');

  // 1. Create Rii
  const passwordHash = await bcrypt.hash('DemoPassword123!', 12);
  const rii = await prisma.user.upsert({
    where: { email: 'rii@lunara.dev' },
    update: {},
    create: {
      email: 'rii@lunara.dev',
      passwordHash,
      displayName: 'Rii',
      bio: 'Lover of tea, yoga, and deep sleep. Tracking for hormonal balance.',
    },
  });

  // 2. Create Community Profile
  const profile = await prisma.communityProfile.upsert({
    where: { userId: rii.id },
    update: {},
    create: {
      userId: rii.id,
      handle: 'rii_wellness',
    },
  });

  // 3. Create historical cycles (last 3 months)
  const now = new Date();
  
  // Cycle 1: 3 months ago
  const c1Start = new Date(now);
  c1Start.setDate(now.getDate() - 88);
  const c1End = new Date(c1Start);
  c1End.setDate(c1Start.getDate() + 5);

  // Cycle 2: 2 months ago
  const c2Start = new Date(now);
  c2Start.setDate(now.getDate() - 60);
  const c2End = new Date(c2Start);
  c2End.setDate(c2Start.getDate() + 4);

  // Cycle 3: 1 month ago
  const c3Start = new Date(now);
  c3Start.setDate(now.getDate() - 32);
  const c3End = new Date(c3Start);
  c3End.setDate(c3Start.getDate() + 5);

  // Current Cycle: Started 4 days ago
  const c4Start = new Date(now);
  c4Start.setDate(now.getDate() - 4);

  await prisma.cycle.deleteMany({ where: { userId: rii.id } });
  
  const cycles = await Promise.all([
    prisma.cycle.create({ data: { userId: rii.id, startDate: c1Start, endDate: c1End, cycleLength: 28 } }),
    prisma.cycle.create({ data: { userId: rii.id, startDate: c2Start, endDate: c2End, cycleLength: 28 } }),
    prisma.cycle.create({ data: { userId: rii.id, startDate: c3Start, endDate: c3End, cycleLength: 28 } }),
    prisma.cycle.create({ data: { userId: rii.id, startDate: c4Start } }),
  ]);

  const currentCycle = cycles[3];

  // 4. Add Symptoms for the last 10 days
  const symptomsData = [];
  for (let i = 10; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Logic for symptom intensity based on cycle day
    // Day 1-5: High pain, low energy
    // Day 6-12: High energy, good mood
    const dayOfCycle = i <= 4 ? 4 - i + 1 : 28 - (i - 4); // Simplified
    
    symptomsData.push({
      userId: rii.id,
      cycleId: i <= 4 ? currentCycle.id : cycles[2].id,
      date,
      mood: i <= 4 ? 3 : 5,
      energyLevel: i <= 4 ? 2 : 4,
      painLevel: i <= 4 ? 6 : 1,
      flowIntensity: i <= 4 ? 3 : 0,
      notes: i === 4 ? "Period started. Feeling a bit heavy today." : i === 0 ? "Energy coming back! Looking forward to the week." : null,
    });
  }

  await prisma.symptom.deleteMany({ where: { userId: rii.id } });
  await prisma.symptom.createMany({ data: symptomsData });

  // 5. Add AI Insights
  await prisma.aiInsight.deleteMany({ where: { userId: rii.id } });
  await prisma.aiInsight.create({
    data: {
      userId: rii.id,
      insightType: 'SYMPTOM_ANALYSIS',
      status: 'completed',
      content: {
        summary: "Your energy levels consistently dip 2 days before your period starts.",
        recommendations: [
          "Increase magnesium intake during your luteal phase.",
          "Schedule high-intensity workouts for the follicular phase (next week)."
        ],
        confidence: 0.89
      } as any,
    }
  });

  // 6. Add Community Posts
  await prisma.post.deleteMany({ where: { profileId: profile.id } });
  const post1 = await prisma.post.create({
    data: {
      profileId: profile.id,
      authorHandle: profile.handle,
      content: "Just started my follicular phase! 🌿 Feeling so much more productive today. Anyone else find their creative spark comes back right after their period ends?",
    }
  });

  await prisma.post.create({
    data: {
      profileId: profile.id,
      authorHandle: profile.handle,
      content: "Does anyone have good recommendations for herbal teas that help with luteal phase bloating? 🍵",
    }
  });

  // 7. Add a comment from another user
  const testUser = await prisma.user.findUnique({ where: { email: 'test@lunara.dev' } });
  if (testUser) {
    let testProfile = await prisma.communityProfile.findUnique({ where: { userId: testUser.id } });
    if (!testProfile) {
      testProfile = await prisma.communityProfile.create({
        data: { userId: testUser.id, handle: 'test_user' }
      });
    }

    await prisma.comment.create({
      data: {
        postId: post1.id,
        profileId: testProfile.id,
        authorHandle: testProfile.handle,
        content: "Totally agree! I always schedule my big projects for this week. 🚀",
      }
    });
  }

  console.log('✅ Rii is ready! Login: rii@lunara.dev / DemoPassword123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
