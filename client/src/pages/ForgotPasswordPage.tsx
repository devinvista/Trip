import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { ChevronLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      return apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar email de recuperação",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/auth">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isEmailSent ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isEmailSent ? "Email Enviado!" : "Esqueceu sua senha?"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {isEmailSent 
                ? "Enviamos um link para redefinir sua senha para o email informado."
                : "Digite seu email e enviaremos um link para redefinir sua senha."
              }
            </p>
          </CardHeader>

          <CardContent>
            {!isEmailSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              type="email" 
                              placeholder="seu@email.com" 
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
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Link de Recuperação"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">Email enviado com sucesso!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Verifique sua caixa de entrada e spam. O link é válido por 24 horas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-600">
                    Não recebeu o email?
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEmailSent(false);
                      form.reset();
                    }}
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Lembrou sua senha?{" "}
                <Link href="/auth" className="text-blue-600 hover:text-blue-800 font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Precisa de ajuda?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Entre em contato conosco em{" "}
                <a href="mailto:suporte@partiutrip.com" className="font-medium underline">
                  suporte@partiutrip.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}