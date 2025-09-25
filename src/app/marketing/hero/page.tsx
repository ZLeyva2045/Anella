// src/app/marketing/hero/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { getHeroImage, updateHeroImage } from '@/services/settingsService';
import Image from 'next/image';

export default function HeroManagementPage() {
  const [currentHeroImage, setCurrentHeroImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchImage() {
      setLoading(true);
      const url = await getHeroImage();
      setCurrentHeroImage(url);
      setLoading(false);
    }
    fetchImage();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No hay imagen seleccionada' });
      return;
    }
    setUploading(true);
    try {
      const newUrl = await updateHeroImage(imageFile);
      setCurrentHeroImage(newUrl);
      toast({ title: '¡Portada actualizada!', description: 'La nueva imagen de portada está ahora visible en la página de inicio.' });
      setImageFile(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al subir', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestionar Portada de Inicio</h1>
        <p className="text-muted-foreground">
          Cambia la imagen principal que ven todos los visitantes al entrar a la tienda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Imagen de Portada Actual</CardTitle>
          <CardDescription>
            Esta es la imagen que se está mostrando en la página de inicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            currentHeroImage && (
              <Image
                src={currentHeroImage}
                alt="Portada actual"
                width={1200}
                height={520}
                className="rounded-lg object-cover w-full aspect-[1200/520] bg-muted"
                priority
              />
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subir Nueva Imagen</CardTitle>
          <CardDescription>
            Selecciona una nueva imagen para la portada. Se recomienda un tamaño de 1200x520 píxeles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto flex-grow">
            <Input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <Button onClick={handleUpload} disabled={!imageFile || uploading}>
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Subir y Actualizar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
