import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRealParticipantsCount } from '@/lib/trip-utils';
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
  MapPin,
  Target,
  Clock,
  FileText,
  Star,
  Search,
  Users
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

// Professional Timeline Component
function ActivitiesTimeline({
  activities,
  onEdit,
  onDelete,
  onReorder,
  startDate,
  endDate
}: {
  activities: PlannedActivity[];
  onEdit: (activity: PlannedActivity) => void;
  onDelete: (id: string) => void;
  onReorder: (activities: PlannedActivity[]) => void;
  startDate?: string;
  endDate?: string;
}) {
  // Group activities by date with better date handling
  const groupedActivities = activities.reduce((groups, activity) => {
    let dateKey = 'Sem data definida';
    
    if (activity.dateTime) {
      try {
        let dateValue = activity.dateTime;
        if (dateValue instanceof Date) {
          dateKey = dateValue.toISOString().split('T')[0];
        } 
        else if (typeof dateValue === 'string') {
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dateKey = dateValue;
          }
          else if (dateValue.includes('T')) {
            dateKey = new Date(dateValue).toISOString().split('T')[0];
          }
          else {
            const parsed = new Date(dateValue);
            if (!isNaN(parsed.getTime())) {
              dateKey = parsed.toISOString().split('T')[0];
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing activity date:', activity.dateTime, error);
        dateKey = 'Sem data definida';
      }
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, PlannedActivity[]>);

  const sortedDateGroups = Object.keys(groupedActivities).sort((a, b) => {
    if (a === 'Sem data definida') return 1;
    if (b === 'Sem data definida') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Sem data definida') return dateStr;
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getDayOfWeek = (dateStr: string) => {
    if (dateStr === 'Sem data definida') return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
    } catch {
      return '';
    }
  };

  const getDay = (dateStr: string) => {
    if (dateStr === 'Sem data definida') return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.getDate().toString();
    } catch {
      return '';
    }
  };

  return (
    <div className="relative">
      {/* Timeline Backbone */}
      <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-purple-200 to-transparent"></div>
      
      <div className="space-y-16">
        {sortedDateGroups.map((dateGroup, groupIndex) => (
          <motion.div 
            key={dateGroup}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="relative"
          >
            {/* Date Marker */}
            <div className="absolute left-0 top-0 z-10">
              {dateGroup !== 'Sem data definida' ? (
                <div className="flex items-center gap-4">
                  <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg p-3 min-w-[100px] text-center">
                    <div className="text-xs font-bold text-blue-600 mb-1">
                      {getDayOfWeek(dateGroup)}
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                      {getDay(dateGroup)}
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md"></div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl shadow-lg p-3 min-w-[100px] text-center">
                    <div className="text-xs font-medium text-gray-500">
                      SEM DATA
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gray-400 rounded-full shadow-md"></div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="ml-32">
              {/* Date Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {formatDate(dateGroup)}
                </h3>
                <p className="text-sm text-slate-500">
                  {groupedActivities[dateGroup].length} atividade{groupedActivities[dateGroup].length !== 1 ? 's' : ''} planejada{groupedActivities[dateGroup].length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {groupedActivities[dateGroup]
                  .sort((a, b) => {
                    // Sort by time if available
                    if (a.dateTime?.includes('T') && b.dateTime?.includes('T')) {
                      return a.dateTime.localeCompare(b.dateTime);
                    }
                    return 0;
                  })
                  .map((activity, activityIndex) => {
                    const formatTime = (dateTime?: string) => {
                      if (!dateTime || !dateTime.includes('T')) return null;
                      try {
                        return new Date(dateTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch {
                        return null;
                      }
                    };

                    const getPriorityConfig = (priority: string) => {
                      switch (priority) {
                        case 'high':
                          return { 
                            color: 'text-red-700 bg-red-50 border-red-200', 
                            accent: 'border-red-400',
                            dot: 'bg-red-500' 
                          };
                        case 'medium':
                          return { 
                            color: 'text-amber-700 bg-amber-50 border-amber-200', 
                            accent: 'border-amber-400',
                            dot: 'bg-amber-500' 
                          };
                        case 'low':
                          return { 
                            color: 'text-emerald-700 bg-emerald-50 border-emerald-200', 
                            accent: 'border-emerald-400',
                            dot: 'bg-emerald-500' 
                          };
                        default:
                          return { 
                            color: 'text-gray-700 bg-gray-50 border-gray-200', 
                            accent: 'border-gray-400',
                            dot: 'bg-gray-500' 
                          };
                      }
                    };

                    const getCategoryConfig = (category: string) => {
                      const categoryInfo = activityCategories[category as keyof typeof activityCategories];
                      return {
                        icon: categoryInfo?.icon || '📌',
                        label: categoryInfo?.label || category,
                        gradient: category === 'adventure' ? 'from-orange-500 to-red-500' :
                                  category === 'culture' ? 'from-purple-500 to-pink-500' :
                                  category === 'food' ? 'from-yellow-500 to-orange-500' :
                                  category === 'nature' ? 'from-green-500 to-emerald-500' :
                                  category === 'sightseeing' ? 'from-blue-500 to-cyan-500' :
                                  'from-gray-500 to-slate-500'
                      };
                    };

                    const priorityConfig = getPriorityConfig(activity.priority);
                    const categoryConfig = getCategoryConfig(activity.category);
                    const time = formatTime(activity.dateTime);

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: activityIndex * 0.1 }}
                        className="group relative"
                      >
                        <Card className={`border-l-4 ${priorityConfig.accent} hover:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm`}>
                          <CardContent className="p-0">
                            {/* Header Section */}
                            <div className="p-5 pb-4">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  {/* Category Icon */}
                                  <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig.gradient} rounded-xl shadow-md flex items-center justify-center text-white text-xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-200`}>
                                    {categoryConfig.icon}
                                  </div>
                                  
                                  {/* Title and Time */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                                      {activity.title}
                                    </h3>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {time && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                                          <Clock className="h-4 w-4" />
                                          {time}
                                        </div>
                                      )}
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${priorityConfig.color}`}>
                                        <div className={`w-2 h-2 rounded-full ${priorityConfig.dot}`}></div>
                                        {activity.priority === 'high' ? 'Alta Prioridade' : 
                                         activity.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(activity)}
                                    className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(activity.id)}
                                    className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Description */}
                              {activity.description && (
                                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                                  {activity.description}
                                </p>
                              )}
                            </div>

                            {/* Info Grid */}
                            <div className="px-5 pb-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {activity.location && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate font-medium">{activity.location}</span>
                                  </div>
                                )}
                                
                                {activity.duration && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                    <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="font-medium">{activity.duration}</span>
                                  </div>
                                )}

                                {activity.estimatedCost && activity.estimatedCost > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                    <DollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                    <span className="font-bold">R$ {activity.estimatedCost.toLocaleString('pt-BR')}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                  <span className="font-medium">{categoryConfig.label}</span>
                                </div>
                              </div>
                            </div>

                            {/* Notes Section */}
                            {activity.notes && (
                              <div className="px-5 pb-5">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-700 leading-relaxed">{activity.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



// Legacy Sortable Activity Item (for backward compatibility)
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
  tripDestination,
  tripParticipants = 1,
  tripMaxParticipants,
  tripStartDate,
  tripEndDate
}: {
  activity?: PlannedActivity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: PlannedActivity) => void;
  tripDestination?: string;
  tripParticipants?: number;
  tripMaxParticipants?: number;
  tripStartDate?: string;
  tripEndDate?: string;
}) {
  const [activeTab, setActiveTab] = useState(activity ? "manual" : "search");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto" aria-describedby="activity-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {activity ? 'Editar Atividade' : 'Adicionar Atividade'}
          </DialogTitle>
          <p id="activity-dialog-description" className="sr-only">
            {activity ? 'Formulário para editar uma atividade existente' : 'Formulário para adicionar uma nova atividade à viagem'}
          </p>
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
              tripParticipants={tripParticipants}
              tripMaxParticipants={tripMaxParticipants}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ActivityFormTab 
              activity={activity} 
              onSave={onSave} 
              onClose={onClose}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
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
  tripDestination,
  tripParticipants = 1,
  tripMaxParticipants,
  tripStartDate,
  tripEndDate
}: { 
  onSave: (activity: PlannedActivity) => void; 
  onClose: () => void;
  tripDestination?: string;
  tripParticipants?: number;
  tripMaxParticipants?: number;
  tripStartDate?: string;
  tripEndDate?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Use max participants for cost estimation (planning for full trip capacity)
  const participants = tripMaxParticipants || tripParticipants;

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
      dateTime: selectedDate || undefined,
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <Label>Participantes da Viagem</Label>
              <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">
                    {participants} {participants === 1 ? 'participante' : 'participantes'}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Calculado automaticamente baseado na viagem
                </p>
              </div>
            </div>
            <div>
              <Label>Custo Total Estimado</Label>
              <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">
                    R$ {((selectedActivity.priceAmount || 0) * participants).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  R$ {(selectedActivity.priceAmount || 0).toLocaleString('pt-BR')} × {participants} {participants === 1 ? 'pessoa' : 'pessoas'}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="activityDate">Data da Atividade</Label>
              <Input
                id="activityDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={tripStartDate ? formatDateForInput(tripStartDate) : undefined}
                max={tripEndDate ? formatDateForInput(tripEndDate) : undefined}
                className="mt-1"
              />
              {tripStartDate && tripEndDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Entre {new Date(tripStartDate).toLocaleDateString('pt-BR')} e {new Date(tripEndDate).toLocaleDateString('pt-BR')}
                </p>
              )}
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

// Helper function to convert date to YYYY-MM-DD format without timezone issues
function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  // Ensure we get the correct local date regardless of timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Activity Form Tab
function ActivityFormTab({ 
  activity, 
  onSave, 
  onClose,
  tripStartDate,
  tripEndDate
}: {
  activity?: PlannedActivity;
  onSave: (activity: PlannedActivity) => void;
  onClose: () => void;
  tripStartDate?: string;
  tripEndDate?: string;
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
      notes: '',
      dateTime: ''
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
      dateTime: formData.dateTime,
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

        <div className="space-y-2">
          <Label htmlFor="dateTime">Data da Atividade</Label>
          <Input
            id="dateTime"
            type="date"
            value={formData.dateTime ? formData.dateTime.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
            min={tripStartDate ? formatDateForInput(tripStartDate) : undefined}
            max={tripEndDate ? formatDateForInput(tripEndDate) : undefined}
            className="border-2 focus:border-primary"
          />
          {tripStartDate && tripEndDate && (
            <p className="text-xs text-gray-500">
              Entre {new Date(tripStartDate).toLocaleDateString('pt-BR')} e {new Date(tripEndDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Horário (opcional)</Label>
          <Input
            id="time"
            type="time"
            value={formData.dateTime && formData.dateTime.includes('T') ? formData.dateTime.split('T')[1]?.split('.')[0] : ''}
            onChange={(e) => {
              const date = formData.dateTime ? formData.dateTime.split('T')[0] : '';
              const time = e.target.value;
              if (date && time) {
                setFormData(prev => ({ ...prev, dateTime: `${date}T${time}` }));
              } else if (date) {
                setFormData(prev => ({ ...prev, dateTime: date }));
              }
            }}
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
  trip?: any; // Trip object for calculating real participants
  tripParticipants?: number; // Current accepted participants
  tripMaxParticipants?: number; // Max participants for cost estimation
  tripStartDate?: string; // Trip start date for activity scheduling
  tripEndDate?: string; // Trip end date for activity scheduling
}

export function AdvancedActivityManager({ 
  activities, 
  onActivitiesChange, 
  className = '',
  tripDestination,
  trip,
  tripParticipants = 1,
  tripMaxParticipants,
  tripStartDate,
  tripEndDate
}: AdvancedActivityManagerProps) {
  const realParticipantsCount = trip ? getRealParticipantsCount(trip) : tripParticipants;
  const maxParticipantsCount = trip ? trip.maxParticipants : (tripMaxParticipants || tripParticipants);
  const startDate = trip ? trip.startDate : tripStartDate;
  const endDate = trip ? trip.endDate : tripEndDate;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PlannedActivity | undefined>();





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

      {/* Activities Timeline */}
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
          <ActivitiesTimeline 
            activities={activities}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
            onReorder={onActivitiesChange}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>

      {/* Activity Management Dialog */}
      <ActivityManagementDialog
        activity={editingActivity}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveActivity}
        tripDestination={tripDestination}
        tripParticipants={realParticipantsCount}
        tripMaxParticipants={maxParticipantsCount}
        tripStartDate={startDate}
        tripEndDate={endDate}
      />
    </div>
  );
}