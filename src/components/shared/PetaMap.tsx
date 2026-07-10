"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Map, Layers, Maximize2, Loader2, RefreshCw } from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const MarkerComp = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const MapInit = dynamic(
  () => import("react-leaflet").then(({ useMap }) => {
    function MapInitInner({ mapRef }: { mapRef: { current: any } }) {
      const map = useMap();
      useEffect(() => {
        mapRef.current = map;
      }, [map, mapRef]);
      return null;
    }
    return MapInitInner;
  }),
  { ssr: false }
);

interface PetaMapProps {
  compact?: boolean;
}

const CENTER: [number, number] = [-6.991, 110.342];
const ZOOM = 13;

const LAYER_CONFIG: Record<string, { label: string; color: string }> = {
  tegakan_hidup: { label: "Tegakan Hidup", color: "#10b981" },
  tegakan_mati: { label: "Tegakan Mati", color: "#ef4444" },
  penyulaman: { label: "Penyulaman", color: "#3498db" },
  kualitas_air: { label: "Kualitas Air", color: "#f59e0b" },
};

interface BaseMarker {
  id: string;
  lat: number;
  lng: number;
  layer: keyof typeof LAYER_CONFIG;
}

interface TegakanMarker extends BaseMarker {
  layer: "tegakan_hidup" | "tegakan_mati";
  kode: string;
  spesies: string;
  status: string;
  tinggi: string;
  diameter: string;
  zona: string;
}

interface PenyulamanMarker extends BaseMarker {
  layer: "penyulaman";
  tanggal: string;
  spesies: string;
  jumlah_bibit: number;
  jumlah_hidup: number | null;
  survival_rate: number | null;
  status: string;
}

interface KualitasAirMarker extends BaseMarker {
  layer: "kualitas_air";
  tanggal: string;
  titik_sampling: string | null;
  ph: number;
  do_mgl: number;
  salinitas_ppt: number;
  tss_mgl: number;
  suhu_c: number;
  lokasi: string;
}

type MapMarker = TegakanMarker | PenyulamanMarker | KualitasAirMarker;

