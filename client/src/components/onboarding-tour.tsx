import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  Star,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Sparkles,
  Target,
  Heart,
  Shield
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userPreferences?: {
    travelStyle?: string;
    interests?: string[];
    experience?: 'iniciante' | 'intermediario' | 'experiente';
  };
}

const getPersonalizedSteps = (preferences?: OnboardingTourProps['userPreferences']): OnboardingStep[] => {
  const baseSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao ViajaJunto! 🎉',
      description: 'Estamos animados para te ajudar a descobrir o mundo de forma mais econômica e divertida!',
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
      position: 'center',
      highlight: true
    },
    {
      id: 'concept',
      title: 'Como Funciona',
      description: 'Conecte-se com viajantes que compartilham seus interesses e divida custos de hospedagem, transporte e atividades.',
      icon: <Users className="w-6 h-6 text-blue-400" />,
      position: 'center'
    },
    {
      id: 'savings',
      title: 'Economize até 65%',
      description: 'Nossos usuários economizam em média 65% dividindo custos de viagem com outros viajantes.',
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      position: 'center'
    },
    {
      id: 'search',
      title: 'Explore Viagens',
      description: 'Use nossa busca avançada para encontrar viagens que combinam com seu perfil e orçamento.',
      icon: <MapPin className="w-6 h-6 text-purple-400" />,
      position: 'top',
      target: '[data-tour="search-button"]',
      action: {
        label: 'Ver Busca',
        href: '/search'
      }
    },
    {
      id: 'create',
      title: 'Crie Sua Viagem',
      description: 'Planeje sua própria aventura e convide outros viajantes para se juntarem a você.',
      icon: <Calendar className="w-6 h-6 text-orange-400" />,
      position: 'top',
      target: '[data-tour="create-button"]',
      action: {
        label: 'Criar Viagem',
        href: '/create-trip'
      }
    },
    {
      id: 'safety',
      title: 'Segurança em Primeiro Lugar',
      description: 'Todos os perfis são verificados e temos um sistema de avaliações para garantir sua segurança.',
      icon: <Shield className="w-6 h-6 text-red-400" />,
      position: 'center'
    }
  ];

  // Personalizar baseado nas preferências do usuário
  if (preferences?.travelStyle) {
    const styleMessages = {
      'aventura': 'Perfeito para aventureiros! Você encontrará muitos companheiros para trilhas, escaladas e esportes radicais.',
      'praia': 'Ótima escolha! Temos muitas viagens para localidades paradisíacas e resorts.',
      'cultura': 'Excelente! Conecte-se com viajantes que amam museus, arquitetura e experiências culturais.',
      'natureza': 'Maravilhoso! Encontre companheiros para parques nacionais e ecoturismo.',
      'urbanas': 'Perfeito! Explore grandes cidades com outros viajantes urbanos.'
    };

    baseSteps.splice(2, 0, {
      id: 'personalized',
      title: `Viagens de ${preferences.travelStyle}`,
      description: styleMessages[preferences.travelStyle as keyof typeof styleMessages] || 'Encontraremos viagens perfeitas para seu estilo!',
      icon: <Target className="w-6 h-6 text-pink-400" />,
      position: 'center'
    });
  }

  if (preferences?.experience === 'iniciante') {
    baseSteps.push({
      id: 'beginner-tip',
      title: 'Dica para Iniciantes',
      description: 'Comece com viagens curtas e grupos pequenos. Nossa comunidade é super acolhedora para novos viajantes!',
      icon: <Heart className="w-6 h-6 text-pink-400" />,
      position: 'center'
    });
  }

  return baseSteps;
};

export function OnboardingTour({ isOpen, onClose, onComplete, userPreferences }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState(() => getPersonalizedSteps(userPreferences));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border-0 pointer-events-auto">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentStepData.icon}
                    <Badge variant="secondary" className="text-xs">
                      {currentStep + 1} de {steps.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Progress value={progress} className="w-full h-2 mt-2" />
                
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                  {currentStepData.description}
                </CardDescription>

                {currentStepData.highlight && (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <Star className="w-4 h-4" />
                      <span className="font-medium text-sm">Bem-vindo à comunidade!</span>
                    </div>
                  </motion.div>
                )}

                {currentStepData.action && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                      onClick={() => {
                        if (currentStepData.action?.onClick) {
                          currentStepData.action.onClick();
                        }
                      }}
                    >
                      {currentStepData.action.href ? (
                        <a href={currentStepData.action.href}>
                          {currentStepData.action.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      ) : (
                        <span>
                          {currentStepData.action.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep + 1} / {steps.length}
                  </div>

                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook para controlar o tour
export function useOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já completou o tour
    const completed = localStorage.getItem('onboarding-completed');
    if (completed === 'true') {
      setIsCompleted(true);
    }
  }, []);

  const startTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const completeTour = () => {
    setIsCompleted(true);
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.setItem('onboarding-completed-date', new Date().toISOString());
  };

  const resetTour = () => {
    setIsCompleted(false);
    localStorage.removeItem('onboarding-completed');
    localStorage.removeItem('onboarding-completed-date');
  };

  return {
    isOpen,
    isCompleted,
    startTour,
    closeTour,
    completeTour,
    resetTour
  };
}