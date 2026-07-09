"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { TegakanMarker } from "@/lib/dashboard/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

const statusColors: Record<string, string> = {
  hidup: "#10b981",
  mati: "#ef4444",
  stres: "#f59e0b",
  sakit: "#8b5cf6",
};

const statusLabels: Record<string, string> = {
  hidup: "Hidup",
  mati: "Mati",
  stres: "Stres",
  sakit: "Sakit",
};

interface MapPreviewProps {
  markers: TegakanMarker[];
}

function createMarkerIcon(color: string) {
  if (typeof window === "undefined") return undefined;
  const L = require("leaflet");
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 16px; height: 16px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export default function MapPreview({ markers }: MapPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center: [number, number] = [-6.991, 110.342];

  if (!mounted) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        Memuat peta...
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        Belum ada data titik tegakan
      </div>
    );
  }

  return (
    <div className="h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => {
          const color = statusColors[m.status] ?? "#6b7280";
          const icon = createMarkerIcon(color);
          if (!icon) return null;
          return (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[140px] text-sm">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{m.kode}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.spesies}</p>
                  <p className="mt-1 text-xs">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />{" "}
                    {statusLabels[m.status] ?? m.status}
                  </p>
                  {m.area && (
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{m.area}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
