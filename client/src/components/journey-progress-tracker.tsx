import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, Plane, Camera, Star, Trophy, Sparkles, Calendar, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  completedAt?: Date;
  points?: number;
  category: 'planning' | 'booking' | 'experience' | 'completion';
}

interface JourneyProgressTrackerProps {
  tripId: string;
  milestones: JourneyMilestone[];
  onMilestoneComplete?: (milestoneId: string) => void;
  className?: string;
}

const categoryColors = {
  planning: 'bg-blue-500',
  booking: 'bg-green-500',
  experience: 'bg-purple-500',
  completion: 'bg-yellow-500'
};

const categoryLabels = {
  planning: 'Planejamento',
  booking: 'Reservas',
  experience: 'Experiência',
  completion: 'Conclusão'
};

export function JourneyProgressTracker({
  tripId,
  milestones,
  onMilestoneComplete,
  className = ""
}: JourneyProgressTrackerProps) {
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const completedMilestones = milestones.filter(m => m.completed);
  const progressPercentage = (completedMilestones.length / milestones.length) * 100;

  useEffect(() => {
    const newTotalPoints = completedMilestones.reduce((sum, m) => sum + (m.points || 0), 0);
    if (newTotalPoints > totalPoints) {
      setTotalPoints(newTotalPoints);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
  }, [completedMilestones, totalPoints]);

  const handleMilestoneComplete = (milestoneId: string) => {
    setCelebratingMilestone(milestoneId);
    setTimeout(() => setCelebratingMilestone(null), 3000);
    onMilestoneComplete?.(milestoneId);
  };

  const getMilestonesByCategory = (category: string) => {
    return milestones.filter(m => m.category === category);
  };

  const getCategoryProgress = (category: string) => {
    const categoryMilestones = getMilestonesByCategory(category);
    const completedInCategory = categoryMilestones.filter(m => m.completed);
    return categoryMilestones.length > 0 ? (completedInCategory.length / categoryMilestones.length) * 100 : 0;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Journey Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <motion.div
              animate={showAnimation ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {totalPoints} points
              </Badge>
            </motion.div>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-yellow-500"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progresso Geral</span>
            <span>{completedMilestones.length}/{milestones.length} concluídos</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Progress */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="text-center">
              <div className="mb-2">
                <div className={`w-8 h-8 rounded-full ${categoryColors[key as keyof typeof categoryColors]} mx-auto mb-1 flex items-center justify-center`}>
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
              <Progress 
                value={getCategoryProgress(key)} 
                className="h-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {getMilestonesByCategory(key).filter(m => m.completed).length}/{getMilestonesByCategory(key).length}
              </div>
            </div>
          ))}
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          {Object.entries(categoryLabels).map(([categoryKey, categoryLabel]) => {
            const categoryMilestones = getMilestonesByCategory(categoryKey);
            if (categoryMilestones.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[categoryKey as keyof typeof categoryColors]}`} />
                  {categoryLabel}
                </h4>
                <div className="space-y-2 pl-5">
                  {categoryMilestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        milestone.completed 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                      }`}
                    >
                      <motion.div
                        animate={celebratingMilestone === milestone.id ? { rotate: 360, scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {milestone.icon}
                          <h5 className={`font-medium ${
                            milestone.completed ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {milestone.title}
                          </h5>
                          {milestone.points && (
                            <Badge variant="outline" className="text-xs">
                              +{milestone.points} pts
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                        {milestone.completedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {milestone.completedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {!milestone.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMilestoneComplete(milestone.id)}
                          className="ml-2"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {celebratingMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-none"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-2xl max-w-sm mx-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mb-4"
                >
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Marco Alcançado! 🎉</h3>
                <p className="text-muted-foreground">
                  Você completou mais uma etapa da sua jornada!
                </p>
                <div className="flex justify-center mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement Badge */}
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700"
          >
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Jornada Completa!</h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Parabéns! Você completou todos os marcos desta viagem.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Default milestones for a trip
export const createDefaultMilestones = (tripId: string): JourneyMilestone[] => [
  {
    id: '1',
    title: 'Trip Planning Started',
    description: 'Begin planning your amazing journey',
    icon: <Calendar className="h-4 w-4" />,
    completed: true,
    completedAt: new Date(),
    points: 10,
    category: 'planning'
  },
  {
    id: '2',
    title: 'Destination Research',
    description: 'Pesquise e finalize sua localidade',
    icon: <MapPin className="h-4 w-4" />,
    completed: true,
    completedAt: new Date(),
    points: 15,
    category: 'planning'
  },
  {
    id: '3',
    title: 'Find Travel Companions',
    description: 'Connect with fellow travelers',
    icon: <Users className="h-4 w-4" />,
    completed: false,
    points: 20,
    category: 'planning'
  },
  {
    id: '4',
    title: 'Budget Planning',
    description: 'Set and organize your travel budget',
    icon: <DollarSign className="h-4 w-4" />,
    completed: false,
    points: 15,
    category: 'planning'
  },
  {
    id: '5',
    title: 'Flight Booking',
    description: 'Book your flights and transportation',
    icon: <Plane className="h-4 w-4" />,
    completed: false,
    points: 30,
    category: 'booking'
  },
  {
    id: '6',
    title: 'Accommodation Booked',
    description: 'Garanta sua estadia na localidade',
    icon: <MapPin className="h-4 w-4" />,
    completed: false,
    points: 25,
    category: 'booking'
  },
  {
    id: '7',
    title: 'First Day Adventures',
    description: 'Start exploring and creating memories',
    icon: <Camera className="h-4 w-4" />,
    completed: false,
    points: 40,
    category: 'experience'
  },
  {
    id: '8',
    title: 'Local Experiences',
    description: 'Immerse yourself in local culture',
    icon: <Star className="h-4 w-4" />,
    completed: false,
    points: 35,
    category: 'experience'
  },
  {
    id: '9',
    title: 'Trip Completion',
    description: 'Successfully complete your journey',
    icon: <Trophy className="h-4 w-4" />,
    completed: false,
    points: 50,
    category: 'completion'
  }
];