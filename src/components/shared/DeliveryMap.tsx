// src/components/shared/DeliveryMap.tsx
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, Pin, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface DeliveryMapProps {
  onLocationSelect: (address: string, cost: number) => void;
}

interface Location {
  x: number;
  y: number;
}

export function DeliveryMap({ onLocationSelect }: DeliveryMapProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [distance, setDistance] = useState(0);
  
  const mapAreaRef = useRef<HTMLDivElement>(null);

  const getZoneInfo = (km: number) => {
    if (km <= 2.5) return { name: 'Zona 1', number: 1 };
    if (km <= 3.5) return { name: 'Zona 2', number: 2 };
    return { name: 'Zona 3', number: 3 };
  };

  const calculateDeliveryCost = (km: number) => {
    if (km <= 2.5) return 10;
    if (km <= 3.5) return 15;
    return 15 + Math.floor(km - 3.5) * 5;
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const pixelDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    const kmDistance = (pixelDistance / (rect.width / 2)) * 5; // Escala simulada: borde del mapa = 5km
    const cost = calculateDeliveryCost(kmDistance);

    setSelectedLocation({ x, y });
    setDistance(kmDistance);
    setDeliveryCost(cost);
  };
  
  const confirmLocation = () => {
    const address = `Ubicación seleccionada (${distance.toFixed(1)} km)`;
    setSelectedAddress(address);
    onLocationSelect(address, deliveryCost);
    setShowMap(false);
  }

  const zoneInfo = useMemo(() => getZoneInfo(distance), [distance]);


  return (
    <div className="space-y-2 relative">
      <Label>Dirección de Entrega</Label>
      <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20 transition-all duration-300 bg-white">
        <Input
          type="text"
          value={selectedAddress}
          placeholder="Selecciona ubicación en el mapa"
          readOnly
          className="w-full p-4 border-none bg-pink-50 text-sm"
        />
         <Button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="w-full rounded-none bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold hover:from-fuchsia-600 hover:to-purple-700 hover:-translate-y-px transition-all"
        >
          <Map className="mr-2 h-4 w-4" /> {showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
        </Button>
      </div>

      {showMap && (
        <Card className="shadow-inner animate-in fade-in-50">
          <div className="map-container overflow-hidden rounded-lg">
            <div className="map-header p-4 bg-gradient-to-r from-pink-50 to-fuchsia-50 border-b border-fuchsia-100">
              <h4 className="font-bold text-center">Selecciona tu ubicación</h4>
              <div className="flex gap-2 mt-2 justify-center flex-wrap">
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">0-2.5km: S/10</div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">2.5-3.5km: S/15</div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">+3.5km: S/15 + S/5/km</div>
              </div>
            </div>

            <div ref={mapAreaRef} className="map-area relative h-64 md:h-80 bg-gradient-to-br from-pink-50 to-purple-100 cursor-crosshair overflow-hidden" onClick={handleMapClick}>
              {/* Zonas */}
              <div className="zone-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none w-[90%] h-[90%] border-red-500 bg-red-500/10" />
              <div className="zone-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none w-[60%] h-[60%] border-yellow-500 bg-yellow-500/10" />
              <div className="zone-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none w-[30%] h-[30%] border-green-500 bg-green-500/10" />
              
              {/* Tienda */}
              <div className="store-marker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                <Store className="h-4 w-4" />
                <span>Anella</span>
              </div>
              
              {/* Destino */}
              {selectedLocation && (
                <div
                  className="destination-marker absolute -translate-x-1/2 -translate-y-full text-pink-600 z-20"
                  style={{
                    left: selectedLocation.x,
                    top: selectedLocation.y,
                    animation: 'bounce 1s infinite'
                  }}
                >
                  <Pin className="h-8 w-8 drop-shadow-lg" />
                </div>
              )}
            </div>
            
            {deliveryCost > 0 && (
                <div className="map-footer p-4 bg-purple-50 flex flex-col items-center gap-4">
                     <div className="delivery-cost-info w-full bg-white p-3 rounded-lg shadow-md flex items-center justify-between">
                        <div className="text-center">
                            <div className="font-bold text-lg text-pink-600">S/{deliveryCost.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Costo de envío</div>
                        </div>
                         <div className="text-center">
                            <div className="font-bold text-lg">{distance.toFixed(1)}km</div>
                            <div className="text-xs text-muted-foreground">Distancia Aprox.</div>
                        </div>
                        <div 
                            className={cn("text-xs font-bold px-3 py-1 rounded-full", {
                                'bg-green-100 text-green-800': zoneInfo.number === 1,
                                'bg-yellow-100 text-yellow-800': zoneInfo.number === 2,
                                'bg-red-100 text-red-800': zoneInfo.number === 3,
                            })}>
                            {zoneInfo.name}
                        </div>
                    </div>
                     <Button type="button" className="w-full confirm-location-btn font-semibold" onClick={confirmLocation}>
                        Confirmar Ubicación y Costo
                    </Button>
                </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
