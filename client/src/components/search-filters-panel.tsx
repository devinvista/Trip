import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange: [number, number];
  maxParticipants: number;
  travelStyles: string[];
  minRating: number;
  sortBy: string;
}

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  resultsCount: number;
  className?: string;
}

const travelStyles = [
  { id: 'praia', name: 'Praia', color: 'bg-blue-100 text-blue-800' },
  { id: 'aventura', name: 'Aventura', color: 'bg-green-100 text-green-800' },
  { id: 'urbanas', name: 'Urbanas', color: 'bg-gray-100 text-gray-800' },
  { id: 'cultural', name: 'Cultural', color: 'bg-purple-100 text-purple-800' },
  { id: 'natureza', name: 'Natureza', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'neve', name: 'Neve', color: 'bg-cyan-100 text-cyan-800' }
];

const sortOptions = [
  { value: 'relevance', label: 'Mais Relevantes' },
  { value: 'date', label: 'Data de Início' },
  { value: 'budget-low', label: 'Menor Preço' },
  { value: 'budget-high', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'participants', label: 'Mais Procuradas' }
];

export function SearchFiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  resultsCount,
  className
}: SearchFiltersPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    destination: true,
    dates: true,
    budget: true,
    preferences: false,
    rating: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTravelStyle = (styleId: string) => {
    const newStyles = filters.travelStyles.includes(styleId)
      ? filters.travelStyles.filter(s => s !== styleId)
      : [...filters.travelStyles, styleId];
    
    updateFilters({ travelStyles: newStyles });
  };

  const hasActiveFilters = 
    filters.query ||
    filters.destination ||
    filters.startDate ||
    filters.endDate ||
    filters.budgetRange[0] > 0 ||
    filters.budgetRange[1] < 10000 ||
    filters.maxParticipants < 20 ||
    filters.travelStyles.length > 0 ||
    filters.minRating > 0;

  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        {resultsCount > 0 && (
          <p className="text-sm text-gray-600">
            {resultsCount} viagens encontradas
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search-query"
              placeholder="Título, descrição ou destino..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Destination */}
        <Collapsible
          open={expandedSections.destination}
          onOpenChange={() => toggleSection('destination')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-medium">Destino</span>
              </div>
              {expandedSections.destination ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <Input
              placeholder="Digite o destino..."
              value={filters.destination}
              onChange={(e) => updateFilters({ destination: e.target.value })}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Dates */}
        <Collapsible
          open={expandedSections.dates}
          onOpenChange={() => toggleSection('dates')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Datas</span>
              </div>
              {expandedSections.dates ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Budget */}
        <Collapsible
          open={expandedSections.budget}
          onOpenChange={() => toggleSection('budget')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="font-medium">Orçamento</span>
              </div>
              {expandedSections.budget ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="px-2">
              <Slider
                value={filters.budgetRange}
                onValueChange={(value) => updateFilters({ budgetRange: value as [number, number] })}
                max={10000}
                min={0}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>R$ {filters.budgetRange[0].toLocaleString()}</span>
                <span>R$ {filters.budgetRange[1].toLocaleString()}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Travel Styles */}
        <Collapsible
          open={expandedSections.preferences}
          onOpenChange={() => toggleSection('preferences')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-medium">Estilo de Viagem</span>
              </div>
              {expandedSections.preferences ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="flex flex-wrap gap-2">
              {travelStyles.map((style) => (
                <Badge
                  key={style.id}
                  variant={filters.travelStyles.includes(style.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.travelStyles.includes(style.id) 
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => toggleTravelStyle(style.id)}
                >
                  {style.name}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Rating */}
        <Collapsible
          open={expandedSections.rating}
          onOpenChange={() => toggleSection('rating')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                <span className="font-medium">Avaliação Mínima</span>
              </div>
              {expandedSections.rating ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="px-2">
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilters({ minRating: value[0] })}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0 ⭐</span>
                <span>{filters.minRating} ⭐</span>
                <span>5 ⭐</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Ordenar por</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}