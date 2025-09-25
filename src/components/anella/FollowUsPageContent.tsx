// src/components/anella/FollowUsPageContent.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Clapperboard, Facebook, ArrowRight } from "lucide-react"
import {
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockInstagramPosts = [
  { id: 1, alt: 'Post 1', src: 'https://placehold.co/400x400/FFF0F5/FF69B4?text=Anella+1' },
  { id: 2, alt: 'Post 2', src: 'https://placehold.co/400x400/F0F8FF/4682B4?text=Anella+2' },
  { id: 3, alt: 'Post 3', src: 'https://placehold.co/400x400/F5FFFA/3CB371?text=Anella+3' },
  { id: 4, alt: 'Post 4', src: 'https://placehold.co/400x400/FAFAD2/FFD700?text=Anella+4' },
  { id: 5, alt: 'Post 5', src: 'https://placehold.co/400x400/FFFACD/A52A2A?text=Anella+5' },
  { id: 6, alt: 'Post 6', src: 'https://placehold.co/400x400/F0FFF0/20B2AA?text=Anella+6' },
];

const mockTikTokPosts = [
  { id: 1, alt: 'Post 1', src: 'https://placehold.co/400x500/E6E6FA/4B0082?text=Anella+Vid+1' },
  { id: 2, alt: 'Post 2', src: 'https://placehold.co/400x500/FFF5EE/D2691E?text=Anella+Vid+2' },
  { id: 3, alt: 'Post 3', src: 'https://placehold.co/400x500/FFFAF0/FF4500?text=Anella+Vid+3' },
];

const mockFacebookPosts = [
  { id: 1, alt: 'Post 1', src: 'https://placehold.co/600x400/DCDCDC/191970?text=Anella+FB+1' },
  { id: 2, alt: 'Post 2', src: 'https://placehold.co/600x400/ADD8E6/00008B?text=Anella+FB+2' },
];

export function FollowUsPageContent() {
  return (
    <div className="w-full max-w-5xl mx-auto">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {mockInstagramPosts.map(post => (
                <Link href="#" key={post.id} className="group relative">
                    <Image
                      src={post.src}
                      alt={post.alt}
                      width={400}
                      height={400}
                      className="rounded-lg object-cover aspect-square transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white font-bold">Ver en Instagram</p>
                    </div>
                </Link>
              ))}
            </div>
            <Link href="#" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-8">
                Ver más en Instagram <ArrowRight className="h-4 w-4" />
            </Link>
        </TabsContent>

        <TabsContent value="tiktok">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {mockTikTokPosts.map(post => (
                 <Link href="#" key={post.id} className="group relative">
                    <Image
                      src={post.src}
                      alt={post.alt}
                      width={400}
                      height={500}
                      className="rounded-lg object-cover aspect-[4/5] transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white font-bold">Ver en TikTok</p>
                    </div>
                </Link>
              ))}
            </div>
            <Link href="#" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-8">
                Ver más en TikTok <ArrowRight className="h-4 w-4" />
            </Link>
        </TabsContent>

        <TabsContent value="facebook">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {mockFacebookPosts.map(post => (
                 <Link href="#" key={post.id} className="group relative">
                    <Image
                      src={post.src}
                      alt={post.alt}
                      width={600}
                      height={400}
                      className="rounded-lg object-cover aspect-video transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white font-bold">Ver en Facebook</p>
                    </div>
                </Link>
              ))}
            </div>
            <Link href="#" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-8">
                Ver más en Facebook <ArrowRight className="h-4 w-4" />
            </Link>
        </TabsContent>
      </Tabs>
    </div>
  )
}
