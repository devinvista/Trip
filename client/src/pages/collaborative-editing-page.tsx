import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { CollaborativeTripEditor, TripData } from '@/components/collaborative-trip-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Edit3, 
  Sparkles,
  Clock,
  Wifi,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';

export default function CollaborativeEditingPage() {
  const { user } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<string>('1');
  
  // Demo trip data
  const demoTrip: TripData = {
    id: 1,
    title: "Aventura na Chapada Diamantina",
    destination: "Chapada Diamantina, Bahia, Brasil",
    description: "Explore as paisagens deslumbrantes, cachoeiras e cavernas de um dos parques nacionais mais belos do Brasil. Esta aventura inclui trilhas, banhos em piscinas naturais e acampamento sob as estrelas.",
    startDate: "2025-07-15",
    endDate: "2025-07-22",
    budget: 2500,
    maxParticipants: 6,
    travelStyle: "Aventura"
  };

  const handleTripSave = (data: TripData) => {
    console.log('Trip saved:', data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Por favor, faça login para acessar as funcionalidades de edição colaborativa.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Edit3 className="h-8 w-8" />
              Collaborative Trip Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Edit trip details in real-time with your travel companions. See live changes, 
              presence indicators, and collaborate seamlessly on your travel plans.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Wifi className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Real-time Sync</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  See changes instantly as your team members edit trip details. No refresh needed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Live Presence</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  See who's online and what they're editing with visual indicators and presence.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Conflict Resolution</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Smart conflict resolution prevents data loss when multiple people edit simultaneously.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="mb-8" />

          {/* Demo Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Demo Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">How to Test Collaborative Editing:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Open this page in multiple browser tabs or windows</li>
                    <li>Log in with the same or different accounts</li>
                    <li>Start editing the trip details below</li>
                    <li>Watch as changes appear instantly in all windows</li>
                    <li>Notice the presence indicators showing who's editing what</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features to Look For:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>Blue indicators showing which field someone is editing</li>
                    <li>Live participant avatars in the header</li>
                    <li>Real-time activity feed</li>
                    <li>Connection status indicator</li>
                    <li>Last update timestamps</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaborative Editor */}
          <CollaborativeTripEditor
            tripId={selectedTrip}
            initialData={demoTrip}
            onSave={handleTripSave}
          />

          {/* Technical Details */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">WebSocket Integration</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Real-time bidirectional communication</li>
                    <li>Automatic reconnection on connection loss</li>
                    <li>Message queuing for offline scenarios</li>
                    <li>Efficient delta updates for performance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Collaborative Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Operational transformation for conflict resolution</li>
                    <li>Live cursor tracking and field indicators</li>
                    <li>Presence awareness with user avatars</li>
                    <li>Optimistic UI updates with rollback support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Data Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Demo Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">Trip ID: {selectedTrip}</Badge>
                <Badge variant="secondary">User: {user.username}</Badge>
                <Badge variant="secondary">Mode: Demo</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This demo uses WebSocket connections to simulate real-time collaborative editing. 
                Open multiple browser tabs to see the collaboration features in action. All changes 
                are synchronized in real-time across all connected clients.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}