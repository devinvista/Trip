import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch destinations from API
  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['/api/destinations', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await fetch(`/api/destinations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch destinations');
      }
      return response.json();
    }
  });

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
    if (inputValue && !open) {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500 z-10" />
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={`pl-10 pr-10 ${className}`}
            autoComplete="off"
            onFocus={() => setOpen(true)}
          />
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Digite para buscar..."
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
            }}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando destinos..." : "Nenhum destino encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {destinations.slice(0, 10).map((destination: Destination) => {
                const displayName = destination.state 
                  ? `${destination.name}, ${destination.state}` 
                  : `${destination.name}, ${destination.country}`;
                
                return (
                  <CommandItem
                    key={destination.id}
                    value={displayName}
                    onSelect={() => handleSelect(destination)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{displayName}</span>
                      {destination.region && (
                        <span className="text-sm text-gray-500">{destination.region}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}