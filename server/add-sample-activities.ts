import { db } from './db';
import { trips } from '../shared/schema';
import { eq } from 'drizzle-orm';

const sampleActivities = [
  {
    id: 'act1',
    title: 'Cristo Redentor',
    description: 'Visita ao famoso Cristo Redentor no Corcovado com vista panorâmica da cidade',
    estimatedCost: 85,
    priority: 'high' as const,
    category: 'sightseeing' as const,
    duration: '4 horas',
    location: 'Corcovado, Rio de Janeiro',
    scheduledDate: '2025-09-15T09:00:00.000Z',
    notes: 'Comprar ingressos antecipados online',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  },
  {
    id: 'act2',
    title: 'Praia de Copacabana',
    description: 'Relaxar na famosa praia de Copacabana e aproveitar o pôr do sol',
    estimatedCost: 30,
    priority: 'medium' as const,
    category: 'relaxation' as const,
    duration: '3 horas',
    location: 'Copacabana, Rio de Janeiro',
    scheduledDate: '2025-09-15T16:00:00.000Z',
    notes: 'Levar protetor solar e água',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  },
  {
    id: 'act3',
    title: 'Pão de Açúcar',
    description: 'Passeio de bondinho até o Pão de Açúcar com vista espetacular da baía',
    estimatedCost: 120,
    priority: 'high' as const,
    category: 'sightseeing' as const,
    duration: '3 horas',
    location: 'Urca, Rio de Janeiro',
    scheduledDate: '2025-09-16T10:00:00.000Z',
    notes: 'Melhor vista ao final da tarde',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  },
  {
    id: 'act4',
    title: 'Feira Hippie de Ipanema',
    description: 'Explorar artesanato local e souvenirs na tradicional feira de Ipanema',
    estimatedCost: 50,
    priority: 'medium' as const,
    category: 'shopping' as const,
    duration: '2 horas',
    location: 'Ipanema, Rio de Janeiro',
    scheduledDate: '2025-09-16T14:00:00.000Z',
    notes: 'Domingo das 9h às 18h',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  },
  {
    id: 'act5',
    title: 'Churrascaria Tradicional',
    description: 'Jantar em uma churrascaria tradicional carioca',
    estimatedCost: 80,
    priority: 'medium' as const,
    category: 'food' as const,
    duration: '2 horas',
    location: 'Copacabana, Rio de Janeiro',
    scheduledDate: '2025-09-16T19:00:00.000Z',
    notes: 'Reservar mesa com antecedência',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  },
  {
    id: 'act6',
    title: 'Santa Teresa e Bondinho',
    description: 'Explorar o charmoso bairro de Santa Teresa com seus ateliês e cafés',
    estimatedCost: 40,
    priority: 'medium' as const,
    category: 'culture' as const,
    duration: '4 horas',
    location: 'Santa Teresa, Rio de Janeiro',
    scheduledDate: '2025-09-17T11:00:00.000Z',
    notes: 'Aproveitar para almoçar no bairro',
    completed: false,
    createdAt: '2025-07-15T04:00:00.000Z'
  }
];

async function addSampleActivities() {
  try {
    await db.update(trips)
      .set({ 
        plannedActivities: JSON.stringify(sampleActivities) 
      })
      .where(eq(trips.id, 4));
    
    console.log('✅ Atividades de exemplo adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar atividades:', error);
  }
}

addSampleActivities();