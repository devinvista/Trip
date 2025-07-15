import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  MapPin, 
  ArrowRight,
  X 
} from 'lucide-react';

interface WelcomeBannerProps {
  userName?: string;
  onStartTour: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

export function WelcomeBanner({ userName, onStartTour, onDismiss, isVisible }: WelcomeBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  Novo Membro
                </Badge>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {userName ? `Bem-vindo, ${userName}!` : 'Bem-vindo ao PartiuTrip!'}
              </h2>
              
              <p className="text-blue-100 mb-4 leading-relaxed">
                Estamos animados para te ajudar a descobrir o mundo de forma mais econômica e divertida. 
                Que tal fazer um tour rápido para conhecer todas as funcionalidades?
              </p>
              
              <div className="flex items-center gap-4 text-sm text-blue-200 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>2.8k+ viajantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>85+ destinos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>65% economia média</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={onStartTour}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  Começar Tour
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Talvez depois
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white hover:bg-white/10 h-8 w-8 p-0 ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}