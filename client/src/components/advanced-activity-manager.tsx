import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { 
  Button, 
  Card, 
  CardContent, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Camera, 
  Edit2, 
  Trash2, 
  Plus, 
  DollarSign, 
  Calendar, 
  GripVertical, 
  MapPin,
  Target,
  Clock,
  FileText,
  Star,
  Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Types
interface PlannedActivity {
  id: string;
  title: string;
  description?: string;
  category: string;
  location?: string;
  estimatedCost?: number;
  duration?: string;
  priority: 'high' | 'medium' | 'low';
  attachments?: Array<{
    name: string;
    url: string;
    type: 'image' | 'document' | 'video' | 'other';
  }>;
  urls?: string[];
  notes?: string;
  dateTime?: string;
  status: 'planned' | 'booked' | 'completed' | 'cancelled';
  createdAt?: string;
}

// Activity Categories
const activityCategories = {
  sightseeing: { label: 'Pontos Turísticos', icon: '🏛️' },
  adventure: { label: 'Aventura', icon: '🏔️' },
  culture: { label: 'Cultura', icon: '🎨' },
  food: { label: 'Gastronomia', icon: '🍽️' },
  shopping: { label: 'Compras', icon: '🛍️' },
  nature: { label: 'Natureza', icon: '🌲' },
  nightlife: { label: 'Vida Noturna', icon: '🌙' },
  wellness: { label: 'Bem-estar', icon: '🧘' }
};

// Priority colors
const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300'
};

