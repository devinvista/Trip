
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface LoginData {
  identifier: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  bio?: string;
  location?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useMutation<User, Error, LoginData>>;
  logoutMutation: ReturnType<typeof useMutation<void, Error, void>>;
  registerMutation: ReturnType<typeof useMutation<User, Error, RegisterData>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para verificar se o usuário está logado
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user");
      if (!res.ok) {
        throw new Error("Não autorizado");
      }
      return res.json();
    },
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds - shorter to refresh authentication status more frequently
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Mutation para login
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (loginData: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", loginData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro no login");
      }
      
      const userData = await res.json();
      
      // Parse JSON string fields if they exist
      if (typeof userData.languages === 'string') {
        try {
          userData.languages = JSON.parse(userData.languages);
        } catch (e) {
          userData.languages = [];
        }
      }
      
      if (typeof userData.interests === 'string') {
        try {
          userData.interests = JSON.parse(userData.interests);
        } catch (e) {
          userData.interests = [];
        }
      }
      
      if (typeof userData.travelStyles === 'string') {
        try {
          userData.travelStyles = JSON.parse(userData.travelStyles);
        } catch (e) {
          userData.travelStyles = [];
        }
      }
      
      return userData;
    },
    onSuccess: (userData: User & { sessionId?: string }) => {
      // Store session ID in localStorage for authentication fallback
      if (userData.sessionId) {
        localStorage.setItem('sessionId', userData.sessionId);
      }
      
      // Atualizar cache imediatamente com dados do usuário
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidar apenas queries específicas, não todas
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-requests"] });
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para registro
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (registerData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", registerData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro no registro");
      }
      
      const userData = await res.json();
      
      // Parse JSON string fields if they exist
      if (typeof userData.languages === 'string') {
        try {
          userData.languages = JSON.parse(userData.languages);
        } catch (e) {
          userData.languages = [];
        }
      }
      
      if (typeof userData.interests === 'string') {
        try {
          userData.interests = JSON.parse(userData.interests);
        } catch (e) {
          userData.interests = [];
        }
      }
      
      if (typeof userData.travelStyles === 'string') {
        try {
          userData.travelStyles = JSON.parse(userData.travelStyles);
        } catch (e) {
          userData.travelStyles = [];
        }
      }
      
      return userData;
    },
    onSuccess: (userData: User & { sessionId?: string }) => {
      // Store session ID in localStorage for authentication fallback
      if (userData.sessionId) {
        localStorage.setItem('sessionId', userData.sessionId);
      }
      
      // Atualizar cache imediatamente com dados do usuário
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidar apenas queries específicas
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-requests"] });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao ViajaJunto!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Erro no logout");
      }
    },
    onSuccess: () => {
      // Clear session ID from localStorage
      localStorage.removeItem('sessionId');
      
      // Limpar cache do usuário
      queryClient.setQueryData(["/api/user"], null);
      // Invalidar todas as queries para limpar dados
      queryClient.invalidateQueries();
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
