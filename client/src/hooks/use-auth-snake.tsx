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
  full_name: string;
  bio?: string;
  location?: string;
  languages?: string[];
  interests?: string[];
  travel_styles?: string[];
}

interface AuthContextType {
  user: User | null;
  is_loading: boolean;
  error: Error | null;
  login_mutation: ReturnType<typeof useMutation<User, Error, LoginData>>;
  logout_mutation: ReturnType<typeof useMutation<void, Error, void>>;
  register_mutation: ReturnType<typeof useMutation<User, Error, RegisterData>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const query_client = useQueryClient();

  // Query para verificar se o usuário está logado
  const { 
    data: user, 
    isLoading: is_loading, 
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
  const login_mutation = useMutation<User, Error, LoginData>({
    mutationFn: async (login_data: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", login_data);
      if (!res.ok) {
        const error_data = await res.json().catch(() => ({}));
        throw new Error(error_data.message || "Erro no login");
      }
      
      const user_data = await res.json();
      
      // Parse JSON string fields if they exist
      if (typeof user_data.languages === 'string') {
        try {
          user_data.languages = JSON.parse(user_data.languages);
        } catch (e) {
          user_data.languages = [];
        }
      }
      
      if (typeof user_data.interests === 'string') {
        try {
          user_data.interests = JSON.parse(user_data.interests);
        } catch (e) {
          user_data.interests = [];
        }
      }
      
      if (typeof user_data.travel_styles === 'string') {
        try {
          user_data.travel_styles = JSON.parse(user_data.travel_styles);
        } catch (e) {
          user_data.travel_styles = [];
        }
      }
      
      return user_data;
    },
    onSuccess: (user_data: User & { session_id?: string }) => {
      // Store session ID in localStorage for authentication fallback
      if (user_data.session_id) {
        localStorage.setItem('session_id', user_data.session_id);
      }
      
      // Atualizar cache imediatamente com dados do usuário
      query_client.setQueryData(["/api/user"], user_data);
      
      // Invalidar apenas queries específicas, não todas
      query_client.invalidateQueries({ queryKey: ["/api/trips"] });
      query_client.invalidateQueries({ queryKey: ["/api/my-trips"] });
      query_client.invalidateQueries({ queryKey: ["/api/user-requests"] });
      
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

  // Mutation para logout
  const logout_mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      if (!res.ok) {
        throw new Error("Erro no logout");
      }
    },
    onSuccess: () => {
      // Clear session storage
      localStorage.removeItem('session_id');
      
      // Limpar todas as queries relacionadas ao usuário
      query_client.clear();
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até breve!",
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

  // Mutation para registro
  const register_mutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (register_data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", register_data);
      if (!res.ok) {
        const error_data = await res.json().catch(() => ({}));
        throw new Error(error_data.message || "Erro no registro");
      }
      
      const user_data = await res.json();
      
      // Parse JSON string fields if they exist
      if (typeof user_data.languages === 'string') {
        try {
          user_data.languages = JSON.parse(user_data.languages);
        } catch (e) {
          user_data.languages = [];
        }
      }
      
      if (typeof user_data.interests === 'string') {
        try {
          user_data.interests = JSON.parse(user_data.interests);
        } catch (e) {
          user_data.interests = [];
        }
      }
      
      if (typeof user_data.travel_styles === 'string') {
        try {
          user_data.travel_styles = JSON.parse(user_data.travel_styles);
        } catch (e) {
          user_data.travel_styles = [];
        }
      }
      
      return user_data;
    },
    onSuccess: (user_data: User & { session_id?: string }) => {
      // Store session ID in localStorage for authentication fallback
      if (user_data.session_id) {
        localStorage.setItem('session_id', user_data.session_id);
      }
      
      // Atualizar cache imediatamente com dados do usuário
      query_client.setQueryData(["/api/user"], user_data);
      
      // Invalidar apenas queries específicas
      query_client.invalidateQueries({ queryKey: ["/api/trips"] });
      query_client.invalidateQueries({ queryKey: ["/api/my-trips"] });
      query_client.invalidateQueries({ queryKey: ["/api/user-requests"] });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à plataforma!",
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

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        is_loading, 
        error, 
        login_mutation, 
        logout_mutation, 
        register_mutation 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}