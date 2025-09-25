// src/components/anella/FollowUsPageContent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SocialPost } from '@/types/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Clapperboard, Facebook } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

function PostEmbed({ embedCode }: { embedCode: string }) {
  // This component will render the raw HTML embed code.
  // Using dangerouslySetInnerHTML is necessary here.
  return <div dangerouslySetInnerHTML={{ __html: embedCode }} />;
}

export function FollowUsPageContent() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const postsQuery = query(collection(db, 'socialPosts'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const instagramPosts = posts.filter(p => p.platform === 'Instagram');
  const tiktokPosts = posts.filter(p => p.platform === 'TikTok');
  const facebookPosts = posts.filter(p => p.platform === 'Facebook');

  const renderContent = (platformPosts: SocialPost[]) => {
      if (loading) {
          return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full" />)}
              </div>
          )
      }
      if (platformPosts.length === 0) {
          return <p className="text-center text-muted-foreground mt-8">Próximamente... ¡Síguenos para no perderte nada!</p>
      }
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 justify-center">
              {platformPosts.map(post => (
                <div key={post.id} className="flex justify-center">
                   <PostEmbed embedCode={post.embedCode} />
                </div>
              ))}
          </div>
      )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instagram">
            <Instagram className="mr-2 h-4 w-4" /> Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok">
            <Clapperboard className="mr-2 h-4 w-4" /> TikTok
          </TabsTrigger>
          <TabsTrigger value="facebook">
            <Facebook className="mr-2 h-4 w-4" /> Facebook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instagram">
          {renderContent(instagramPosts)}
        </TabsContent>
        <TabsContent value="tiktok">
          {renderContent(tiktokPosts)}
        </TabsContent>
        <TabsContent value="facebook">
          {renderContent(facebookPosts)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
