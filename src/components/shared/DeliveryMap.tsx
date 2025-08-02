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
const LIBRARIES: ('places' | 'geometry' | 'marker')[] = ['geometry'];

const ZONES = [
    { name: 'Zona 1', radius: 2500, cost: 10, color: "#10b981" },
    { name: 'Zona 2', radius: 3500, cost: 15, color: "#f59e0b" },
    { name: 'Zona 3', radius: 5000, cost: 20, color: "#ef4444" },
];

export function DeliveryMap({ onLocationSelect }: DeliveryMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [distance, setDistance] = useState(0);
  
  const calculateCostAndDistance = useCallback((location: google.maps.LatLngLiteral) => {
    if (typeof google === 'undefined' || !google.maps.geometry) return;
    
    const metersDistance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(STORE_LOCATION),
      new google.maps.LatLng(location)
    );

    let cost = 25; // Costo base para más de 5km
    if (metersDistance <= ZONES[0].radius) cost = ZONES[0].cost;
    else if (metersDistance <= ZONES[1].radius) cost = ZONES[1].cost;
    else if (metersDistance <= ZONES[2].radius) cost = ZONES[2].cost;

    setDistance(metersDistance / 1000); // en km
    setDeliveryCost(cost);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setSelectedLocation(newLocation);
      calculateCostAndDistance(newLocation);
    }
  }, [calculateCostAndDistance]);
  
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

  const renderMap = () => {
    if (loadError) return <p className="text-center text-destructive">Error al cargar el mapa. Verifica la API Key.</p>;
    if (!isLoaded) return <div className="h-80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    
    return (
      <GoogleMap
        mapContainerClassName="w-full h-80"
        center={STORE_LOCATION}
        zoom={14}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker 
          position={STORE_LOCATION} 
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#ea47b4',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 1.5,
            anchor: new google.maps.Point(12, 24),
          }}
          zIndex={10}
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
  };

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
          {renderMap()}
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
