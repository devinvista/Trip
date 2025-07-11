import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCollaborativeEditing } from '@/hooks/use-collaborative-editing';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Save, 
  Edit3, 
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export interface TripData {
  id: number;
  title: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxParticipants: number;
  travelStyle: string;
}

interface CollaborativeTripEditorProps {
  tripId: string;
  initialData: TripData;
  onSave?: (data: TripData) => void;
  className?: string;
}

export function CollaborativeTripEditor({
  tripId,
  initialData,
  onSave,
  className = ""
}: CollaborativeTripEditorProps) {
  const { toast } = useToast();
  const [tripData, setTripData] = useState<TripData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  
  const {
    participants,
    isConnected,
    tripState,
    editingField,
    lastUpdate,
    sendEdit,
    sendFieldFocus,
    sendFieldBlur
  } = useCollaborativeEditing(tripId);

  // Merge collaborative changes with local state
  useEffect(() => {
    if (tripState && Object.keys(tripState).length > 0) {
      setTripData(prevData => ({ ...prevData, ...tripState }));
    }
  }, [tripState]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    const changes = { [field]: value };
    setTripData(prev => ({ ...prev, ...changes }));
    sendEdit(changes);
  }, [sendEdit]);

  const handleFieldFocus = useCallback((fieldName: string) => {
    setActiveField(fieldName);
    sendFieldFocus(fieldName);
  }, [sendFieldFocus]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    setActiveField(null);
    sendFieldBlur(fieldName);
  }, [sendFieldBlur]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiRequest('POST', `/api/trips/${tripId}/collaborative-save`, tripData);
      const savedData = await response.json();
      
      setLastSaved(new Date());
      onSave?.(savedData);
      toast({
        title: "Trip saved successfully",
        description: "All changes have been saved and synced.",
      });
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Error saving trip",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldIndicator = (fieldName: string) => {
    const editingUser = participants.find(p => editingField === fieldName);
    if (editingUser) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-2 -right-2 flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs"
        >
          <Edit3 className="h-3 w-3" />
          {editingUser.username}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with connection status and participants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edição Colaborativa
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
              {/* Participants */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div className="flex -space-x-2">
                  <AnimatePresence>
                    {participants.map((participant) => (
                      <motion.div
                        key={participant.userId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative"
                      >
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="text-xs">
                            {participant.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <span className="text-sm text-gray-600">
                  {participants.length} {participants.length === 1 ? 'editor' : 'editors'}
                </span>
              </div>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Trip Editing Form */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="relative">
            <Label htmlFor="title">Trip Title</Label>
            <Input
              id="title"
              value={tripData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onFocus={() => handleFieldFocus('title')}
              onBlur={() => handleFieldBlur('title')}
              className={`mt-1 ${activeField === 'title' ? 'ring-2 ring-blue-500' : ''}`}
              placeholder="Enter trip title..."
            />
            <AnimatePresence>
              {getFieldIndicator('title')}
            </AnimatePresence>
          </div>

          {/* Destination */}
          <div className="relative">
            <Label htmlFor="destination">Destino</Label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="destination"
                value={tripData.destination}
                onChange={(e) => handleFieldChange('destination', e.target.value)}
                onFocus={() => handleFieldFocus('destination')}
                onBlur={() => handleFieldBlur('destination')}
                className={`flex-1 ${activeField === 'destination' ? 'ring-2 ring-blue-500' : ''}`}
                placeholder="Para onde você está indo?"
              />
            </div>
            <AnimatePresence>
              {getFieldIndicator('destination')}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div className="relative">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={tripData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onFocus={() => handleFieldFocus('description')}
              onBlur={() => handleFieldBlur('description')}
              className={`mt-1 min-h-[100px] ${activeField === 'description' ? 'ring-2 ring-blue-500' : ''}`}
              placeholder="Descreva sua viagem..."
            />
            <AnimatePresence>
              {getFieldIndicator('description')}
            </AnimatePresence>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label htmlFor="startDate">Data de Início</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="startDate"
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  onFocus={() => handleFieldFocus('startDate')}
                  onBlur={() => handleFieldBlur('startDate')}
                  className={`flex-1 ${activeField === 'startDate' ? 'ring-2 ring-blue-500' : ''}`}
                />
              </div>
              <AnimatePresence>
                {getFieldIndicator('startDate')}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Label htmlFor="endDate">Data de Fim</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="endDate"
                  type="date"
                  value={tripData.endDate}
                  onChange={(e) => handleFieldChange('endDate', e.target.value)}
                  onFocus={() => handleFieldFocus('endDate')}
                  onBlur={() => handleFieldBlur('endDate')}
                  className={`flex-1 ${activeField === 'endDate' ? 'ring-2 ring-blue-500' : ''}`}
                />
              </div>
              <AnimatePresence>
                {getFieldIndicator('endDate')}
              </AnimatePresence>
            </div>
          </div>

          {/* Budget and Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <Input
                  id="budget"
                  type="number"
                  value={tripData.budget}
                  onChange={(e) => handleFieldChange('budget', parseFloat(e.target.value) || 0)}
                  onFocus={() => handleFieldFocus('budget')}
                  onBlur={() => handleFieldBlur('budget')}
                  className={`flex-1 ${activeField === 'budget' ? 'ring-2 ring-blue-500' : ''}`}
                  placeholder="0"
                />
              </div>
              <AnimatePresence>
                {getFieldIndicator('budget')}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Label htmlFor="maxParticipants">Máx. Participantes</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-gray-500" />
                <Input
                  id="maxParticipants"
                  type="number"
                  value={tripData.maxParticipants}
                  onChange={(e) => handleFieldChange('maxParticipants', parseInt(e.target.value) || 1)}
                  onFocus={() => handleFieldFocus('maxParticipants')}
                  onBlur={() => handleFieldBlur('maxParticipants')}
                  className={`flex-1 ${activeField === 'maxParticipants' ? 'ring-2 ring-blue-500' : ''}`}
                  min="1"
                  max="50"
                />
              </div>
              <AnimatePresence>
                {getFieldIndicator('maxParticipants')}
              </AnimatePresence>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Salvo às {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {!isConnected && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Conexão perdida - alterações podem não sincronizar
                </div>
              )}
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving || !isConnected}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Save className="h-4 w-4" />
                </motion.div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      {participants.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Atividade ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {participants.map((participant) => (
                <motion.div
                  key={participant.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">{participant.username}</span>
                  <span className="text-gray-600">is editing</span>
                  {editingField && (
                    <Badge variant="outline" className="text-xs">
                      {editingField}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}