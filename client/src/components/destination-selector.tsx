import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Destination {
  id: number;
  name: string;
  state?: string;
  country: string;
  region: string;
  continent: string;
  is_active: boolean;
}

interface DestinationSelectorProps {
  value?: number;
  onValueChange: (destinationId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DestinationSelector({
  value,
  onValueChange,
  placeholder = "Selecione um destino...",
  disabled = false,
  className
}: DestinationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    queryFn: async () => {
      const response = await fetch("/api/destinations", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao carregar destinos");
      }
      return response.json();
    },
  });

  const filteredDestinations = destinations?.filter((destination) =>
    destination.is_active && (
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.region.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  const selectedDestination = destinations?.find(d => d.id === value);

  const getDestinationLabel = (destination: Destination) => {
    return destination.state 
      ? `${destination.name}, ${destination.state}` 
      : `${destination.name}, ${destination.country}`;
  };

  const groupedDestinations = filteredDestinations.reduce((acc, destination) => {
    const region = destination.region || "Outros";
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(destination);
    return acc;
  }, {} as Record<string, Destination[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {selectedDestination ? (
              <span className="truncate">{getDestinationLabel(selectedDestination)}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar destinos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Carregando destinos...
              </div>
            ) : filteredDestinations.length === 0 ? (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhum destino encontrado
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tente buscar por cidade, estado ou região
                  </p>
                </div>
              </CommandEmpty>
            ) : (
              Object.entries(groupedDestinations).map(([region, regionDestinations]) => (
                <CommandGroup key={region} heading={region}>
                  {regionDestinations.map((destination) => (
                    <CommandItem
                      key={destination.id}
                      value={destination.id.toString()}
                      onSelect={() => {
                        onValueChange(destination.id === value ? undefined : destination.id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === destination.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{getDestinationLabel(destination)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {destination.continent}
                          </Badge>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}