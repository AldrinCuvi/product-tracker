import { useState, useEffect, useMemo } from "react";
import { ProductHeader } from "./ProductHeader";
import { Timeline, createTimelineSteps } from "./Timeline";
import { MapView, createMapPoints } from "./MapView";
import { Button } from "./ui/button";
import { Map, ArrowLeft } from "lucide-react";

interface ProductTrackerProps {
  productId?: string;
  onBack?: () => void;
  userCoords?: { lat: number; lng: number };
}

async function fetchProductData(productId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: productId,
    name: "Premium Yellowfin Tuna",
    image:
      "https://media.istockphoto.com/id/477593889/photo/tuna-can.jpg?s=612x612&w=0&k=20&c=yfx_pHScEUA1WfcAXo7IWySPo3WlBN-PWFX4U-9SOJU=",
    species: "Thunnus albacares",
    weight: "150g",
    batchNumber: "BT-2024-0815",
    catchDate: "2025-08-01 00:00:00",
    certifications: ["MSC Certified", "Dolphin Safe", "Fresh"],
    status: "Certified",
    timeline: [
      {
        id: "catch",
        title: "Caught in the Pacific Ocean",
        description:
          "Fresh tuna caught using sustainable fishing methods in international waters.",
        date: "2025-08-01 00:00:00",
        location: "FAO 77, Pacific Ocean",
        status: true,
      },
      {
        id: "port",
        title: "Arrived at Port",
        description:
          "Fish unloaded at port facility for initial processing and quality inspection.",
        date: "2025-08-10 00:00:00",
        location: "Manta, Ecuador",
        status: true,
      },
      {
        id: "factory",
        // title: "Packaged at ALTURA S.A.",
        title: "Packaged at Manta",
        description:
          "Professional processing, packaging, and quality control in certified facility.",
        date: "2025-08-20 00:00:00",
        location: "Manta, Ecuador",
        status: true,
      },
      {
        id: "delivery",
        title: "Arrived at Destination",
        description:
          "Product delivered to final destination ready for distribution.",
        date: "2025-08-25 00:00:00",
        location: "Rotterdam, Netherlands",
        status: true,
      },
    ],
    map: [
      {
        id: "catch",
        name: "Catch Location",
        description: "Yellowfin Tuna caught using sustainable methods.",
        coords: [18.448853, -122.223553],
      },
      {
        id: "port",
        name: "Port of Manta",
        description:
          "Fish unloaded at port facility for initial processing and quality inspection.",
        coords: [-0.94083333, -80.72861111],
      },
      {
        id: "factory",
        name: "Altura S.A.",
        description:
          "Professional processing, packaging, and final quality control.",
        coords: [-2.18613, -79.85817],
      },
      {
        id: "delivery",
        name: "Port of Rotterdam",
        description: "Distributed to retailers.",
        coords: [51.885, 4.2867],
      },
    ],
  };
}

export function ProductTracker({
  productId = "",
  onBack,
  userCoords,
}: ProductTrackerProps) {
  const [showMap, setShowMap] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [baseProductData, setBaseProductData] = useState<any | null>(null);
  const [productData, setProductData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    checkDarkMode();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => mediaQuery.removeEventListener("change", checkDarkMode);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProductData(productId)
      .then((data) => {
        setBaseProductData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!baseProductData) return;

    let newTimeline = [...baseProductData.timeline];
    let newMap = [...baseProductData.map];

    if (userCoords) {
      newTimeline.push({
        id: "user-location",
        title: "Bought at Supermarket ABC",
        description: "You viewed the product at Supermarket ABC.",
        date: new Date(),
        location: "Munich, Germany",
        status: true,
      });

      newMap.push({
        id: "user-location",
        name: "Bought at Supermarket ABC",
        description: "You viewed the product at Supermarket ABC.",
        coords: [48.13743, 11.57549], // [userCoords.lat, userCoords.lng],
        icon: "store",
      });
    }

    setProductData({
      ...baseProductData,
      timeline: newTimeline,
      map: newMap,
    });
  }, [baseProductData, userCoords]);

  const timelineSteps = useMemo(() => {
    if (!productData?.timeline) return [];
    return createTimelineSteps(productData.timeline);
  }, [productData]);

  const mapPoints = useMemo(() => {
    if (!productData?.map) return [];
    return createMapPoints(productData.map);
  }, [productData]);

  /*const logoUrl = isDarkMode
    ? "https://code.altura.systems/public/logos/fipp_negative.png"
    : "https://code.altura.systems/public/logos/fipp.png";*/

  const logoUrl = isDarkMode
    ? "https://ik.imagekit.io/iwc9j72kcv2q/Logos/logo_negative_UHhS-FsC_.png?updatedAt=1760627544076"
    : "https://ik.imagekit.io/iwc9j72kcv2q/Logos/logo_lRnCoYoZt.png?updatedAt=1760627544368";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center bg-background">
        <div className="flex flex-col flex-1 justify-between w-full max-w-4xl p-4 gap-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between gap-4 ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          {/* Product image and info skeleton */}
          <div className="flex gap-6 rounded-lg p-4 bg-card">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          {/* Timeline skeleton */}
          <div className="space-y-4 h-full rounded-lg p-4 bg-card">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          {/* Map button skeleton */}
          <div className="flex justify-center">
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          {/* Footer skeleton */}
          <div className="text-center space-y-2">
            <div className="h-4 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-40 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error loading product</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <div className="container mx-auto pt-0 p-4 max-w-4xl ">
        <div className="header flex items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-4"
              onClick={onBack ? onBack : () => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-row items-center">
              {/*<h1 className="text-xl font-semibold sm:text-2xl">
                FIPP Tracker
              </h1>*/}
              <h1 className="text-xl font-semibold sm:text-2xl">Tracker</h1>
              <span className="h-fit px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-500 border border-blue-800 text-xs font-bold align-middle ml-2">
                BETA
              </span>
            </div>
          </div>
          <img src={logoUrl} alt="ac-logo" className="ac-logo-header" />
          {/*<img src={logoUrl} alt="aciis-logo" className="aciis-logo" />*/}
        </div>

        {/* Product Header */}
        <ProductHeader product={productData} />

        {/* Timeline */}
        <Timeline steps={timelineSteps} />

        {/* Map Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-2"
            size="lg"
          >
            <Map className="w-5 h-5" />
            View Journey Map
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Tracked by ACIIS® TRACE.</p>
          <p className="font-mono text-xs">PRODUCT ID: {productData.id}</p>
        </div>

        {/* Map Modal */}
        {showMap && (
          <MapView
            isOpen={showMap}
            onClose={() => setShowMap(false)}
            points={mapPoints}
          />
        )}
      </div>
    </div>
  );
}
