// src/app/admin/marketing/page.tsx
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
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { deleteSocialPost } from '@/services/socialPostService';

const platformIcons: { [key in SocialPost['platform']]: React.ReactElement } = {
  Instagram: <Instagram className="h-5 w-5 text-pink-600" />,
  TikTok: <Clapperboard className="h-5 w-5" />,
  Facebook: <Facebook className="h-5 w-5 text-blue-600" />,
};


export default function AdminMarketingPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'socialPosts'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost)));
        setLoading(false);
    }, (error) => {
        console.error("Error fetching posts:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las publicaciones.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const handleAddPost = () => {
    setSelectedPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = (post: SocialPost) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };

   const handleDeletePost = async (postId: string) => {
    if(!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    try {
        await deleteSocialPost(postId);
        toast({ title: 'Publicación Eliminada', description: 'La publicación ha sido eliminada de la base de datos.'});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la publicación.'});
    }
  }


  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Marketing</h1>
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
            <CardTitle>Contenido de Redes Sociales</CardTitle>
            <CardDescription>
              Publicaciones de Instagram y TikTok.
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
