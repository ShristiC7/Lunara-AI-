import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, Plus, ArrowRight, User as UserIcon, Heart, Send } from 'lucide-react';
import { communityService, Post, CommunityProfile } from '../services/community.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Community() {
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCommunity();
  }, []);

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const [profileData, postsData] = await Promise.all([
        communityService.getProfile(),
        communityService.getPosts()
      ]);
      setProfile(profileData);
      setPosts(postsData.posts);
      if (!profileData) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Failed to load community', err);
    }
    setLoading(false);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    try {
      const newProfile = await communityService.onboard(handleInput);
      setProfile(newProfile);
      setShowOnboarding(false);
    } catch (err) {
      alert('Handle taken or invalid');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setIsSubmitting(true);
    try {
      await communityService.createPost(postContent);
      setPostContent('');
      setIsCreatingPost(false);
      loadCommunity();
    } catch (err) {
      alert('Failed to create post');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-lunara-core border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Community Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Anonymous peer support for your health journey.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsCreatingPost(true)}
          className="rounded-full px-6"
        >
          <Plus size={18} className="mr-2" />
          Share a Post
        </Button>
      </header>

      {/* Post Creation Modal */}
      <AnimatePresence>
        {isCreatingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-slate-100"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Share with the Community</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  autoFocus
                  placeholder="What's on your mind? (Anonymous)"
                  className="w-full h-40 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-lunara-core/20 resize-none text-slate-700"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-2">
                    <button type="button" className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                      <Share2 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" type="button" onClick={() => setIsCreatingPost(false)}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Posting...' : 'Post Anonymously'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-3xl p-10 shadow-premium-xl border border-slate-100 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-lunara-mist rounded-full flex items-center justify-center mx-auto">
                <UserIcon className="text-lunara-core" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Choose your handle</h2>
                <p className="text-slate-500">Pick a name that will be shown on the community board. This cannot be changed later.</p>
              </div>
              <form onSubmit={handleOnboard} className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. Lavender_Fox"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-lunara-core/30 focus:bg-white outline-none transition-all text-center text-lg font-medium"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  required
                />
                <Button variant="primary" className="w-full py-4 rounded-2xl text-lg group" type="submit">
                  Start Exploring
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-lunara-core/10 transition-all cursor-pointer group">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <UserIcon size={20} className="text-slate-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">@{post.authorHandle}</span>
                    <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center gap-6 pt-2 border-t border-slate-50 mt-4 text-slate-400">
                    <button className="flex items-center gap-2 hover:text-lunara-core transition-colors group">
                      <Heart size={18} className="group-active:scale-125 transition-transform" />
                      <span className="text-xs font-semibold">24</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-lunara-core transition-colors">
                      <MessageSquare size={18} />
                      <span className="text-xs font-semibold">{post._count.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-lunara-core transition-colors ml-auto">
                      <Send size={16} />
                      <span className="text-xs font-semibold">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No posts yet. Be the first to start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}
