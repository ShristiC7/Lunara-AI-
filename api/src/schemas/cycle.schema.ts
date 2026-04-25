import { z } from 'zod';

export const createCycleSchema = z.object({
  body: z.object({
    startDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
    endDate: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  }).refine(data => {
    if (data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: "endDate must be strictly greater than or equal to startDate",
    path: ["endDate"],
  }),
});

export const updateCycleSchema = z.object({
  body: z.object({
    startDate: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
    endDate: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true; // We can't cross-validate if both aren't provided in the patch, service handles it if necessary
  }, {
    message: "endDate must be strictly greater than or equal to startDate",
    path: ["endDate"],
  }),
});
