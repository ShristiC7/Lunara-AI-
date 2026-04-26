import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, Plus, ArrowRight, User as UserIcon, Heart, Send, Sparkles, Shield } from 'lucide-react';
import { communityService, type Post, type CommunityProfile } from '../services/community.service';
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
        communityService.getProfile().catch(() => null),
        communityService.getPosts().catch(() => ({ posts: [] }))
      ]);
      
      setProfile(profileData);
      // Defensive check for postsData
      setPosts(postsData?.posts || []);
      
      if (!profileData) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Failed to load community', err);
      setPosts([]); // Fallback to empty list instead of crashing
    } finally {
      setLoading(false);
    }
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
        <div className="w-10 h-10 border-3 border-lunara-core/20 border-t-lunara-core rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Background Orbs */}
      <div className="hero-orb top-[10%] right-[-10%] hero-orb-pink animate-float opacity-20" />
      <div className="hero-orb bottom-[20%] left-[-10%] hero-orb-peach animate-float opacity-10" style={{ animationDelay: '3s' }} />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Community Board</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-accent-lavender-deep" />
            Anonymous peer support for your health journey.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsCreatingPost(true)}
          className="rounded-full px-8 py-3 bg-gradient-to-r from-lunara-core to-lunara-glow hover:shadow-lg hover:shadow-lunara-core/20 transition-all group"
        >
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Share a Moment
        </Button>
      </header>

      {/* Post Creation Modal */}
      <AnimatePresence>
        {isCreatingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-2xl shadow-2xl border border-white/20 relative overflow-hidden"
            >
              {/* Subtle accent inside modal */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-pink-soft via-accent-lavender to-accent-peach-soft" />
              
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Write a Post</h2>
              <p className="text-slate-500 mb-8 text-sm italic">Your identity is protected by your handle.</p>
              
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="relative">
                  <textarea
                    autoFocus
                    placeholder="What's on your mind today?"
                    className="w-full h-48 p-6 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-lunara-core/5 focus:bg-white focus:border-lunara-core/20 outline-none resize-none text-slate-700 text-lg transition-all"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {postContent.length}/500
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-lunara-mist flex items-center justify-center">
                      <Sparkles size={14} className="text-lunara-core" />
                    </div>
                    <span className="text-xs font-medium">Keep it supportive</span>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" type="button" onClick={() => setIsCreatingPost(false)} className="px-6">Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting || !postContent.trim()} className="px-8 bg-slate-900 text-white rounded-full">
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-premium-xl border border-slate-100 text-center space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary" />
              <div className="w-24 h-24 bg-lunara-mist rounded-[32px] flex items-center justify-center mx-auto shadow-inner transform -rotate-3">
                <UserIcon className="text-lunara-core" size={40} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Choose your handle</h2>
                <p className="text-slate-500 leading-relaxed">This is your anonymous identity. It will be shown next to your posts and cannot be changed.</p>
              </div>
              <form onSubmit={handleOnboard} className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-primary rounded-2xl opacity-20 group-focus-within:opacity-40 transition-opacity blur" />
                  <input
                    type="text"
                    placeholder="e.g. Lunar_Glow"
                    className="relative w-full px-8 py-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-lunara-core/30 outline-none transition-all text-center text-xl font-heading font-bold tracking-tight shadow-sm"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    required
                  />
                </div>
                <Button variant="primary" className="w-full py-5 rounded-2xl text-lg font-bold group bg-lunara-core shadow-lg shadow-lunara-core/20" type="submit">
                  Start Exploring
                  <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-6 relative z-10">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card variant="premium" className="hover:scale-[1.01] transition-all cursor-pointer group border-none p-8">
              <div className="flex gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0 shadow-sm">
                  <UserIcon size={24} className="text-slate-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">@{post.authorHandle}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[17px]">{post.content}</p>
                  
                  <div className="flex items-center gap-8 pt-6 border-t border-slate-50 mt-4 text-slate-400">
                    <button className="flex items-center gap-2.5 hover:text-accent-pink-main transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-accent-pink-soft/10">
                        <Heart size={20} className="group-active:scale-150 transition-transform" />
                      </div>
                      <span className="text-sm font-bold">24</span>
                    </button>
                    <button className="flex items-center gap-2.5 hover:text-accent-lavender-deep transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-accent-lavender/10">
                        <MessageSquare size={20} />
                      </div>
                      <span className="text-sm font-bold">{post._count.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-lunara-core transition-colors ml-auto group">
                      <span className="text-xs font-bold uppercase tracking-widest mr-1 opacity-0 group-hover:opacity-100 transition-opacity">Reply</span>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-32 bg-white/30 backdrop-blur-sm rounded-[40px] border-4 border-dashed border-white/50 shadow-inner">
            <div className="w-20 h-20 bg-lunara-mist rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-lunara-core/40" size={32} />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900">The board is waiting for you</h3>
            <p className="text-slate-500 mt-2">Be the first to share a moment with the community.</p>
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingPost(true)}
              className="mt-8 text-lunara-core font-bold hover:bg-lunara-mist px-8 rounded-full"
            >
              Post something now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
