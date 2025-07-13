import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Plane, 
  Search, 
  Plus, 
  Menu, 
  LayoutDashboard, 
  User, 
  LogOut,
  MapPin,
  MessageCircle,
  Kanban,
  TrendingUp,
  Edit3
} from "lucide-react";
import logoImage from "@assets/20250713_0013_Logo com Fundo Transparente_remix_01k00w7vt0fg184dm3z41h2sk1_1752377252367.png";

export function Navbar() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/board", label: "Quadro Visual", icon: Kanban },
    { href: "/search", label: "Buscar Viagens", icon: Search, tourData: "search-button" },
    { href: "/create-trip", label: "Criar Viagem", icon: Plus, tourData: "create-button" },
    { href: "/journey-tracker", label: "Progresso", icon: TrendingUp },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Don't render navigation items if still loading
  if (isLoading) {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105">
              <img 
                src={logoImage} 
                alt="PartiuTrip - Viaje Junto, Gaste Menos" 
                className="h-12 w-auto max-w-[220px] object-contain"
              />
            </Link>
            
            {/* Loading state */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse ring-2 ring-blue-50"></div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105">
            <img 
              src={logoImage} 
              alt="PartiuTrip - Viaje Junto, Gaste Menos" 
              className="h-12 w-auto max-w-[220px] object-contain"
            />
          </Link>
          
          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                          isActive(item.href) 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" 
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      data-tour={item.tourData}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-blue-50 rounded-lg px-3 py-2 transition-all duration-200">
                      <Avatar className="w-9 h-9 ring-2 ring-blue-100">
                        <AvatarImage src={user?.profilePhoto || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block font-medium text-gray-700">
                        {user?.fullName?.split(' ')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-gray-600">{user?.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 w-full">
                        <LayoutDashboard className="h-4 w-4" />
                        Painel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="py-6">
                        <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user?.profilePhoto || ""} />
                            <AvatarFallback>
                              {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user?.fullName}</div>
                            <div className="text-sm text-gray-600">{user?.email}</div>
                          </div>
                        </div>

                        <nav className="space-y-2">
                          {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link key={item.href} href={item.href}>
                                <Button 
                                  variant={isActive(item.href) ? "default" : "ghost"}
                                  className={`w-full justify-start gap-3 ${
                                    isActive(item.href) 
                                      ? "bg-primary text-white" 
                                      : "text-dark hover:text-primary hover:bg-gray-50"
                                  }`}
                                  data-tour={item.tourData}
                                >
                                  <Icon className="h-4 w-4" />
                                  {item.label}
                                </Button>
                              </Link>
                            );
                          })}
                          
                          <div className="pt-4 border-t mt-4">
                            <Link href="/perfil">
                              <Button variant="ghost" className="w-full justify-start gap-3 text-dark hover:text-primary hover:bg-gray-50">
                                <User className="h-4 w-4" />
                                Meu Perfil
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="ghost" 
                              onClick={handleLogout}
                              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              Sair
                            </Button>
                          </div>
                        </nav>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </>
          )}

          {/* Guest Navigation */}
          {!user && (
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-4 py-2 font-medium transition-all duration-200">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
