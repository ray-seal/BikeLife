"use client";
import React from 'react';
import MapGL, { Marker } from 'react-map-gl';

const townPins = [
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Manchester', lat: 53.4808, lon: -2.2426 },
  { name: 'Bristol', lat: 51.4545, lon: -2.5879 }
  ];

export default function Map() {
  return (
    <MapGL
      initialViewState={{
        latitude: 54.5,
        longitude: -3,
        zoom: 5
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
      {townPins.map((pin, index) => (
        <Marker key={index} latitude={pin.lat} longitude={pin.lon}>
          <span className="text-red-600 text-xl">📍</span>
          </Marker>
        ))}
      </MapGL>
    );
}
