// src/components/shared/DeliveryMap.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Map, Pin, Store, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useJsApiLoader, GoogleMap, Marker, Circle } from '@react-google-maps/api';

interface DeliveryMapProps {
  onLocationSelect: (address: string, cost: number) => void;
}

const STORE_LOCATION = { lat: -7.15879, lng: -78.5114 };
const LIBRARIES: ('geometry' | 'places')[] = ['geometry', 'places'];

const ZONES = [
    { name: 'Zona 1', radius: 2500, cost: 10, color: "#10b981" }, // Verde
    { name: 'Zona 2', radius: 3500, cost: 15, color: "#f59e0b" }, // Ambar
    { name: 'Zona 3', radius: 5000, cost: 20, color: "#ef4444" }, // Rojo
];

export function DeliveryMap({ onLocationSelect }: DeliveryMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [distance, setDistance] = useState(0);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const clickedLocation = event.latLng;
      setSelectedLocation(clickedLocation);

      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(STORE_LOCATION),
        clickedLocation
      );
      
      let cost = 25; // Costo base para más de 5km
      if (dist <= ZONES[0].radius) cost = ZONES[0].cost;
      else if (dist <= ZONES[1].radius) cost = ZONES[1].cost;
      else if (dist <= ZONES[2].radius) cost = ZONES[2].cost;
      
      setDistance(dist / 1000); // convert to km
      setDeliveryCost(cost);
    }
  };
  
  const confirmLocation = () => {
    if (!selectedLocation) return;
    const address = `Ubicación seleccionada (${distance.toFixed(1)} km)`;
    setSelectedAddress(address);
    onLocationSelect(address, deliveryCost);
    setShowMap(false);
  };
  
  const zoneInfo = useMemo(() => {
    const mDistance = distance * 1000;
    if (mDistance === 0) return ZONES[0];
    const foundZone = ZONES.find(z => mDistance <= z.radius);
    return foundZone || { name: 'Fuera de Zona', radius: Infinity, cost: 25, color: '#9ca3af' };
  }, [distance]);

  const renderMap = () => (
     <GoogleMap
        mapContainerClassName="w-full h-[300px]"
        center={STORE_LOCATION}
        zoom={14}
        onClick={handleMapClick}
        options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
        }}
    >
        <Marker
            position={STORE_LOCATION}
            title="Anella Boutique"
            options={{
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "hsl(var(--primary))",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                },
                zIndex: 10
            }}
        />
        {selectedLocation && <Marker position={selectedLocation} />}
        {ZONES.map(zone => (
            <Circle
                key={zone.name}
                center={STORE_LOCATION}
                radius={zone.radius}
                options={{
                    strokeColor: zone.color,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: zone.color,
                    fillOpacity: 0.1
                }}
            />
        ))}
    </GoogleMap>
  );

  return (
    <div className="space-y-2">
      <Label>Dirección de Entrega</Label>
      <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 bg-white">
        <Input
          type="text"
          value={selectedAddress}
          placeholder="Selecciona ubicación en el mapa"
          readOnly
          className="w-full p-4 border-none bg-secondary/30 text-sm"
        />
         <Button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="w-full rounded-none bg-gradient-to-r from-primary to-fuchsia-600 text-white font-semibold hover:from-fuchsia-600 hover:to-purple-700 hover:-translate-y-px transition-all"
        >
          <Map className="mr-2 h-4 w-4" /> {showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
        </Button>
      </div>

      {showMap && (
        <Card className="shadow-inner animate-in fade-in-50">
          <div className="map-header p-4 bg-gradient-to-r from-pink-50 to-fuchsia-50 border-b border-fuchsia-100">
            <h4 className="font-bold text-center">Selecciona la ubicación de entrega</h4>
             <div className="flex gap-2 mt-2 justify-center flex-wrap">
              {ZONES.map(zone=>(
                <div key={zone.name} className="text-xs font-medium px-2 py-1 rounded-full" style={{backgroundColor: `${zone.color}20`, color: zone.color}}>
                  {zone.name}: S/{zone.cost}
                </div>
              ))}
            </div>
          </div>
          {!isLoaded ? (
            <div className="flex justify-center items-center h-[300px]"><Loader2 className="animate-spin" /></div>
           ) : loadError ? (
            <div className="flex justify-center items-center h-[300px] text-destructive text-center p-4">Error al cargar el mapa. Verifica la API Key y la configuración.</div>
           ) : (
            renderMap()
          )}
          {selectedLocation && (
              <div className="map-footer p-4 bg-purple-50 flex flex-col items-center gap-4">
                  <div className="w-full bg-white p-3 rounded-lg shadow-md flex items-center justify-between">
                    <div className="text-center">
                        <div className="font-bold text-lg text-primary">S/{deliveryCost.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Costo de envío</div>
                    </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{distance.toFixed(1)}km</div>
                        <div className="text-xs text-muted-foreground">Distancia Aprox.</div>
                    </div>
                    <div className={cn("text-xs font-bold px-3 py-1 rounded-full")} style={{backgroundColor: `${zoneInfo.color}20`, color: zoneInfo.color}}>
                        {zoneInfo.name}
                    </div>
                  </div>
                  <Button type="button" className="w-full font-semibold" onClick={confirmLocation}>
                    Confirmar Ubicación y Costo
                  </Button>
              </div>
          )}
        </Card>
      )}
    </div>
  );
}