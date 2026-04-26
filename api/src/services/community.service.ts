import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export const communityService = {
  async getProfile(userId: string) {
    return prisma.communityProfile.findUnique({
      where: { userId },
    });
  },

  async createProfile(userId: string, handle: string) {
    // Check if handle already exists
    const existingHandle = await prisma.communityProfile.findUnique({
      where: { handle },
    });

    if (existingHandle) {
      throw new AppError('Handle already taken', 400);
    }

    // Check if user already has a profile
    const existingProfile = await prisma.communityProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new AppError('Profile already exists for this user', 400);
    }

    return prisma.communityProfile.create({
      data: {
        userId,
        handle,
      },
    });
  },

  async createPost(userId: string, content: string, symptomSummary?: any) {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new AppError('Community profile not found. Please onboard first.', 404);
    }

    return prisma.post.create({
      data: {
        profileId: profile.id,
        authorHandle: profile.handle,
        content,
        symptomSummary: symptomSummary || null,
      },
    });
  },

  async getPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getPostById(postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return post;
  },

  async addComment(userId: string, postId: string, content: string) {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new AppError('Community profile not found', 404);
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return prisma.comment.create({
      data: {
        postId,
        profileId: profile.id,
        authorHandle: profile.handle,
        content,
      },
    });
  },
};
