import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";

interface Destination {
  id: number;
  name: string;
  state?: string;
  country: string;
  region?: string;
  continent: string;
  country_type: "nacional" | "internacional";
}

interface DestinationSelectorProps {
  value?: number;
  onChange: (destinationId: number) => void;
  required?: boolean;
}

export function DestinationSelector({ value, onChange, required = false }: DestinationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const { data: destinations = [], isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
    enabled: true,
  });

  // Filter destinations based on search term
  const filteredDestinations = destinations.filter((dest: Destination) =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set selected destination when value changes
  useEffect(() => {
    if (value && destinations.length > 0) {
      const destination = destinations.find((dest: Destination) => dest.id === value);
      setSelectedDestination(destination || null);
    }
  }, [value, destinations]);

  const handleDestinationSelect = (destinationId: string) => {
    const numericId = parseInt(destinationId);
    const destination = destinations.find((dest: Destination) => dest.id === numericId);
    
    if (destination) {
      setSelectedDestination(destination);
      onChange(numericId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Destino {required && <span className="text-red-500">*</span>}</Label>
        <div className="flex items-center space-x-2 p-3 border rounded-lg">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Carregando destinos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Destino {required && <span className="text-red-500">*</span>}</Label>
      
      {selectedDestination ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-primary/5">
            <MapPin className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="font-medium">{selectedDestination.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedDestination.state && `${selectedDestination.state}, `}
                {selectedDestination.country} • {selectedDestination.continent}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedDestination(null);
                onChange(0);
              }}
            >
              Alterar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={value?.toString()} onValueChange={handleDestinationSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um destino" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination: Destination) => (
                  <SelectItem key={destination.id} value={destination.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{destination.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {destination.state && `${destination.state}, `}
                        {destination.country} • {destination.continent}
                      </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  {searchTerm ? "Nenhum destino encontrado" : "Carregando..."}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {required && !selectedDestination && (
        <p className="text-sm text-red-500">
          Destino é obrigatório
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        As atividades só podem ser criadas em destinos pré-cadastrados
      </p>
    </div>
  );
}