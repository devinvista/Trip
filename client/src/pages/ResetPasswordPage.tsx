import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Link inválido",
        description: "Token de recuperação não encontrado ou inválido.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/auth"), 3000);
    }
  }, [navigate, toast]);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      return apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Redirecionando para o login...",
      });
      setTimeout(() => navigate("/auth"), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao redefinir senha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) {
      toast({
        title: "Erro",
        description: "Token de recuperação inválido.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Link Inválido</h2>
              <p className="text-slate-600 mb-4">
                O link de recuperação de senha é inválido ou expirou.
              </p>
              <Link href="/auth">
                <Button className="w-full">
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isSuccess ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Lock className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isSuccess ? "Senha Redefinida!" : "Redefinir Senha"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {isSuccess 
                ? "Sua senha foi alterada com sucesso. Você será redirecionado para o login."
                : "Escolha uma nova senha segura para sua conta."
              }
            </p>
          </CardHeader>

          <CardContent>
            {!isSuccess ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres" 
                              className="pl-10 pr-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                              {...field} 
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme sua nova senha" 
                              className="pl-10 pr-10 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20" 
                              {...field} 
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">Requisitos da senha:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Mínimo de 6 caracteres</li>
                      <li>• Recomendamos usar letras, números e símbolos</li>
                      <li>• Evite senhas óbvias como "123456" ou "password"</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">Senha alterada com sucesso!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Você será redirecionado para a página de login em alguns segundos.
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/auth">
                  <Button className="w-full">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}