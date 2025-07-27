import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Destination {
  id: number;
  name: string;
  state?: string;
  country: string;
  region?: string;
  continent: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onDestinationSelect?: (destination: Destination) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({ 
  value, 
  onChange, 
  onDestinationSelect,
  placeholder = "Buscar destinos...",
  className = "" 
}: PlacesAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch destinations from API - always fetch to show initial options
  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['/api/destinations', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      const response = await fetch(`/api/destinations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch destinations');
      }
      return response.json();
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (destination: Destination) => {
    const displayName = destination.state 
      ? `${destination.name}, ${destination.state}` 
      : `${destination.name}, ${destination.country}`;
    
    onChange(displayName);
    onDestinationSelect?.(destination);
    setOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setSearchTerm(inputValue);
    setOpen(true);
  };

  const handleInputFocus = () => {
    setOpen(true);
    setSearchTerm(value);
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500 z-10" />
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
          autoComplete="off"
          onFocus={handleInputFocus}
          onClick={() => setOpen(true)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={handleToggleOpen}
          type="button"
          tabIndex={-1}
        >
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Carregando destinos...</div>
          ) : destinations.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">Nenhum destino encontrado.</div>
          ) : (
            <div className="py-1">
              {destinations.slice(0, 10).map((destination: Destination) => {
                const displayName = destination.state 
                  ? `${destination.name}, ${destination.state}` 
                  : `${destination.name}, ${destination.country}`;
                
                return (
                  <button
                    key={destination.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => handleSelect(destination)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{displayName}</span>
                      {destination.region && (
                        <span className="text-xs text-gray-500">{destination.region}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}