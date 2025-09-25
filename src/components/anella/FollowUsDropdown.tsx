// src/components/anella/FollowUsDropdown.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Clapperboard, ArrowRight } from "lucide-react"
import {
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockInstagramPosts = [
  { id: 1, alt: 'Post 1', src: 'https://placehold.co/200x200/FFF0F5/FF69B4?text=Anella+1' },
  { id: 2, alt: 'Post 2', src: 'https://placehold.co/200x200/F0F8FF/4682B4?text=Anella+2' },
  { id: 3, alt: 'Post 3', src: 'https://placehold.co/200x200/F5FFFA/3CB371?text=Anella+3' },
  { id: 4, alt: 'Post 4', src: 'https://placehold.co/200x200/FAFAD2/FFD700?text=Anella+4' },
];

const mockTikTokPosts = [
  { id: 1, alt: 'Post 1', src: 'https://placehold.co/200x200/E6E6FA/4B0082?text=Anella+Vid+1' },
  { id: 2, alt: 'Post 2', src: 'https://placehold.co/200x200/FFF5EE/D2691E?text=Anella+Vid+2' },
];

export function FollowUsDropdown() {
  return (
    <div className="w-[450px] p-4">
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instagram">
            <Instagram className="mr-2 h-4 w-4" /> Instagram
          </TabsTrigger>
          <TabsTrigger value="tiktok">
            <Clapperboard className="mr-2 h-4 w-4" /> TikTok
          </TabsTrigger>
        </TabsList>
        <TabsContent value="instagram">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mockInstagramPosts.map(post => (
                <Link href="#" key={post.id}>
                    <Image
                      src={post.src}
                      alt={post.alt}
                      width={200}
                      height={200}
                      className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity"
                    />
                </Link>
              ))}
            </div>
            <Link href="#" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-4">
                Ver más en Instagram <ArrowRight className="h-4 w-4" />
            </Link>
        </TabsContent>
        <TabsContent value="tiktok">
             <div className="grid grid-cols-2 gap-2 mt-2">
              {mockTikTokPosts.map(post => (
                <Link href="#" key={post.id}>
                    <Image
                      src={post.src}
                      alt={post.alt}
                      width={200}
                      height={200}
                      className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity"
                    />
                </Link>
              ))}
            </div>
            <Link href="#" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-4">
                Ver más en TikTok <ArrowRight className="h-4 w-4" />
            </Link>
        </TabsContent>
      </Tabs>
    </div>
  )
}
