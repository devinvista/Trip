import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign, 
  Clock, 
  MapPin,
  Link2,
  Paperclip,
  Image,
  FileText,
  Video,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Target,
  Camera,
  Upload,
  X,
  ExternalLink
} from "lucide-react";

import { PlannedActivity, activityCategories } from "@shared/schema";

interface AdvancedActivityManagerProps {
  activities: PlannedActivity[];
  onActivitiesChange: (activities: PlannedActivity[]) => void;
  className?: string;
}

// Priority colors and icons
const priorityConfig = {
  high: { label: "Alta", color: "bg-red-100 text-red-800 border-red-300", icon: "🔴" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: "🟡" },
  low: { label: "Baixa", color: "bg-green-100 text-green-800 border-green-300", icon: "🟢" },
};

// File type icons
const getFileTypeIcon = (type: string) => {
  switch (type) {
    case 'image': return <Image className="h-4 w-4" />;
    case 'document': return <FileText className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    default: return <Paperclip className="h-4 w-4" />;
  }
};

// Sortable Activity Item Component
function SortableActivityItem({ 
  activity, 
  onEdit, 
  onDelete 
}: { 
  activity: PlannedActivity;
  onEdit: (activity: PlannedActivity) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const categoryConfig = activityCategories[activity.category];
  const priorityStyle = priorityConfig[activity.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div {...listeners} className="cursor-move mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Activity Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <span className="text-lg">{categoryConfig.icon}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 truncate">{activity.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{categoryConfig.label}</p>
              </div>
              
              {/* Priority Badge */}
              <Badge variant="outline" className={`${priorityStyle.color} text-xs`}>
                {priorityStyle.icon} {priorityStyle.label}
              </Badge>
            </div>
            
            {/* Description */}
            {activity.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
            )}
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              {activity.estimatedCost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>R$ {activity.estimatedCost.toLocaleString('pt-BR')}</span>
                </div>
              )}
              
              {activity.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{activity.duration}</span>
                </div>
              )}
              
              {activity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-24">{activity.location}</span>
                </div>
              )}
              
              {activity.scheduledDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(activity.scheduledDate).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
            
            {/* Links and Attachments */}
            {(activity.links?.length || activity.attachments?.length) && (
              <div className="flex items-center gap-2 mt-3">
                {activity.links?.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs"
                  >
                    <Link2 className="h-3 w-3" />
                    <span>Link {index + 1}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
                
                {activity.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs"
                  >
                    {getFileTypeIcon(attachment.type)}
                    <span className="truncate max-w-20">{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(activity)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Activity Form Dialog
function ActivityFormDialog({ 
  activity, 
  isOpen, 
  onClose, 
  onSave 
}: {
  activity?: PlannedActivity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: PlannedActivity) => void;
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
      scheduledDate: '',
      links: [],
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
      scheduledDate: formData.scheduledDate,
      links: formData.links || [],
      attachments: formData.attachments || [],
      notes: formData.notes,
      completed: formData.completed || false,
      createdAt: activity?.createdAt || new Date().toISOString(),
    };

    onSave(savedActivity);
    onClose();
  };

  const addLink = () => {
    if (newLink.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...(prev.links || []), newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index) || []
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {activity ? 'Editar Atividade' : 'Nova Atividade'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityCategories).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a atividade..."
              className="border-2 focus:border-primary"
              rows={3}
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Custo Estimado (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="cost"
                  type="number"
                  value={formData.estimatedCost || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="pl-10 border-2 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 2 horas"
                className="border-2 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Corcovado, Rio de Janeiro"
                  className="pl-10 border-2 focus:border-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data Programada</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="pl-10 border-2 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-3">
            <Label>Links de Referência</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://exemplo.com"
                className="flex-1 border-2 focus:border-primary"
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
              />
              <Button type="button" onClick={addLink} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.links && formData.links.length > 0 && (
              <div className="space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <Link2 className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 text-sm truncate">{link}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
            <Label>Anexos</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Arquivos
              </Button>
            </div>
            
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    {getFileTypeIcon(attachment.type)}
                    <span className="flex-1 text-sm truncate">{attachment.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
              placeholder="Notas adicionais..."
              className="border-2 focus:border-primary"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.title}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdvancedActivityManager({ 
  activities, 
  onActivitiesChange, 
  className = "" 
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
      const oldIndex = activities.findIndex(item => item.id === active.id);
      const newIndex = activities.findIndex(item => item.id === over.id);
      
      onActivitiesChange(arrayMove(activities, oldIndex, newIndex));
    }
  };

  const handleSaveActivity = (activity: PlannedActivity) => {
    const existingIndex = activities.findIndex(a => a.id === activity.id);
    
    if (existingIndex >= 0) {
      const updated = [...activities];
      updated[existingIndex] = activity;
      onActivitiesChange(updated);
    } else {
      onActivitiesChange([...activities, activity]);
    }
    
    setEditingActivity(undefined);
  };

  const handleDeleteActivity = (id: string) => {
    onActivitiesChange(activities.filter(a => a.id !== id));
  };

  const handleEditActivity = (activity: PlannedActivity) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
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
          Nova Atividade
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

      {/* Activity Form Dialog */}
      <ActivityFormDialog
        activity={editingActivity}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveActivity}
      />
    </div>
  );
}