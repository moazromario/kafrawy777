import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Green pin
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Red pin (using CSS filter to change color)
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
  className: 'destination-marker-icon'
});

interface MapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  origin?: { lat: number, lng: number } | null;
  destination?: { lat: number, lng: number } | null;
  driverLocation?: { lat: number, lng: number } | null;
  nearbyDrivers?: any[];
  showDirections?: boolean;
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function FitRoute({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map(r => L.latLng(r[0], r[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

export default function MapComponent({ 
  onLocationSelect, 
  origin, 
  destination, 
  driverLocation,
  nearbyDrivers = [],
  showDirections = false 
}: MapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const defaultCenter: [number, number] = [31.4175, 31.8144];

  useEffect(() => {
    if (showDirections && origin && destination) {
      // Use OSRM for routing
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRoute(coordinates);
          }
        } catch (error) {
          console.error("Error fetching route from OSRM:", error);
        }
      };
      fetchRoute();
    } else {
      setRoute([]);
    }
  }, [origin, destination, showDirections]);

  const mapCenter: [number, number] = driverLocation ? [driverLocation.lat, driverLocation.lng] : (origin ? [origin.lat, origin.lng] : defaultCenter);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={mapCenter} zoom={13} />
        <FitRoute route={route} />
        <MapEvents onLocationSelect={onLocationSelect} />
        
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-right font-black">
                <p className="text-green-600">نقطة الانطلاق</p>
                <p className="text-xs text-slate-500">من هنا ستبدأ رحلتك</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-right font-black">
                <p className="text-red-600">الوجهة</p>
                <p className="text-xs text-slate-500">نقطة الوصول النهائية</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
            <Popup>
              <div className="text-right font-black">
                <p className="text-blue-600">موقع الكابتن</p>
                <p className="text-xs text-slate-500">الكابتن في طريقه إليك</p>
              </div>
            </Popup>
          </Marker>
        )}

        {nearbyDrivers.map((driver, idx) => (
          driver.lastLocation && (
            <Marker 
              key={driver.socketId || idx} 
              position={[driver.lastLocation.lat, driver.lastLocation.lng]} 
              icon={carIcon}
            >
              <Popup>
                <div className="text-right font-black">
                  <p className="text-blue-600">{driver.name}</p>
                  <p className="text-xs text-slate-500">{driver.car}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#2563eb" 
            weight={6} 
            opacity={0.8} 
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapContainer>
    </div>
  );
}
