import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export interface BookingMapHandle {
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
}

export interface BookingMapProps {
  longitude: number;
  latitude: number;
  zoom: number;
  onLocationChange: (longitude: number, latitude: number, zoom: number) => void;
}

function MapController({
  controllerRef,
  onLocationChange,
}: {
  controllerRef: React.Ref<BookingMapHandle>;
  onLocationChange: (longitude: number, latitude: number, zoom: number) => void;
}) {
  const map = useMap();

  useImperativeHandle(controllerRef, () => ({
    flyTo(lng: number, lat: number, z = 15) {
      map.flyTo([lat, lng], z, { duration: 1.2 });
    },
  }));

  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onLocationChange(center.lng, center.lat, map.getZoom());
    },
  });

  return null;
}

/**
 * RTL-friendly pin-drop map: fixed centre pin, user pans OpenStreetMap beneath it.
 * Isolated in a lazy chunk — loads only on /booking.
 */
const BookingMap = forwardRef<BookingMapHandle, BookingMapProps>(
  function BookingMap({ longitude, latitude, zoom, onLocationChange }, ref) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return (
        <div className="w-full h-full bg-bg-primary flex flex-col p-4 gap-3">
          <Skeleton className="flex-1 rounded-[24px] min-h-[200px]" />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full isolate booking-map-root">
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          className="w-full h-full rounded-[inherit] z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController controllerRef={ref} onLocationChange={onLocationChange} />
        </MapContainer>

        {/* Fixed centre pin */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]"
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center -translate-y-4">
            <div className="w-11 h-11 bg-bg-card/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[var(--shadow-header)] border-2 border-accent transition-transform duration-300">
              <MapPin className="w-5 h-5 text-danger fill-danger/20" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm mt-0.5" />
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_40px_rgba(62,74,46,0.06)] z-[1001]" />
      </div>
    );
  },
);

export default BookingMap;
