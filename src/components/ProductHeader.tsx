import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { format } from "date-fns";

interface ProductHeaderProps {
  product: {
    id: string;
    name: string;
    image: string;
    species: string;
    weight: string;
    batchNumber: string;
    catchDate: string;
    certifications: string[];
    status: string;
  };
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "certified":
        return "bg-green-600";
      case "in transit":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full h-48 sm:w-40 sm:h-auto flex-shrink-0">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
          <Badge
            className={`absolute top-2 right-2 font-bold ${getStatusColor(
              product.status
            )} text-white`}
          >
            {product.status}
          </Badge>
        </div>

        <div className="flex-1 space-y-3 sm:min-h-48 flex flex-col justify-between">
          <div>
            <h1 className="mb-1">{product.name}</h1>
            <p className="text-muted-foreground">{product.species}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <p>{product.weight}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Batch:</span>
              <p>{product.batchNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Catch Date:</span>
              <p>{format(product.catchDate, "PPP")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <p className="font-mono">{product.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {product.certifications.map((cert, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
