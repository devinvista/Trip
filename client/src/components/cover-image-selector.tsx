import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface CoverImageSelectorProps {
  currentImage?: string;
  localidade?: string;
  onImageSelect: (imageUrl: string) => void;
  trigger?: React.ReactNode;
}

export function CoverImageSelector({ 
  currentImage, 
  localidade, 
  onImageSelect, 
  trigger 
}: CoverImageSelectorProps) {
  const [customUrl, setCustomUrl] = useState(currentImage || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirm = () => {
    if (customUrl) {
      onImageSelect(customUrl);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Alterar Capa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Imagem de Capa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL personalizada */}
          <div className="space-y-2">
            <Label htmlFor="custom-url">URL da Imagem</Label>
            <Input
              id="custom-url"
              placeholder="Cole aqui o link da sua imagem..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Cole o link de uma imagem da internet (ex: de Unsplash, Pixabay, etc.)
            </p>
          </div>

          {/* Preview da imagem */}
          {customUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={customUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!customUrl}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}