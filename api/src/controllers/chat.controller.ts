import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import { asyncHandler } from '../utils/errors';

export const chatController = {
  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const { prompt, history } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const result = await chatService.getResponse(req.userId!, prompt, history || []);
    res.json({ success: true, data: result });
  }),
};
