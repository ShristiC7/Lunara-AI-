import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

const onboardSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
});

const postSchema = z.object({
  content: z.string().min(1).max(2000),
  symptomSummary: z.any().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

const validate = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    next(err);
  }
};

router.use(authMiddleware);

router.get('/profile', communityController.getProfile);
router.post('/onboard', validate(onboardSchema), communityController.onboard);

router.get('/posts', communityController.getPosts);
router.post('/posts', validate(postSchema), communityController.createPost);
router.get('/posts/:id', communityController.getPostDetail);
router.post('/posts/:id/comments', validate(commentSchema), communityController.addComment);

export default router;
