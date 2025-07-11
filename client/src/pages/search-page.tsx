import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { TripCard } from "@/components/trip-card";
import { TripCardSkeleton } from "@/components/trip-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, SlidersHorizontal, MapPin } from "lucide-react";
import { PlacesAutocomplete } from "@/components/places-autocomplete";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Build query parameters for API call
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (destination) params.destination = destination;
    if (travelStyle && travelStyle !== "all") params.travelStyle = travelStyle;
    if (maxBudget && maxBudget !== "all") {
      const budgetMap: Record<string, string> = {
        "500": "500",
        "1500": "1500", 
        "3000": "3000",
        "5000": "5000"
      };
      params.budget = budgetMap[maxBudget] || maxBudget;
    }
    return params;
  }, [destination, travelStyle, maxBudget]);

  const { data: trips = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/trips", queryParams],
    queryFn: async () => {
      const searchParams = new URLSearchParams(queryParams);
      const res = await fetch(`/api/trips?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering for search term (since API doesn't support text search)
  const filteredTrips = useMemo(() => {
    return trips.filter((trip: any) => {
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        const titleMatch = trip.title?.toLowerCase().includes(searchLower);
        const destinationMatch = trip.destination?.toLowerCase().includes(searchLower);
        const descriptionMatch = trip.description?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !destinationMatch && !descriptionMatch) {
          return false;
        }
      }
      return true;
    });
  }, [trips, searchTerm]);

  // Client-side sorting
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a: any, b: any) => {
      switch (sortBy) {
        case "date":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "price-low":
          return (a.budget || 0) - (b.budget || 0);
        case "price-high":
          return (b.budget || 0) - (a.budget || 0);
        case "popularity":
          return (b.currentParticipants || 0) - (a.currentParticipants || 0);
        default:
          return 0;
      }
    });
  }, [filteredTrips, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-center mb-8">
            Buscar Viagens
          </h1>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por título, destino ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <PlacesAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Destino"
                  className="w-full"
                />

                <Select value={maxBudget} onValueChange={setMaxBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Orçamento máximo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os orçamentos</SelectItem>
                    <SelectItem value="500">Até R$ 500</SelectItem>
                    <SelectItem value="1500">Até R$ 1.500</SelectItem>
                    <SelectItem value="3000">Até R$ 3.000</SelectItem>
                    <SelectItem value="5000">Até R$ 5.000</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={travelStyle} onValueChange={setTravelStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estilo de viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estilos</SelectItem>
                    <SelectItem value="praia">Praia</SelectItem>
                    <SelectItem value="neve">Neve</SelectItem>
                    <SelectItem value="cruzeiros">Cruzeiros</SelectItem>
                    <SelectItem value="natureza">Natureza e Ecoturismo</SelectItem>
                    <SelectItem value="cultural">Culturais e Históricas</SelectItem>
                    <SelectItem value="aventura">Aventura</SelectItem>
                    <SelectItem value="parques">Parques Temáticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm text-gray-600">
                    {filteredTrips.length} viagem(ns) encontrada(s)
                  </span>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data (mais próxima)</SelectItem>
                    <SelectItem value="price-low">Preço (menor)</SelectItem>
                    <SelectItem value="price-high">Preço (maior)</SelectItem>
                    <SelectItem value="popularity">Popularidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma viagem encontrada</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar seus filtros ou criar uma nova viagem.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setDestination("");
                setMaxBudget("");
                setTravelStyle("");
              }}>
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}