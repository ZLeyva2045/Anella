// src/components/anella/FollowUsPageContent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Clapperboard, Facebook } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SocialPost } from '@/types/firestore';


function PostEmbed({ embedCode }: { embedCode: string }) {
  // This component will render the raw HTML embed code.
  // Using dangerouslySetInnerHTML is necessary here.
  return <div className="w-full max-w-[328px] [&_iframe]:!w-full [&_iframe]:sm:!w-[328px]" dangerouslySetInnerHTML={{ __html: embedCode }} />;
}

export function FollowUsPageContent() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'socialPosts'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching social posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // useEffect to load the necessary social media embed scripts
  React.useEffect(() => {
    // This is a simple way to ensure scripts are loaded.
    // A more advanced implementation might check if the script already exists.
    const instagramScript = document.createElement('script');
    instagramScript.src = "//www.instagram.com/embed.js";
    instagramScript.async = true;
    document.body.appendChild(instagramScript);

    const tiktokScript = document.createElement('script');
    tiktokScript.src = "https://www.tiktok.com/embed.js";
    tiktokScript.async = true;
    document.body.appendChild(tiktokScript);

    // For Facebook, it's often better to use their SDK, but for simple embeds, this works.
    if ((window as any).FB) {
        (window as any).FB.XFBML.parse();
    }
    
    // Optional: Re-process embeds when posts data changes
    if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
    }
    
    return () => {
      // Clean up scripts if necessary, though often it's fine to leave them.
    }
  }, [posts]);

  const renderContent = (platform: 'Instagram' | 'TikTok' | 'Facebook') => {
      const platformPosts = posts.filter(p => p.platform === platform);
      
      if (loading) {
          return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full" />)}
              </div>
          )
      }
      if (platformPosts.length === 0) {
          return <p className="text-center text-muted-foreground mt-8">Próximamente... ¡Síguenos en {platform} para no perderte nada!</p>
      }
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 justify-items-center">
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
          {renderContent('Instagram')}
        </TabsContent>
        <TabsContent value="tiktok">
          {renderContent('TikTok')}
        </TabsContent>
        <TabsContent value="facebook">
          {renderContent('Facebook')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
