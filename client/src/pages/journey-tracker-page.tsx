import { useState } from 'react';
import { JourneyProgressTracker, createDefaultMilestones, JourneyMilestone } from '@/components/journey-progress-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, DollarSign } from 'lucide-react';

export default function JourneyTrackerPage() {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>(createDefaultMilestones('demo-trip'));

  const handleMilestoneComplete = (milestoneId: string) => {
    setMilestones(prev => 
      prev.map(milestone => 
        milestone.id === milestoneId 
          ? { ...milestone, completed: true, completedAt: new Date() }
          : milestone
      )
    );
  };

  const handleResetProgress = () => {
    setMilestones(createDefaultMilestones('demo-trip'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rastreador de Progresso da Viagem
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Acompanhe suas conquistas de viagem com celebrações animadas e visualização de progresso
            </p>
          </div>

          {/* Demo Trip Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Viagem Demo: Aventura na Chapada Diamantina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">July 15-22, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">4 participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">$2,500 budget</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">Adventure</Badge>
                <Badge variant="secondary">Nature</Badge>
                <Badge variant="secondary">Hiking</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <JourneyProgressTracker
            tripId="demo-trip"
            milestones={milestones}
            onMilestoneComplete={handleMilestoneComplete}
            className="mb-8"
          />

          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controles Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleResetProgress}
                  variant="outline"
                >
                  Reiniciar Progresso
                </Button>
                <Button
                  onClick={() => {
                    const incompleteMilestones = milestones.filter(m => !m.completed);
                    if (incompleteMilestones.length > 0) {
                      handleMilestoneComplete(incompleteMilestones[0].id);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Completar Próxima Meta
                </Button>
                <Button
                  onClick={() => {
                    const incompleteMilestones = milestones.filter(m => !m.completed);
                    incompleteMilestones.forEach((milestone, index) => {
                      setTimeout(() => {
                        handleMilestoneComplete(milestone.id);
                      }, index * 1000);
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Completar Todas (Animado)
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                Use estes controles para testar as celebrações de marcos animadas e recursos de rastreamento de progresso.
              </p>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Animated Celebrations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enjoy festive animations and trophy celebrations when completing milestones
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Progress Visualization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Track progress with animated progress bars and category breakdowns
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Point System</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Earn points for completing milestones with animated point updates
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Category Organization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Milestones organized by Planning, Booking, Experience, and Completion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}