// Sortable Activity Item
function SortableActivityItem({ 
  activity, 
  onEdit, 
  onDelete 
}: {
  activity: PlannedActivity;
  onEdit: (activity: PlannedActivity) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="border-2 border-gray-200 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 truncate">{activity.title}</h4>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(activity)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(activity.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${priorityColors[activity.priority]}`}
                >
                  {activity.priority === 'high' ? 'Alta' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
                
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {activityCategories[activity.category as keyof typeof activityCategories]?.label}
                </span>
                
                {activity.estimatedCost && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    R$ {activity.estimatedCost.toLocaleString('pt-BR')}
                  </span>
                )}
                
                {activity.duration && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.duration}
                  </span>
                )}
                
                {activity.location && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {activity.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity Management Dialog with Search and Manual Creation
function ActivityManagementDialog({ 
  activity, 
  isOpen, 
  onClose, 
  onSave,
  tripDestination
}: {
  activity?: PlannedActivity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: PlannedActivity) => void;
  tripDestination?: string;
}) {
  const [activeTab, setActiveTab] = useState(activity ? "manual" : "search");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {activity ? 'Editar Atividade' : 'Adicionar Atividade'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Atividades
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Manual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <ActivitySearchTab 
              onSave={onSave} 
              onClose={onClose} 
              tripDestination={tripDestination}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ActivityFormTab 
              activity={activity} 
              onSave={onSave} 
              onClose={onClose} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Activity Search Tab
function ActivitySearchTab({ 
  onSave, 
  onClose, 
  tripDestination 
}: { 
  onSave: (activity: PlannedActivity) => void; 
  onClose: () => void;
  tripDestination?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [participants, setParticipants] = useState(1);

  // Query for activities by trip destination (shown by default)
  const { data: destinationActivities, isLoading: isLoadingDestination } = useQuery({
    queryKey: ['/api/activities', { 
      location: tripDestination,
      sortBy: 'rating',
      category: selectedCategory === 'all' ? '' : selectedCategory,
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('location', tripDestination || '');
      params.set('sortBy', 'rating');
      if (selectedCategory !== 'all' && selectedCategory) {
        params.set('category', selectedCategory);
      }
      
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch destination activities');
      return response.json();
    },
    enabled: searchTerm.length <= 2 && !!tripDestination,
  });

  // Fallback to popular activities if no destination
  const { data: popularActivities, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['/api/activities', { 
      sortBy: 'rating',
      category: selectedCategory === 'all' ? '' : selectedCategory,
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('sortBy', 'rating');
      if (selectedCategory !== 'all' && selectedCategory) {
        params.set('category', selectedCategory);
      }
      
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch popular activities');
      return response.json();
    },
    enabled: searchTerm.length <= 2 && !tripDestination,
  });

  // Query for search results
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['/api/activities', { 
      search: searchTerm, 
      location: tripDestination,
      category: selectedCategory === 'all' ? '' : selectedCategory,
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('search', searchTerm);
      if (tripDestination) {
        params.set('location', tripDestination);
      }
      if (selectedCategory !== 'all' && selectedCategory) {
        params.set('category', selectedCategory);
      }
      
      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to search activities');
      return response.json();
    },
    enabled: searchTerm.length > 2,
  });

  const activities = searchTerm.length > 2 
    ? searchResults 
    : (tripDestination ? destinationActivities : popularActivities);
  
  const isLoading = searchTerm.length > 2 
    ? isLoadingSearch 
    : (tripDestination ? isLoadingDestination : isLoadingPopular);

  const handleAddToTrip = () => {
    if (!selectedActivity) return;

    const estimatedCost = selectedActivity.priceAmount ? selectedActivity.priceAmount * participants : 0;

    const newActivity: PlannedActivity = {
      id: Date.now().toString(),
      title: selectedActivity.title,
      description: selectedActivity.description,
      category: selectedActivity.category,
      location: selectedActivity.location,
      estimatedCost: estimatedCost,
      duration: selectedActivity.duration || "A definir",
      priority: "medium",
      attachments: [],
      urls: [],
      notes: `Atividade encontrada na busca\nPreço original: R$ ${selectedActivity.priceAmount || 0}\nParticipantes: ${participants}`,
      dateTime: undefined,
      status: "planned"
    };

    onSave(newActivity);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar atividades... (mínimo 3 caracteres)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {Object.entries(activityCategories).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activities Results */}
      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">
            {searchTerm.length > 2 
              ? `Resultados para "${searchTerm}"` 
              : tripDestination 
                ? `Melhores Atividades em ${tripDestination}`
                : 'Atividades Populares'
            }
          </h3>
          <p className="text-sm text-gray-600">
            {searchTerm.length > 2 
              ? 'Selecione uma atividade encontrada' 
              : tripDestination
                ? `As atividades mais escolhidas e bem avaliadas em ${tripDestination}`
                : 'Escolha entre as atividades mais procuradas'
            }
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">
              {searchTerm.length > 2 ? 'Buscando atividades...' : 'Carregando atividades populares...'}
            </p>
          </div>
        ) : activities?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>
              {searchTerm.length > 2 
                ? `Nenhuma atividade encontrada para "${searchTerm}"`
                : tripDestination
                  ? `Nenhuma atividade encontrada em ${tripDestination}`
                  : 'Nenhuma atividade disponível'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities?.slice(0, 10).map((activity: any) => (
              <Card 
                key={activity.id} 
                className={`cursor-pointer transition-all ${
                  selectedActivity?.id === activity.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedActivity(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate">{activity.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{activity.description}</p>
                        </div>
                        {activity.priceAmount && (
                          <div className="text-right ml-4">
                            <p className="font-semibold text-primary">R$ {activity.priceAmount}</p>
                            <p className="text-xs text-gray-500">por pessoa</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {activity.averageRating || 0} ({activity.totalRatings || 0})
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activityCategories[activity.category as keyof typeof activityCategories]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Activity Details */}
      {selectedActivity && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Detalhes da Atividade Selecionada</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participants">Número de Participantes</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Custo Total Estimado</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                <span className="font-semibold text-primary">
                  R$ {((selectedActivity.priceAmount || 0) * participants).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleAddToTrip}
          disabled={!selectedActivity}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar à Viagem
        </Button>
      </div>
    </div>
  );
}

// Activity Form Tab
function ActivityFormTab({ 
  activity, 
  onSave, 
  onClose 
}: {
  activity?: PlannedActivity;
  onSave: (activity: PlannedActivity) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<PlannedActivity>>(
    activity || {
      title: '',
      description: '',
      category: 'sightseeing',
      priority: 'medium',
      estimatedCost: 0,
      duration: '',
      location: '',
      urls: [],
      attachments: [],
      notes: ''
    }
  );

  const [newLink, setNewLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!formData.title) return;

    const savedActivity: PlannedActivity = {
      id: activity?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      priority: formData.priority as any,
      estimatedCost: formData.estimatedCost,
      duration: formData.duration,
      location: formData.location,
      urls: formData.urls || [],
      attachments: formData.attachments || [],
      notes: formData.notes,
      status: "planned",
      createdAt: activity?.createdAt || new Date().toISOString(),
    };

    onSave(savedActivity);
    onClose();
  };

  const addLink = () => {
    if (newLink.trim()) {
      setFormData(prev => ({
        ...prev,
        urls: [...(prev.urls || []), newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls?.filter((_, i) => i !== index) || []
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment = {
            name: file.name,
            url: e.target?.result as string,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' :
                  file.type.includes('pdf') || file.type.includes('doc') ? 'document' : 'other'
          };
          
          setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), attachment]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Visitar Cristo Redentor"
            className="border-2 focus:border-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(activityCategories).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Custo Estimado (R$)</Label>
          <Input
            id="estimatedCost"
            type="number"
            value={formData.estimatedCost || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
            placeholder="0"
            className="border-2 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">🔴 Alta</SelectItem>
              <SelectItem value="medium">🟡 Média</SelectItem>
              <SelectItem value="low">🟢 Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duração</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="Ex: 2-3 horas"
            className="border-2 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ex: Corcovado, Rio de Janeiro"
            className="border-2 focus:border-primary"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva os detalhes da atividade..."
          rows={3}
          className="border-2 focus:border-primary"
        />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <Label>Links Úteis</Label>
        <div className="flex gap-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://exemplo.com"
            className="flex-1"
          />
          <Button onClick={addLink} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.urls && formData.urls.length > 0 && (
          <div className="space-y-2">
            {formData.urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex-1 truncate">
                  {url}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Attachments */}
      <div className="space-y-2">
        <Label>Anexos</Label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Arquivos
        </Button>
        {formData.attachments && formData.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {formData.attachments.map((attachment, index) => (
              <div key={index} className="relative group">
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate">{attachment.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações adicionais..."
          rows={2}
          className="border-2 focus:border-primary"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!formData.title}
          className="bg-primary hover:bg-primary/90"
        >
          {activity ? 'Salvar Alterações' : 'Adicionar Atividade'}
        </Button>
      </div>
    </div>
  );
}

// Main Component
interface AdvancedActivityManagerProps {
  activities: PlannedActivity[];
  onActivitiesChange: (activities: PlannedActivity[]) => void;
  className?: string;
  tripDestination?: string;
}

export function AdvancedActivityManager({ 
  activities, 
  onActivitiesChange, 
  className = '',
  tripDestination
}: AdvancedActivityManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PlannedActivity | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activities.findIndex(activity => activity.id === active.id);
      const newIndex = activities.findIndex(activity => activity.id === over.id);
      onActivitiesChange(arrayMove(activities, oldIndex, newIndex));
    }
  };

  const handleSaveActivity = (activity: PlannedActivity) => {
    if (editingActivity) {
      onActivitiesChange(activities.map(a => a.id === activity.id ? activity : a));
    } else {
      onActivitiesChange([...activities, activity]);
    }
    setEditingActivity(undefined);
  };

  const handleEditActivity = (activity: PlannedActivity) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDeleteActivity = (id: string) => {
    onActivitiesChange(activities.filter(a => a.id !== id));
  };

  const totalEstimatedCost = activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Atividades Planejadas
          </h3>
          <p className="text-sm text-gray-600">
            {activities.length} atividades • Total estimado: R$ {totalEstimatedCost.toLocaleString('pt-BR')}
          </p>
        </div>
        
        <Button
          onClick={() => {
            setEditingActivity(undefined);
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Atividade
        </Button>
      </div>

      {/* Cost Summary */}
      {totalEstimatedCost > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Custo Total das Atividades</span>
              </div>
              <span className="text-xl font-bold text-blue-900">
                R$ {totalEstimatedCost.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma atividade planejada</h4>
              <p className="text-gray-500 mb-4">Adicione atividades para tornar sua viagem ainda mais especial!</p>
              <Button
                onClick={() => {
                  setEditingActivity(undefined);
                  setIsDialogOpen(true);
                }}
                variant="outline"
                className="border-2 border-dashed border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Atividade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                <AnimatePresence>
                  {activities.map((activity) => (
                    <SortableActivityItem
                      key={activity.id}
                      activity={activity}
                      onEdit={handleEditActivity}
                      onDelete={handleDeleteActivity}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Activity Management Dialog */}
      <ActivityManagementDialog
        activity={editingActivity}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveActivity}
        tripDestination={tripDestination}
      />
    </div>
  );
}