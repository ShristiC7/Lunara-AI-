import { z } from 'zod';

export const logSymptomSchema = z.object({
  body: z.object({
    date: z.string().datetime({ offset: true }).or(z.string().datetime()),
    cycleId: z.string().uuid().optional(),
    mood: z.number().int().min(1).max(5).optional(),
    energyLevel: z.number().int().min(1).max(5).optional(),
    flowIntensity: z.number().int().min(0).max(4).optional(),
    painLevel: z.number().int().min(0).max(5).optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const updateSymptomSchema = z.object({
  body: z.object({
    date: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
    cycleId: z.string().uuid().optional().nullable(),
    mood: z.number().int().min(1).max(5).optional().nullable(),
    energyLevel: z.number().int().min(1).max(5).optional().nullable(),
    flowIntensity: z.number().int().min(0).max(4).optional().nullable(),
    painLevel: z.number().int().min(0).max(5).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  }),
});
