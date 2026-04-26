import { Request, Response } from 'express';
import { communityService } from '../services/community.service';
import { asyncHandler } from '../utils/errors';

export const communityController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await communityService.getProfile(req.userId!);
    res.json({ success: true, data: profile });
  }),

  onboard: asyncHandler(async (req: Request, res: Response) => {
    const { handle } = req.body;
    const profile = await communityService.createProfile(req.userId!, handle);
    res.status(201).json({ success: true, data: profile });
  }),

  getPosts: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await communityService.getPosts(page, limit);
    res.json({ success: true, data: result });
  }),

  createPost: asyncHandler(async (req: Request, res: Response) => {
    const { content, symptomSummary } = req.body;
    const post = await communityService.createPost(req.userId!, content, symptomSummary);
    res.status(201).json({ success: true, data: post });
  }),

  getPostDetail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await communityService.getPostById(id as string);
    res.json({ success: true, data: post });
  }),

  addComment: asyncHandler(async (req: Request, res: Response) => {
    const { id: postId } = req.params;
    const { content } = req.body;
    const comment = await communityService.addComment(req.userId!, postId as string, content);
    res.status(201).json({ success: true, data: comment });
  }),
};
