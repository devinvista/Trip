import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatWindowProps {
  tripId: string;
  className?: string;
  participants?: any[];
}

// Mock messages for demo
const mockMessages = [
  {
    id: 1,
    content: "Olá pessoal! Estou muito animado para essa viagem! 🎒",
    senderId: 1,
    tripId: 1,
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sender: {
      id: 1,
      fullName: "Tom Teste",
      profilePhoto: null
    }
  },
  {
    id: 2,
    content: "Oi Tom! Eu também estou super empolgado. Já comecei a fazer as malas. Vocês têm alguma sugestão de o que levar?",
    senderId: 2,
    tripId: 1,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    sender: {
      id: 2,
      fullName: "Ana Silva",
      profilePhoto: null
    }
  },
  {
    id: 3,
    content: "Pessoal, consegui uma dica ótima de um restaurante local! Vou compartilhar no grupo do WhatsApp também.",
    senderId: 3,
    tripId: 1,
    sentAt: new Date(Date.now() - 43200000).toISOString(),
    sender: {
      id: 3,
      fullName: "Carlos Santos",
      profilePhoto: null
    }
  }
];

export function ChatWindow({ tripId, className = "", participants = [] }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      content: newMessage,
      senderId: user?.id || 1,
      tripId: parseInt(tripId),
      sentAt: new Date().toISOString(),
      sender: {
        id: user?.id || 1,
        fullName: user?.fullName || "Usuário",
        profilePhoto: null
      }
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi adicionada ao mural",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={`flex flex-col h-[500px] ${className}`}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-base font-semibold">Mural da Viagem</span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Chat entre participantes</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">
            {messages.length} mensagens
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma mensagem ainda.</p>
                <p className="text-sm text-gray-500">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={message.sender?.profilePhoto || ""} />
                    <AvatarFallback className="text-sm">
                      {getInitials(message.sender?.fullName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[70%] ${message.senderId === user?.id ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${message.senderId === user?.id ? 'justify-end' : ''}`}>
                      <span className="text-sm font-medium text-gray-700">
                        {message.senderId === user?.id ? 'Você' : message.sender?.fullName}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.sentAt), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg text-sm inline-block max-w-full ${
                        message.senderId === user?.id
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem para o grupo..."
              className="min-h-[80px] bg-white dark:bg-gray-700 resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {newMessage.length}/500 caracteres
              </span>
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}