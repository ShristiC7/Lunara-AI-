import { CycleService } from '../services/cycle.service';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    cycle: {
      findMany: jest.fn(),
    },
  },
}));

describe('Cycle Stats Calculation', () => {
  it('calculates stats correctly for historical cycles', async () => {
    const mockCycles = [
      {
        id: '1',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-05'),
        cycleLength: 28,
        symptoms: [
          { flowIntensity: 4, painLevel: 5 }, // Heavy flow, High pain
        ],
      },
      {
        id: '2',
        startDate: new Date('2023-01-29'),
        endDate: new Date('2023-02-02'),
        cycleLength: 30,
        symptoms: [
          { mood: 1, energyLevel: 1 }, // Low mood, Low energy
        ],
      },
    ];

    (prisma.cycle.findMany as jest.Mock).mockResolvedValue(mockCycles);

    const stats = await CycleService.getStats('user-123');

    expect(stats.averageCycleLength).toBe(29); // (28+30)/2
    expect(stats.averagePeriodLength).toBe(4); // both are 4 days
    expect(stats.mostCommonSymptoms).toContain('Heavy Flow');
    expect(stats.mostCommonSymptoms).toContain('High Pain');
    expect(stats.mostCommonSymptoms).toContain('Low Mood');
    expect(stats.regularityScore).toBeLessThan(100); // Varied by 2 days, stdDev > 0
  });

  it('returns default stats for no data', async () => {
    (prisma.cycle.findMany as jest.Mock).mockResolvedValue([]);

    const stats = await CycleService.getStats('user-123');

    expect(stats.averageCycleLength).toBe(0);
    expect(stats.regularityScore).toBe(100);
  });
});
