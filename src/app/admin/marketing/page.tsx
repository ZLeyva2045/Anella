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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import type { SocialPost } from '@/types/firestore';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
// import { SocialPostForm } from '@/components/admin/marketing/SocialPostForm'; // Futuro componente

export default function AdminMarketingPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // En el futuro, se obtendrán los datos de una colección 'socialPosts'
    // Por ahora, usamos datos de ejemplo:
    const mockPosts: SocialPost[] = [
      { id: '1', platform: 'Instagram', imageUrl: 'https://placehold.co/600x600/FFF0F5/FF69B4?text=Anella+Post', link: '#', caption: '¡Nuevo lanzamiento! Lámpara de luna personalizada.', likes: 1200 },
      { id: '2', platform: 'TikTok', imageUrl: 'https://placehold.co/600x600/E6E6FA/4B0082?text=Anella+Video', link: '#', caption: 'El proceso detrás de nuestras tazas mágicas.', likes: 15000 },
      { id: '3', platform: 'Instagram', imageUrl: 'https://placehold.co/600x600/F0FFF0/228B22?text=Anella+Story', link: '#', caption: 'Ideas de regalos para aniversarios.', likes: 850 },
    ];
    setPosts(mockPosts);
    setLoading(false);
  }, []);

  const handleAddPost = () => {
    setSelectedPost(null);
    setIsFormOpen(true);
    toast({ title: "Función no disponible", description: "El formulario para añadir posts se implementará en el futuro."})
  };

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
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Publicación</TableHead>
                    <TableHead className="hidden md:table-cell">Interacciones</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                          <div className="flex items-center gap-2 font-semibold">
                            {post.platform === 'Instagram' ? <Instagram className="h-5 w-5 text-pink-600" /> : <Clapperboard className="h-5 w-5" />}
                            {post.platform}
                          </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <Image
                                alt={post.caption}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={post.imageUrl}
                                width="64"
                            />
                            <span className="font-medium line-clamp-2">{post.caption}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{post.likes.toLocaleString()} likes</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" disabled>
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
      
      {/* 
        Futuro formulario para añadir/editar posts:
        <SocialPostForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} post={selectedPost} /> 
      */}
    </>
  );
}
