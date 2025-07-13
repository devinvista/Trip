import { useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PreloaderDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Carregamento completo!",
        description: "O preloader foi testado com sucesso.",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Demonstração do Preloader
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Este é o novo preloader animado do PartiuTrip usando animação Lottie profissional.
              </p>
              
              <Button 
                onClick={simulateLoading}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isLoading ? "Carregando..." : "Testar Preloader"}
              </Button>
            </div>
            
            {/* Preloader Demo */}
            {isLoading && (
              <div className="min-h-[300px] flex items-center justify-center">
                <LoadingSpinner variant="travel" size="lg" />
              </div>
            )}
            
            {/* Preloader Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variações do Preloader:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Preloader Simples</h4>
                  <div className="flex justify-center py-4">
                    <LoadingSpinner variant="simple" size="md" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Preloader de Viagem</h4>
                  <div className="flex justify-center py-4">
                    <LoadingSpinner variant="travel" size="md" />
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}