import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Ship,
  Building,
  Factory,
  Globe,
  MapPin,
  Store,
  CheckCircle2,
  XCircle,
  ShipWheel,
} from "lucide-react";
import { format } from "date-fns";

interface ProductData {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  status: boolean;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: boolean; // changed from completed to status
  icon: React.ReactNode;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <Card className="p-4 mb-6">
      <h2 className="text-lg font-medium">Product Journey</h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                  step.status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                  w-0.5 h-8 mt-2
                  ${step.status ? "bg-primary" : "bg-muted"}
                `}
                />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3
                  className={
                    step.status ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {step.title}
                </h3>
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium ${
                    step.status
                      ? "bg-blue-50 dark:bg-blue-950 text-blue-500 border border-blue-800"
                      : "bg-gray-100 text-gray-300 border border-gray-500 dark:bg-gray-700"
                  }`}
                >
                  {step.status ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Pending</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {step.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {step.location}
                </span>
                {step.status && (
                  <span className="text-muted-foreground">{step.date}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function createTimelineSteps(
  productData: ProductData[]
): TimelineStep[] {
  const icons = [
    <Ship key="ship" className="w-5 h-5" />,
    <ShipWheel key="building" className="w-5 h-5" />,
    <Factory key="factory" className="w-5 h-5" />,
    <Globe key="globe" className="w-5 h-5" />,
    <Store key="store" className="w-5 h-5" />,
  ];

  return productData.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    location: item.location ?? "",
    date: format(item.date, "PPP") ?? "",
    status: item.status, // changed from completed to status
    icon: icons[index],
  }));
}
