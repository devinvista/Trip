import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, Users, Clock, Smile, Plus, Image, Mic, MoreHorizontal, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  tripId: string;
  className?: string;
  participants?: any[];
}

// Mock messages for demo with enhanced content
const mockMessages = [
  {
    id: 1,
    content: "Olá pessoal! Estou muito animado para essa viagem! 🎒✈️",
    senderId: 1,
    tripId: 1,
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sender: {
      id: 1,
      fullName: "Tom Tubin",
      profilePhoto: undefined
    },
    status: "read"
  },
  {
    id: 2,
    content: "Oi Tom! Eu também estou super empolgado. Já comecei a fazer as malas. Vocês têm alguma sugestão de o que levar? 🧳",
    senderId: 2,
    tripId: 1,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    sender: {
      id: 2,
      fullName: "Ana Silva",
      profilePhoto: undefined
    },
    status: "read"
  },
  {
    id: 3,
    content: "Pessoal, consegui uma dica ótima de um restaurante local! Vou compartilhar no grupo do WhatsApp também. 🍽️",
    senderId: 3,
    tripId: 1,
    sentAt: new Date(Date.now() - 43200000).toISOString(),
    sender: {
      id: 3,
      fullName: "Carlos Santos",
      profilePhoto: undefined
    },
    status: "read"
  },
  {
    id: 4,
    content: "Que legal, Carlos! Estou ansioso para experimentar. Alguém já verificou o clima para os próximos dias? ☀️",
    senderId: 4,
    tripId: 1,
    sentAt: new Date(Date.now() - 21600000).toISOString(),
    sender: {
      id: 4,
      fullName: "Maria Oliveira",
      profilePhoto: undefined
    },
    status: "delivered"
  },
  {
    id: 5,
    content: "Acabei de conferir! Parece que vai estar ensolarado na maior parte do tempo. Perfeito para as trilhas! 🌞",
    senderId: 1,
    tripId: 1,
    sentAt: new Date(Date.now() - 10800000).toISOString(),
    sender: {
      id: 1,
      fullName: "Tom Tubin",
      profilePhoto: undefined
    },
    status: "sent"
  }
];

export function ChatWindow({ tripId, className = "", participants = [] }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
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
        profilePhoto: undefined
      },
      status: "sent"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi adicionada ao chat",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <div className="flex"><Check className="h-3 w-3 text-gray-400" /><Check className="h-3 w-3 text-gray-400 -ml-1" /></div>;
      case "read":
        return <div className="flex"><Check className="h-3 w-3 text-blue-500" /><Check className="h-3 w-3 text-blue-500 -ml-1" /></div>;
      default:
        return null;
    }
  };

  return (
    <Card className={`flex flex-col bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl ${className}`}>
      <CardHeader className="pb-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 shadow-sm">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-800">Chat da Viagem</span>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="font-medium">{participants.length || 0} participantes online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 shadow-sm px-3 py-1">
              {messages.length} mensagens
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex hover:bg-slate-100 rounded-lg transition-colors duration-200 p-2"
              onClick={() => {
                // Função para abrir menu de opções do chat
                console.log("Abrir menu de opções do chat");
              }}
            >
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {/* Participants Section - Fixed outside scroll area */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50/50 to-white/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-800">Participantes</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            {participants.length || 1}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {participants.length > 0 ? (
            participants.map((participant: any) => {
              const isOrganizer = participant.role === 'organizer' || participant.status === 'organizer';
              return (
                <div key={participant.id} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                  <UserAvatar 
                    user={participant.user}
                    size="sm"
                    className={`h-8 w-8 ring-2 ${isOrganizer ? 'ring-blue-200' : 'ring-gray-200'}`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {participant.user?.fullName || participant.user?.username}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isOrganizer ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {isOrganizer ? 'Organizador' : 'Participante'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-blue-200">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                  TT
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900">Tom Tubin</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Organizador</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 min-h-full bg-[#ffffff]">
              <div className="space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Nenhuma mensagem ainda</p>
                <p className="text-sm text-gray-500">Seja o primeiro a enviar uma mensagem para o grupo!</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex gap-3 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}
                  >
                    <UserAvatar 
                      user={message.sender}
                      size="md"
                      className="w-10 h-10 flex-shrink-0 ring-2 ring-white shadow-sm"
                    />
                    <div className={`flex-1 max-w-[75%] ${message.senderId === user?.id ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${message.senderId === user?.id ? 'justify-end' : ''}`}>
                        <span className="text-sm font-semibold text-gray-700">
                          {message.senderId === user?.id ? 'Você' : message.sender?.fullName}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(message.sentAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div
                        className={`relative p-3 rounded-2xl text-sm inline-block max-w-full shadow-sm ${
                          message.senderId === user?.id
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.senderId === user?.id && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-gray-200">...</AvatarFallback>
                </Avatar>
                <div className="bg-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Message Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[60px] bg-gray-50 border-gray-200 rounded-xl resize-none pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                  onClick={() => {
                    // Função para abrir seletor de emoji
                    console.log("Abrir seletor de emoji");
                  }}
                >
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                  onClick={() => {
                    // Função para upload de imagem
                    console.log("Abrir seletor de imagem");
                  }}
                >
                  <Image className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {newMessage.length}/500
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50 hidden md:flex"
                  onClick={() => {
                    // Função para adicionar anexos
                    console.log("Abrir opções de anexos");
                  }}
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-50 hidden md:flex"
                  onClick={() => {
                    // Função para gravação de áudio
                    console.log("Iniciar gravação de áudio");
                  }}
                >
                  <Mic className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}