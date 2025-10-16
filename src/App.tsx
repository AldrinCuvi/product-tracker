import { useState, useEffect, useRef } from "react";
import { ProductTracker } from "./components/ProductTracker";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Scan } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { Html5Qrcode } from "html5-qrcode";

export default function App() {
  const [currentView, setCurrentView] = useState<"scanner" | "tracker">(
    "scanner"
  );
  const [productId, setProductId] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [idw, setIdw] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);

  // Detectar modo oscuro automáticamente
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

  // Obtener ubicación del usuario al cargar la página
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationReady(true);
        },
        (error) => {
          setLocationReady(true); // Usuario rechazó o falló
        }
      );
    } else {
      setLocationReady(true); // No soportado
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const workspaceId = urlParams.get("idw");
    if (workspaceId) {
      setIdw(workspaceId);
    }
    if (id) {
      setProductId(id);
      setCurrentView("tracker");
    }
  }, []);

  const handleManualEntry = () => {
    if (productId.trim()) {
      setCurrentView("tracker");
      const url = new URL(window.location.href);
      url.searchParams.delete("id"); // Limpiar id existente
      url.searchParams.set("id", productId);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Cleanup function for QR scanner
  useEffect(() => {
    return () => {
      if (qrRef.current) {
        qrRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (decodedText && decodedText.includes("fipp.aciis.services")) {
            try {
              const url = new URL(decodedText);
              const scannedId = url.searchParams.get("id");

              if (scannedId) {
                html5QrCode.stop();
                setShowScanner(false);
                setProductId(scannedId);
                setCurrentView("tracker");

                // CAMBIAR LOGÍCA PARA QUE REALICE LA PETICIÓN FETCH PARA OBTENER LOS DATOS DEL PRODUCTO
                // Y EN LUGAR DE MOVER LA RUTA CARGA ALLÍ MISMO EL TRACKER

                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete("id");
                currentUrl.searchParams.set("id", scannedId);
                window.history.pushState({}, "", currentUrl.toString());
              }
            } catch (error) {
              console.error("Error processing QR URL:", error);
            }
          }
        },
        (error) => {}
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      alert("Error accessing camera. Please check permissions.");
      setShowScanner(false);
    }
  };

  /*
  const logoUrl = isDarkMode
    ? "https://code.altura.systems/public/logos/fipp_negative.png"
    : "https://code.altura.systems/public/logos/fipp.png";
*/

  const logoUrl = isDarkMode
    ? "https://ik.imagekit.io/iwc9j72kcv2q/Logos/logo_negative_UHhS-FsC_.png?updatedAt=1760627544076"
    : "https://ik.imagekit.io/iwc9j72kcv2q/Logos/logo_lRnCoYoZt.png?updatedAt=1760627544368";

  if (!locationReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Waiting for location...</p>
      </div>
    );
  }

  if (currentView === "tracker") {
    return (
      <ProductTracker
        productId={productId}
        onBack={() => {
          setCurrentView("scanner");
          setProductId(""); // Limpiar input
          const url = new URL(window.location.href);
          url.searchParams.delete("id"); // Limpiar URL
          window.history.pushState({}, "", url.toString());
        }}
        userCoords={userCoords ?? undefined}
      />
    );
  }

  if (showScanner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative" style={{ width: 320, height: 320 }}>
          <div id="qr-reader" className="rounded-lg overflow-hidden" />
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="h-full w-full flex items-center justify-center">
              <div className="border-2 border-blue-500 rounded-lg w-64 h-64 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 mb-2 text-muted-foreground text-sm">
          Position the QR code within the frame
        </p>
        <Button
          className="mt-2"
          onClick={() => {
            if (qrRef.current) {
              qrRef.current.stop().catch(console.error);
            }
            setShowScanner(false);
          }}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-2">
          {/*<div className="altura-logo">
            <img src={logoUrl} alt="altura-logo" className="mx-auto mb-4" />
          </div>*/}
          <div className="ac-logo-main">
            <img src={logoUrl} alt="ac-logo" className="ac-logo-main mx-auto" />
          </div>
          <div className="w-full flex flex-row justify-center">
            {/* <h1 className="text-xl font-medium">FIPP Tracker</h1> */}
            <h1 className="text-xl font-medium">Tracker</h1>
            <span className="h-fit px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-500 border border-blue-800 text-xs font-bold align-middle ml-2">
              BETA
            </span>
          </div>

          {/*
          <p className="text-base text-muted-foreground">
            Track your seafood products from ocean to table
          </p>
          */}
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => {
              setShowScanner(true);
              // Iniciamos el scanner en el siguiente ciclo para asegurar que el DOM esté listo
              setTimeout(startScanner, 100);
            }}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            <Scan className="w-5 h-5" />
            Scan Product QR
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter manually
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Enter product ID (e.g., 12345678)"
              value={productId}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                setProductId(onlyNumbers);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleManualEntry()}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <Button
              onClick={handleManualEntry}
              variant="outline"
              className="track-btn w-full"
              disabled={!productId.trim()}
            >
              Track Product
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>
            {/*
            <a
              href="https://altura.com.ec/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Altura
            </a>{" "}
            */}
            Aldrin Cuvi © 2025
          </p>
          <p>All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
}
