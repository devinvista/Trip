import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check } from "lucide-react";
import { popularDestinations } from "@shared/schema";

interface CoverImageSelectorProps {
  currentImage?: string;
  destination?: string;
  onImageSelect: (imageUrl: string) => void;
  trigger?: React.ReactNode;
}

export function CoverImageSelector({ 
  currentImage, 
  destination, 
  onImageSelect, 
  trigger 
}: CoverImageSelectorProps) {
  const [selectedImage, setSelectedImage] = useState(currentImage || "");
  const [customUrl, setCustomUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get suggested images based on destination
  const getSuggestedImages = () => {
    const destinationImages = [];
    
    // Add exact match for destination
    if (destination && destination in popularDestinations) {
      const dest = popularDestinations[destination as keyof typeof popularDestinations];
      destinationImages.push({
        url: dest.image,
        label: destination,
        description: dest.description
      });
    }

    // Add images from same category
    const currentCategory = destination && destination in popularDestinations 
      ? popularDestinations[destination as keyof typeof popularDestinations].category
      : null;

    if (currentCategory) {
      Object.entries(popularDestinations).forEach(([dest, data]) => {
        if (data.category === currentCategory && dest !== destination) {
          destinationImages.push({
            url: data.image,
            label: dest,
            description: data.description
          });
        }
      });
    }

    // Add some general travel images
    const generalImages = [
      {
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
        label: "Paisagem Natural",
        description: "Imagem geral para viagens"
      },
      {
        url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
        label: "Aventura",
        description: "Para viagens de aventura"
      },
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        label: "Arquitetura",
        description: "Para viagens culturais"
      },
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        label: "Praia",
        description: "Para viagens de praia"
      },
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        label: "Montanha",
        description: "Para viagens de montanha"
      }
    ];

    return [...destinationImages, ...generalImages].slice(0, 12);
  };

  const suggestedImages = getSuggestedImages();

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    setSelectedImage(url);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Alterar Imagem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Imagem da Viagem</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Custom URL Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-url">URL da Imagem Personalizada</Label>
            <Input
              id="custom-url"
              type="url"
              placeholder="https://exemplo.com/sua-imagem.jpg"
              value={customUrl}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
            />
          </div>

          {/* Suggested Images */}
          <div className="space-y-2">
            <Label>Imagens Sugeridas</Label>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
                {suggestedImages.map((image, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all relative ${
                      selectedImage === image.url 
                        ? "ring-2 ring-blue-500 shadow-lg" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <CardContent className="p-0">
                      <img 
                        src={image.url} 
                        alt={image.label}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="p-3">
                        <p className="font-medium text-sm">{image.label}</p>
                        <p className="text-xs text-gray-600">{image.description}</p>
                      </div>
                      {selectedImage === image.url && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview */}
          {selectedImage && (
            <div className="space-y-2">
              <Label>Visualização</Label>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={selectedImage} 
                  alt="Visualização da imagem selecionada"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedImage}
            >
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}