function createMarkerIcon(color: string) {
  if (typeof window === "undefined") return undefined;
  const L = require("leaflet");
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2.5px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export default function PetaMap({ compact = false }: PetaMapProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [enabledLayers, setEnabledLayers] = useState<Record<string, boolean>>({
    tegakan_hidup: true,
    tegakan_mati: true,
    penyulaman: true,
    kualitas_air: true,
  });
  const [skippedCount, setSkippedCount] = useState(0);
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/peta/data");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        const allMarkers: MapMarker[] = [];
        let skip = 0;

        for (const t of json.tegakan ?? []) {
          const lat = Number(t.latitude);
          const lng = Number(t.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          const s = (t.health_status ?? "hidup") as string;
          const area = t.area_monitoring as { nama?: string } | null;
          allMarkers.push({
            id: `teg-${t.id}`,
            lat, lng,
            layer: s === "hidup" ? "tegakan_hidup" : "tegakan_mati",
            kode: t.kode_tegakan ?? "-",
            spesies: t.spesies ?? "-",
            status: s,
            tinggi: t.tinggi_cm != null ? `${t.tinggi_cm} cm` : "-",
            diameter: t.diameter_cm != null ? `${t.diameter_cm} cm` : "-",
            zona: area?.nama ?? "-",
          } as TegakanMarker);
        }

        for (const p of json.penyulaman ?? []) {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          allMarkers.push({
            id: `pen-${p.id}`,
            lat, lng,
            layer: "penyulaman",
            tanggal: p.tanggal ?? "-",
            spesies: p.spesies ?? "-",
            jumlah_bibit: p.jumlah_bibit ?? 0,
            jumlah_hidup: p.jumlah_hidup,
            survival_rate: p.survival_rate,
            status: p.status ?? "-",
          } as PenyulamanMarker);
        }

        for (const k of json.kualitas_air ?? []) {
          const lat = Number(k.latitude);
          const lng = Number(k.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          const area = k.area_monitoring as { nama?: string } | null;
          allMarkers.push({
            id: `kua-${k.id}`,
            lat, lng,
            layer: "kualitas_air",
            tanggal: k.tanggal ?? "-",
            titik_sampling: k.titik_sampling ?? null,
            ph: k.ph ?? 0,
            do_mgl: k.do_mgl ?? 0,
            salinitas_ppt: k.salinitas_ppt ?? 0,
            tss_mgl: k.tss_mgl ?? 0,
            suhu_c: k.suhu_c ?? 0,
            lokasi: area?.nama ?? "-",
          } as KualitasAirMarker);
        }

        setMarkers(allMarkers);
        setSkippedCount(skip);
      } catch {
        setError("Gagal memuat data peta. Periksa koneksi dan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [mounted]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setMarkers([]);
    setSkippedCount(0);

    const fn = async () => {
      try {
        const res = await fetch("/api/peta/data");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        const allMarkers: MapMarker[] = [];
        let skip = 0;

        for (const t of json.tegakan ?? []) {
          const lat = Number(t.latitude);
          const lng = Number(t.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          const s = (t.health_status ?? "hidup") as string;
          const area = t.area_monitoring as { nama?: string } | null;
          allMarkers.push({
            id: `teg-${t.id}`,
            lat, lng,
            layer: s === "hidup" ? "tegakan_hidup" : "tegakan_mati",
            kode: t.kode_tegakan ?? "-",
            spesies: t.spesies ?? "-",
            status: s,
            tinggi: t.tinggi_cm != null ? `${t.tinggi_cm} cm` : "-",
            diameter: t.diameter_cm != null ? `${t.diameter_cm} cm` : "-",
            zona: area?.nama ?? "-",
          } as TegakanMarker);
        }

        for (const p of json.penyulaman ?? []) {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          allMarkers.push({
            id: `pen-${p.id}`,
            lat, lng,
            layer: "penyulaman",
            tanggal: p.tanggal ?? "-",
            spesies: p.spesies ?? "-",
            jumlah_bibit: p.jumlah_bibit ?? 0,
            jumlah_hidup: p.jumlah_hidup,
            survival_rate: p.survival_rate,
            status: p.status ?? "-",
          } as PenyulamanMarker);
        }

        for (const k of json.kualitas_air ?? []) {
          const lat = Number(k.latitude);
          const lng = Number(k.longitude);
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { skip++; continue; }
          const area = k.area_monitoring as { nama?: string } | null;
          allMarkers.push({
            id: `kua-${k.id}`,
            lat, lng,
            layer: "kualitas_air",
            tanggal: k.tanggal ?? "-",
            titik_sampling: k.titik_sampling ?? null,
            ph: k.ph ?? 0,
            do_mgl: k.do_mgl ?? 0,
            salinitas_ppt: k.salinitas_ppt ?? 0,
            tss_mgl: k.tss_mgl ?? 0,
            suhu_c: k.suhu_c ?? 0,
            lokasi: area?.nama ?? "-",
          } as KualitasAirMarker);
        }

        setMarkers(allMarkers);
        setSkippedCount(skip);
      } catch {
        setError("Gagal memuat data peta. Periksa koneksi dan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, []);

  const visibleMarkers = markers.filter((m) => enabledLayers[m.layer]);

  const handleZoomAll = useCallback(() => {
    if (visibleMarkers.length === 0 || typeof window === "undefined") return;
    const L = require("leaflet");
    const bounds = L.latLngBounds(visibleMarkers.map((m) => [m.lat, m.lng]));
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [visibleMarkers]);

  useEffect(() => {
    if (!compact || visibleMarkers.length === 0 || typeof window === "undefined") return;
    const timer = setTimeout(() => {
      const L = require("leaflet");
      const bounds = L.latLngBounds(visibleMarkers.map((m) => [m.lat, m.lng]));
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [compact, visibleMarkers]);

  const colorDot = (color: string) => (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: 10, height: 10, backgroundColor: color }}
    />
  );

  if (!mounted) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Memuat peta...
      </div>
    );
  }

  const mapHeight = compact ? "h-[400px]" : "h-[calc(100vh-14rem)] min-h-[400px]";

  if (error) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="size-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/50"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white`} style={{ isolation: "isolate", contain: "paint" }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-lg">
            <Loader2 className="size-4 animate-spin text-brand-green-medium" />
            Memuat data spasial...
          </div>
        </div>
      )}

      <div className={`w-full ${mapHeight}`}>
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInit mapRef={mapRef} />

          {visibleMarkers.map((m) => {
            const color = LAYER_CONFIG[m.layer]?.color ?? "#6b7280";
            const icon = createMarkerIcon(color);
            if (!icon) return null;

            return (
              <MarkerComp key={m.id} position={[m.lat, m.lng]} icon={icon}>
                <Popup>
                  {(() => {
                    if (m.layer === "tegakan_hidup" || m.layer === "tegakan_mati") {
                      const tm = m as TegakanMarker;
                      return (
                        <div className="min-w-[160px] text-sm">
                          <p className="mb-1 font-semibold text-slate-900">{tm.kode}</p>
                          <div className="space-y-0.5 text-xs text-slate-600">
                            <p>{tm.spesies}</p>
                            <p className="flex items-center gap-1.5">
                              {colorDot(color)}
                              <span className="font-medium capitalize">{tm.status}</span>
                            </p>
                            <p className="text-slate-400">{tm.zona}</p>
                            {!compact && <p className="text-slate-400">{tm.tinggi} | {tm.diameter}</p>}
                          </div>
                        </div>
                      );
                    }
                    if (m.layer === "penyulaman") {
                      const pm = m as PenyulamanMarker;
                      return (
                        <div className="min-w-[160px] text-sm">
                          <p className="mb-1 font-semibold text-slate-900">Penyulaman</p>
                          <div className="space-y-0.5 text-xs text-slate-600">
                            <p>{new Date(pm.tanggal).toLocaleDateString("id-ID")}</p>
                            <p>{pm.spesies}</p>
                            <p>
                              {pm.jumlah_bibit.toLocaleString("id-ID")} bibit
                              {pm.jumlah_hidup != null
                                ? ` (hidup: ${pm.jumlah_hidup.toLocaleString("id-ID")})`
                                : ""}
                            </p>
                            {!compact && pm.survival_rate != null && (
                              <p>
                                Survival:{" "}
                                <span className="font-medium text-brand-green-medium">
                                  {pm.survival_rate}%
                                </span>
                              </p>
                            )}
                            {!compact && <p className="capitalize text-slate-400">Status: {pm.status}</p>}
                          </div>
                        </div>
                      );
                    }
                    const km = m as KualitasAirMarker;
                    return (
                      <div className="min-w-[160px] text-sm">
                        <p className="mb-1 font-semibold text-slate-900">Sampling Air</p>
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <p>{new Date(km.tanggal).toLocaleDateString("id-ID")}</p>
                          {km.titik_sampling && <p className="text-slate-400">Titik: {km.titik_sampling}</p>}
                          <p className="text-slate-400">{km.lokasi}</p>
                          {!compact && (
                            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                              <span>pH: {km.ph.toFixed(2)}</span>
                              <span>DO: {km.do_mgl.toFixed(2)} mg/L</span>
                              <span>Sal: {km.salinitas_ppt.toFixed(1)} ppt</span>
                              <span>TSS: {km.tss_mgl.toFixed(1)} mg/L</span>
                              <span>Suhu: {km.suhu_c.toFixed(1)}°C</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </Popup>
              </MarkerComp>
            );
          })}
        </MapContainer>
      </div>

      {/* Layer Legend — Floating */}
      {compact ? (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/90 px-3 py-2 shadow backdrop-blur-sm">
          <div className="flex flex-wrap gap-3 text-xs">
            {Object.entries(LAYER_CONFIG).map(([key, cfg]) => {
              const count = markers.filter((m) => m.layer === key).length;
              return (
                <span key={key} className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                  <span className="text-slate-400">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setLayerPanelOpen((v) => !v)}
            className="absolute right-4 top-4 z-[1000] flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-sm transition hover:bg-slate-100"
            title={layerPanelOpen ? "Sembunyikan panel" : "Tampilkan panel"}
          >
            <Layers className="size-4 text-slate-500" />
          </button>

          {layerPanelOpen && (
            <div className="absolute right-4 top-16 z-[1000] w-52 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Layer</span>
              </div>
              <div className="space-y-1">
                {Object.entries(LAYER_CONFIG).map(([key, cfg]) => {
                  const shown = markers.filter((m) => m.layer === key).length;
                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={enabledLayers[key]}
                        onChange={() => setEnabledLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="size-4 rounded border-slate-300 text-brand-green-medium focus:ring-brand-green-medium/30"
                      />
                      <span className="inline-block size-3 shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span>{cfg.label}</span>
                      <span className="ml-auto text-xs text-slate-400">{shown}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleZoomAll}
                  disabled={visibleMarkers.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Maximize2 className="size-3.5" />
                  Zoom ke Semua Marker
                </button>
              </div>
            </div>
          )}
          {visibleMarkers.length > 0 && (
            <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/90 px-3 py-1.5 text-xs text-slate-500 shadow backdrop-blur-sm">
              {visibleMarkers.length} marker
              {skippedCount > 0 && (
                <span className="ml-1 text-amber-500">({skippedCount} tanpa koordinat)</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
