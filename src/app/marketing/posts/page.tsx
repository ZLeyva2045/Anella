// src/app/marketing/posts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  Instagram,
  Clapperboard,
  Facebook,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SocialPost } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { SocialPostForm } from '@/components/marketing/SocialPostForm';

const platformIcons = {
  Instagram: <Instagram className="h-5 w-5 text-pink-600" />,
  TikTok: <Clapperboard className="h-5 w-5" />,
  Facebook: <Facebook className="h-5 w-5 text-blue-600" />,
};

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<Omit<SocialPost, 'createdAt'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Omit<SocialPost, 'createdAt'> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Using static data now
    const staticPosts = [
        {
            id: '1',
            platform: 'Instagram',
            embedCode: `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/DOzlZ3xDPJN/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/DOzlZ3xDPJN/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">...</a></div></blockquote><script async src="//www.instagram.com/embed.js"></script>`,
            caption: 'Publicación de Instagram de Anella Perú',
            order: 1,
        }
    ];
    setPosts(staticPosts);
    setLoading(false);
  }, []);

  const handleAddPost = () => {
    setSelectedPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = (post: Omit<SocialPost, 'createdAt'>) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };
  
  const handleDeletePost = async (postId: string) => {
    if(!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    toast({ title: "Función no disponible", description: "El borrado está deshabilitado en modo estático." });
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contenido de Redes Sociales</h1>
            <p className="text-muted-foreground">
              Añade y gestiona las publicaciones que se mostrarán en la sección "Síguenos".
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddPost}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Publicación
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Publicaciones Activas</CardTitle>
            <CardDescription>
              Publicaciones que aparecen en la página "Síguenos".
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-bold">{post.order}</TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2 font-semibold">
                            {platformIcons[post.platform]}
                            {post.platform}
                          </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium line-clamp-2">{post.caption}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPost(post)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <SocialPostForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} post={selectedPost} />
    </>
  );
}
