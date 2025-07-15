import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Plane, Mail, Lock, User, Phone, Gift } from "lucide-react";

// Função para formatação de telefone (xx) xxxxx-xxxx
const formatPhoneNumber = (value: string) => {
  // Remove todos os caracteres não numéricos
  const onlyNumbers = value.replace(/\D/g, '');
  
  // Aplica a formatação baseada no número de dígitos
  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  } else if (onlyNumbers.length <= 7) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
  } else if (onlyNumbers.length <= 11) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
  }
};

const loginSchema = z.object({
  identifier: z.string().min(1, "Usuário, email ou telefone é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  referralCode: z.string().min(1, "Código de indicação é obrigatório"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      phone: "",
      bio: "",
      location: "",
      languages: [],
      interests: [],
      travelStyle: "",
      referralCode: "",
    },
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  };

  const onRegister = async (data: RegisterForm) => {
    const { confirmPassword, referralCode, ...registerData } = data;
    
    // First validate the referral code
    try {
      const response = await fetch("/api/user/validate-referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referralCode }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        registerForm.setError("referralCode", { message: error.message });
        return;
      }
      
      // If valid, proceed with registration
      registerMutation.mutate({
        ...registerData,
        referredBy: referralCode,
      }, {
        onSuccess: () => {
          navigate("/dashboard");
        }
      });
    } catch (error) {
      registerForm.setError("referralCode", { message: "Erro ao validar código de indicação" });
    }
  };

  if (user) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Column - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plane className="h-7 w-7 text-white transform rotate-45" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    PartiuTrip
                  </h1>
                  <p className="text-sm text-orange-500 font-semibold">Viaje Junto, Gaste Menos</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Bem-vindo de volta!</h2>
              <p className="text-slate-600">Conecte-se com viajantes como você e descubra o mundo</p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm border border-slate-200 shadow-sm">
              <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-800">Entrar na sua conta</CardTitle>
                  <p className="text-slate-600 mt-2">Acesse sua conta e continue sua jornada</p>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Usuário, Email ou Telefone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input placeholder="Digite seu usuário, email ou telefone" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input type="password" placeholder="Sua senha" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" className="border-slate-300" />
                          <Label htmlFor="remember" className="text-sm text-slate-600">Lembrar de mim</Label>
                        </div>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Esqueci minha senha
                        </a>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-800">Junte-se ao PartiuTrip!</CardTitle>
                  <p className="text-slate-600 mt-2">Crie sua conta e comece a explorar o mundo</p>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" className="bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Nome de usuário</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input placeholder="Escolha um nome de usuário" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input type="email" placeholder="seu@email.com" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Telefone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                  type="tel" 
                                  placeholder="(11) 99999-9999" 
                                  className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                                  value={field.value}
                                  onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Confirmar Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input type="password" placeholder="Confirme sua senha" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="referralCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Código de Indicação</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Gift className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                  placeholder="Ex: PARTIU-TOM01" 
                                  className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2 py-2">
                        <Checkbox id="terms" required className="border-slate-300" />
                        <Label htmlFor="terms" className="text-sm text-slate-600">
                          Aceito os <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">termos de uso</a> e{" "}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">política de privacidade</a>
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-20"></div>
        
        <div className="text-center text-white max-w-lg relative z-10">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <Plane className="h-10 w-10 text-white transform rotate-45" />
            </div>
            <h2 className="font-bold text-4xl mb-4 leading-tight">
              Sua Próxima Aventura Te Espera
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Conecte-se com viajantes, divida custos e crie memórias inesquecíveis pelo mundo todo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="font-bold text-3xl mb-2">2.8k+</div>
              <div className="text-sm opacity-90">Viajantes conectados</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="font-bold text-3xl mb-2">85+</div>
              <div className="text-sm opacity-90">Destinos disponíveis</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="font-bold text-3xl mb-2">65%</div>
              <div className="text-sm opacity-90">Economia média</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="font-bold text-3xl mb-2">4.8★</div>
              <div className="text-sm opacity-90">Avaliação média</div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-80 italic">
              "Viajar sozinho é bom, viajar junto é melhor!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}