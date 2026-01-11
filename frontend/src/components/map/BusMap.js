import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e40af" width="32" height="32">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const stopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="24" height="24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const schoolIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669" width="28" height="28">
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const BusMap = ({ 
  buses = [], 
  routes = [], 
  selectedBus = null,
  onBusClick = null,
  showRoutes = true,
  center = [40.7484, -73.9857],
  zoom = 13,
  className = ''
}) => {
  const mapRef = useRef(null);

  const getRouteColor = (index) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[index % colors.length];
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        ref={mapRef}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedBus && (
          <MapUpdater 
            center={[
              selectedBus.location?.[1] || selectedBus.currentLocation?.coordinates?.[1] || center[0],
              selectedBus.location?.[0] || selectedBus.currentLocation?.coordinates?.[0] || center[1]
            ]} 
            zoom={15} 
          />
        )}

        {showRoutes && routes.map((route, index) => {
          if (!route.waypoints || route.waypoints.length < 2) return null;
          
          const positions = route.waypoints
            .sort((a, b) => a.order - b.order)
            .map(wp => [wp.location.coordinates[1], wp.location.coordinates[0]]);
          
          return (
            <React.Fragment key={route._id}>
              <Polyline
                positions={positions}
                color={getRouteColor(index)}
                weight={4}
                opacity={0.7}
              />
              {route.waypoints.map((waypoint) => (
                <Marker
                  key={waypoint._id}
                  position={[waypoint.location.coordinates[1], waypoint.location.coordinates[0]]}
                  icon={waypoint.type === 'school' ? schoolIcon : stopIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{waypoint.name}</strong>
                      <br />
                      <span className="text-gray-500">{waypoint.type}</span>
                      {waypoint.estimatedArrival && (
                        <>
                          <br />
                          <span>ETA: {waypoint.estimatedArrival}</span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}

        {buses.map((bus) => {
          const coords = bus.location || bus.currentLocation?.coordinates;
          if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
          
          return (
            <Marker
              key={bus._id}
              position={[coords[1], coords[0]]}
              icon={busIcon}
              eventHandlers={{
                click: () => onBusClick && onBusClick(bus),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Bus {bus.busNumber}</strong>
                  <br />
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                    bus.status === 'en-route' ? 'bg-blue-100 text-blue-800' :
                    bus.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {bus.status}
                  </span>
                  {bus.speed !== undefined && (
                    <>
                      <br />
                      <span>Speed: {Math.round(bus.speed)} mph</span>
                    </>
                  )}
                  {bus.driver && (
                    <>
                      <br />
                      <span>Driver: {bus.driver.name}</span>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BusMap;
