import { useEffect, useState } from "react";
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
import { insertUserSchema, insertInterestListSchema } from "@shared/schema";
import { z } from "zod";
import { Plane, Mail, Lock, User, Phone, Gift, Check, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Função para formatação de telefone (xx) xxxxx-xxxx
const formatPhoneNumber = (value: string) => {
  const onlyNumbers = value.replace(/\D/g, '');
  
  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  } else if (onlyNumbers.length <= 7) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
  } else if (onlyNumbers.length <= 11) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7)}`;
  } else {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
  }
};

const loginSchema = z.object({
  identifier: z.string().min(1, "Usuário, email ou telefone é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const referralValidationSchema = z.object({
  referralCode: z.string().min(1, "Código de indicação é obrigatório"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const interestListSchema = insertInterestListSchema.extend({
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ReferralForm = z.infer<typeof referralValidationSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type InterestListForm = z.infer<typeof interestListSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // States for referral validation flow
  const [step, setStep] = useState<'referral' | 'register' | 'interest'>('referral');
  const [validatedCode, setValidatedCode] = useState<string>('');

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const referralForm = useForm<ReferralForm>({
    resolver: zodResolver(referralValidationSchema),
    defaultValues: {
      referralCode: "",
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
      travelStyles: [],
    },
  });

  const interestForm = useForm<InterestListForm>({
    resolver: zodResolver(interestListSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Mutation for validating referral code
  const validateReferralMutation = useMutation({
    mutationFn: async (data: ReferralForm) => {
      const res = await fetch("/api/validate-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      if (data.isValid) {
        setValidatedCode(variables.referralCode);
        setStep('register');
        toast({
          title: "Código válido!",
          description: "Agora você pode prosseguir com o cadastro.",
        });
      }
    },
    onError: (error: Error) => {
      // If code is invalid, go to interest list
      setStep('interest');
      // Pre-fill the invalid code in interest form
      interestForm.setValue("referralCode", referralForm.getValues().referralCode);
      toast({
        title: "Código inválido",
        description: error.message + ". Complete o formulário para entrar na lista de interesse.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding to interest list
  const addToInterestMutation = useMutation({
    mutationFn: async (data: InterestListForm & { referralCode?: string }) => {
      const res = await fetch("/api/interest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Cadastro na lista realizado!",
        description: data.message,
      });
      // Reset form and go back to referral step
      interestForm.reset();
      setStep('referral');
      referralForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  };

  const onValidateReferral = (data: ReferralForm) => {
    validateReferralMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    const { confirmPassword, ...registerData } = data;
    
    registerMutation.mutate({
      ...registerData,
      referredBy: validatedCode,
    }, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  };

  const onAddToInterest = (data: InterestListForm) => {
    addToInterestMutation.mutate({
      ...data,
      referralCode: referralForm.getValues().referralCode,
    });
  };

  if (loginMutation.isPending || registerMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">
            {loginMutation.isPending ? "Entrando..." : "Criando conta..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PartiuTrip
            </h1>
          </div>
          <p className="text-slate-600 text-lg">Conecte-se com outros viajantes</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/60 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="login" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
              Cadastrar
            </TabsTrigger>
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
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {step === 'referral' && "Validar Código de Indicação"}
                  {step === 'register' && "Criar sua conta"}
                  {step === 'interest' && "Lista de Interesse"}
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  {step === 'referral' && "Primeiro, precisamos validar seu código de indicação"}
                  {step === 'register' && "Preencha os dados para criar sua conta"}
                  {step === 'interest' && "Cadastre-se na lista para ser notificado quando liberarmos o acesso"}
                </p>
              </CardHeader>
              <CardContent>
                {step === 'referral' && (
                  <Form {...referralForm}>
                    <form onSubmit={referralForm.handleSubmit(onValidateReferral)} className="space-y-4">
                      <FormField
                        control={referralForm.control}
                        name="referralCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Código de Indicação</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Gift className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                  placeholder="Digite o código de indicação" 
                                  className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={validateReferralMutation.isPending}
                      >
                        {validateReferralMutation.isPending ? "Validando..." : "Validar Código"}
                      </Button>
                    </form>
                  </Form>
                )}

                {step === 'register' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Código validado: {validatedCode}</span>
                    </div>
                    
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                <FormLabel className="text-slate-700 font-medium">Usuário</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu usuário" className="bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                  <Input type="email" placeholder="Seu email" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
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
                                    placeholder="(11) 99999-9999" 
                                    className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                                    value={field.value}
                                    onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
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
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}

                {step === 'interest' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">Código inválido. Complete o formulário para entrar na lista de interesse.</span>
                    </div>
                    
                    <Form {...interestForm}>
                      <form onSubmit={interestForm.handleSubmit(onAddToInterest)} className="space-y-4">
                        <FormField
                          control={interestForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Nome Completo</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                  <Input placeholder="Seu nome completo" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={interestForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                  <Input type="email" placeholder="Seu email" className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={interestForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Telefone</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                  <Input 
                                    placeholder="(11) 99999-9999" 
                                    className="pl-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                                    value={field.value}
                                    onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3">
                          <Button 
                            type="button"
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setStep('referral');
                              referralForm.reset();
                              interestForm.reset();
                            }}
                          >
                            Tentar outro código
                          </Button>
                          
                          <Button 
                            type="submit" 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                            disabled={addToInterestMutation.isPending}
                          >
                            {addToInterestMutation.isPending ? "Enviando..." : "Entrar na lista"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}