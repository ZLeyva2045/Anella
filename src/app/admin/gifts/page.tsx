// src/app/admin/gifts/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import type { Gift } from '@/types/firestore';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { GiftForm } from '@/components/admin/GiftForm';
import { useToast } from '@/hooks/use-toast';

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const giftsCollection = collection(db, 'gifts');
    const unsubscribe = onSnapshot(giftsCollection, (snapshot) => {
      const giftsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Gift)
      );
      setGifts(giftsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddGift = () => {
    setSelectedGift(null);
    setIsFormOpen(true);
  };

  const handleEditGift = (gift: Gift) => {
    setSelectedGift(gift);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (gift: Gift) => {
    setGiftToDelete(gift);
  };

  const handleDeleteConfirm = async () => {
    if (!giftToDelete) return;
    try {
      await deleteDoc(doc(db, 'gifts', giftToDelete.id));
      toast({
        title: 'Regalo eliminado',
        description: `El regalo "${giftToDelete.name}" ha sido eliminado.`,
      });
    } catch (error) {
      console.error('Error deleting gift: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el regalo.',
      });
    } finally {
      setGiftToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Regalos</h1>
            <p className="text-muted-foreground">
              Crea, edita o elimina los regalos que se mostrarán en la tienda.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddGift}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Regalo
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Regalos</CardTitle>
            <CardDescription>
              Un listado completo de los regalos disponibles en la tienda online.
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
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Imagen</span>
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="hidden md:table-cell">Precio</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gifts.map((gift) => (
                    <TableRow key={gift.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={gift.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={gift.images[0] || '/placeholder.svg'}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{gift.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{gift.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        S/{gift.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditGift(gift)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(gift)}
                              className="text-destructive"
                            >
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

      <GiftForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        gift={selectedGift}
      />

      <AlertDialog
        open={!!giftToDelete}
        onOpenChange={(open) => !open && setGiftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el regalo &quot;{giftToDelete?.name}&quot; de la base de
              datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
