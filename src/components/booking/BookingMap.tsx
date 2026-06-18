import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import Map, { type MapRef } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN && import.meta.env.DEV) {
  console.warn('[BookingMap] VITE_MAPBOX_TOKEN is not set. Add it to .env.local');
}

export interface BookingMapHandle {
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
}

export interface BookingMapProps {
  longitude: number;
  latitude: number;
  zoom: number;
  onLocationChange: (longitude: number, latitude: number, zoom: number) => void;
}

/**
 * RTL-friendly pin-drop map: the pin stays fixed at the viewport centre
 * while the user pans the map beneath it — standard mobile booking UX.
 * Mapbox GL is isolated here so this chunk loads only via React.lazy().
 */
const BookingMap = forwardRef<BookingMapHandle, BookingMapProps>(
  function BookingMap({ longitude, latitude, zoom, onLocationChange }, ref) {
    const mapRef = useRef<MapRef>(null);

    useImperativeHandle(ref, () => ({
      flyTo(lng: number, lat: number, z = 15) {
        mapRef.current?.flyTo({ center: [lng, lat], zoom: z, duration: 1200 });
      },
    }));

    const emitCenter = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const center = map.getCenter();
      onLocationChange(center.lng, center.lat, map.getZoom());
    }, [onLocationChange]);

    return (
      <div className="relative w-full h-full isolate">
        <Map
          ref={mapRef}
          longitude={longitude}
          latitude={latitude}
          zoom={zoom}
          onMoveEnd={emitCenter}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN ?? ''}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          dragRotate={false}
          pitchWithRotate={false}
        />

        {/* Fixed centre pin — pointer-events-none keeps pan gestures on the map */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center -translate-y-4">
            <div className="w-11 h-11 bg-bg-card/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[var(--shadow-header)] border-2 border-accent transition-transform duration-300">
              <MapPin className="w-5 h-5 text-danger fill-danger/20" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm mt-0.5" />
          </div>
        </div>

        {/* Soft vignette for premium depth */}
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_40px_rgba(62,74,46,0.06)]" />
      </div>
    );
  },
);

export default BookingMap;
