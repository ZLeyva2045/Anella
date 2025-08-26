// src/app/admin/themes/page.tsx
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
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  Palette,
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
import type { Theme } from '@/types/firestore';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ThemeForm } from '@/components/admin/ThemeForm';
import { useToast } from '@/hooks/use-toast';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const themesCollection = collection(db, 'themes');
    const unsubscribe = onSnapshot(themesCollection, (snapshot) => {
      const themesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Theme)
      );
      setThemes(themesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTheme = () => {
    setSelectedTheme(null);
    setIsFormOpen(true);
  };

  const handleEditTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (theme: Theme) => {
    setThemeToDelete(theme);
  };

  const handleDeleteConfirm = async () => {
    if (!themeToDelete) return;
    try {
      await deleteDoc(doc(db, 'themes', themeToDelete.id));
      toast({
        title: 'Temática eliminada',
        description: `La temática "${themeToDelete.name}" ha sido eliminada.`,
      });
    } catch (error) {
      console.error('Error deleting theme: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la temática.',
      });
    } finally {
      setThemeToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Palette />
                Gestión de Temáticas
            </h1>
            <p className="text-muted-foreground">
              Crea y personaliza las temáticas para los filtros de la tienda.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddTheme}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Temática
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Temáticas</CardTitle>
            <CardDescription>
              Temáticas disponibles para clasificar los regalos.
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
                    <TableHead>Logo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fondo</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {themes.map((theme) => (
                    <TableRow key={theme.id}>
                       <TableCell>
                        <Image
                          alt={theme.name}
                          className="aspect-square rounded-full object-contain bg-muted p-1"
                          height="48"
                          src={theme.logoUrl || '/placeholder.svg'}
                          width="48"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{theme.name}</TableCell>
                      <TableCell>
                        <div
                            className="w-24 h-12 rounded-md bg-cover bg-center border"
                            style={{ backgroundImage: `url(${theme.backgroundUrl || ''})`, backgroundColor: !theme.backgroundUrl ? '#f1f5f9' : 'transparent' }}
                        ></div>
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
                              <span className="sr-only">Menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTheme(theme)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(theme)}
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

      <ThemeForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        theme={selectedTheme}
      />

      <AlertDialog
        open={!!themeToDelete}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la temática &quot;{themeToDelete?.name}&quot; y podría afectar a los regalos que la usen.
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
