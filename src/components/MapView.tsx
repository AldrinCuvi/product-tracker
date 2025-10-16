import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import L, { Polyline as LeafletPolyline } from "leaflet";
import { renderToString } from "react-dom/server";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Ship, ShipWheel, Factory, Globe, X, Store } from "lucide-react";

// --- Interfaces ---
interface MapPoint {
  id: string;
  name: string;
  description: string;
  coords: [number, number];
  icon: "ship" | "port" | "factory" | "destination" | "store";
}
interface MapViewProps {
  isOpen: boolean;
  onClose: () => void;
  points: MapPoint[];
}

// --- Funciones Auxiliares (Helpers) ---

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  return isDark;
}

const getIconComponent = (type: MapPoint["icon"]) => {
  const props = { className: "w-6 h-6" };
  switch (type) {
    case "ship":
      return <Ship {...props} color="#3b82f6" />;
    case "port":
      return <ShipWheel {...props} color="#f97316" />;
    case "factory":
      return <Factory {...props} color="#8b5cf6" />;
    case "destination":
      return <Globe {...props} color="#22c55e" />;
    case "store":
      return <Store {...props} color="#c5ad22" />;
  }
};

const getIconColorClasses = (type: MapPoint["icon"]) => {
  switch (type) {
    case "ship":
      return "border-blue-500 bg-blue-50 dark:bg-blue-950";
    case "port":
      return "border-orange-500 bg-orange-50 dark:bg-orange-950";
    case "factory":
      return "border-purple-500 bg-purple-50 dark:bg-purple-950";
    case "destination":
      return "border-green-500 bg-green-50 dark:bg-green-950";
    case "store":
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
  }
};

const createCustomIcon = (point: MapPoint, isVisible: boolean) => {
  if (!isVisible) return L.divIcon({ className: "hidden" });
  const iconHtml = renderToString(
    <div className="relative flex items-center justify-center">
      <div
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 ${getIconColorClasses(
          point.icon
        )}`}
      >
        {getIconComponent(point.icon)}
      </div>
      <div
        className={`absolute inset-0 rounded-full border-2 ${
          getIconColorClasses(point.icon).split(" ")[0]
        } animate-ping opacity-75`}
      ></div>
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: "bg-transparent border-none",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
};

// --- Componente Dedicado y "Memorizado" para la Línea Animada ---
interface AnimatedPolylineProps {
  positions: [number, number][];
  totalAnimationTime: number;
  onPathReady?: (path: SVGPathElement) => void;
}

const AnimatedPolyline = memo(function AnimatedPolyline({
  positions,
  totalAnimationTime,
  onPathReady,
}: AnimatedPolylineProps) {
  const polylineRef = useRef<LeafletPolyline>(null);
  const map = useMap();
  const pathReadyRef = useRef(false); // Evitar múltiples disparos

  useEffect(() => {
    if (polylineRef.current) {
      const path = polylineRef.current.getElement() as SVGPathElement;
      if (path && !pathReadyRef.current) {
        pathReadyRef.current = true;

        const length = path.getTotalLength();

        // Inicializamos invisible
        path.style.transition = "none";
        path.style.strokeDasharray = length.toString();
        path.style.strokeDashoffset = length.toString();

        // Forzar reflow
        path.getBoundingClientRect();

        // Animar de inicio a fin
        path.style.transition = `stroke-dashoffset ${totalAnimationTime}s linear`;
        path.style.strokeDashoffset = "0";

        // Notificar que el path está listo
        if (onPathReady) onPathReady(path);
      }
    }
  }, [map, totalAnimationTime, onPathReady]);

  return (
    <Polyline
      ref={polylineRef}
      positions={positions}
      pathOptions={{
        color: "#3b82f6",
        weight: 5,
        opacity: 0.8,
      }}
    />
  );
});

// --- Componente Principal MapView ---
export function MapView({ isOpen, onClose, points }: MapViewProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const isDarkMode = useDarkMode();
  const allCoords = useMemo(() => points.map((p) => p.coords), [points]);

  const totalAnimationTime = 3; // segundos

  // Resetear animationStep al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setAnimationStep(0);
    }
  }, [isOpen]);

  // Callback para sincronizar iconos con la línea
  const handlePathReady = useCallback(() => {
    // Calcular distancias entre puntos
    const distances: number[] = [];
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const d = L.latLng(points[i - 1].coords).distanceTo(points[i].coords);
      distances.push(d);
      totalDistance += d;
    }

    // Calcular el tiempo acumulado para cada punto
    let accumulated = 0;
    points.forEach((point, i) => {
      let ratio = 0;
      if (i === 0) {
        ratio = 0;
      } else {
        accumulated += distances[i - 1];
        ratio = accumulated / totalDistance;
      }

      const appearTime = ratio * totalAnimationTime * 1000;

      setTimeout(() => {
        setAnimationStep((prev) =>
          Math.min(points.length, Math.max(prev, i + 1))
        );
      }, appearTime);
    });
  }, [points, totalAnimationTime]);

  const bounds = L.latLngBounds(allCoords);

  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">Journey Map</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div
          className={`relative w-full flex-grow ${isDarkMode ? "dark" : ""}`}
        >
          <MapContainer
            bounds={bounds}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ minHeight: "400px" }}
            boundsOptions={{ padding: [50, 50] }}
            attributionControl={false}
          >
            <TileLayer url={tileUrl} attribution="" />

            {/* Línea animada */}
            <AnimatedPolyline
              positions={allCoords}
              totalAnimationTime={totalAnimationTime}
              onPathReady={handlePathReady}
            />

            {/* Íconos progresivos */}
            {points.slice(0, animationStep).map((point, index) => (
              <Marker
                key={point.id}
                position={point.coords}
                icon={createCustomIcon(point, true)}
              >
                <Popup className="custom-popup">
                  <div className="w-64">
                    <div className="flex items-center gap-3 mb-2">
                      {getIconComponent(point.icon)}
                      <h4 className="font-bold text-base">{point.name}</h4>
                    </div>
                    <p className="text-sm opacity-90">{point.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="p-4 border-t space-y-3 shrink-0 bg-background/50">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Ship className="w-4 h-4 text-blue-500" />
              <span>Catch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShipWheel className="w-4 h-4 text-orange-500" />
              <span>Port</span>
            </div>
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-purple-500" />
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" />
              <span>Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-yellow-500" />
              <span>Store</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click a checkpoint to see details.
          </p>
        </div>
      </Card>
    </div>
  );
}

export function createMapPoints(productData?: any): MapPoint[] {
  const iconsMap = {
    catch: "ship",
    port: "port",
    factory: "factory",
    delivery: "destination",
    destination: "destination",
    "user-location": "store",
    store: "store",
  };

  if (!Array.isArray(productData)) return [];

  return productData
    .filter(
      (item) =>
        item &&
        Array.isArray(item.coords) &&
        item.coords.length === 2 &&
        iconsMap[item.id]
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      coords: item.coords,
      icon: iconsMap[item.id],
    }));
}
