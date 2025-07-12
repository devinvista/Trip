import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { popularDestinations } from "@shared/schema";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Get popular destinations from schema
const popularCities = Object.keys(popularDestinations).sort();

export function PlacesAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Buscar cidades...",
  className = "" 
}: PlacesAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (city: string) => {
    onChange(city);
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
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredCities.slice(0, 10).map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => handleSelect(city)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}