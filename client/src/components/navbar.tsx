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

export function Navbar() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/board", label: "Quadro Visual", icon: Kanban },
    { href: "/search", label: "Buscar Viagens", icon: Search, tourData: "search-button" },
    { href: "/create-trip", label: "Criar Viagem", icon: Plus, tourData: "create-button" },
    { href: "/journey-tracker", label: "Progresso", icon: TrendingUp },
    { href: "/collaborative-editing", label: "Edição Colaborativa", icon: Edit3 },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Don't render navigation items if still loading
  if (isLoading) {
    return (
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-heading font-bold text-2xl text-dark">ViajaJunto</span>
            </Link>
            
            {/* Loading state */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-2xl text-dark">ViajaJunto</span>
          </Link>
          
          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.href) 
                            ? "bg-primary text-white" 
                            : "text-dark hover:text-primary hover:bg-gray-50"
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
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profilePhoto || ""} />
                        <AvatarFallback>
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block font-medium text-dark">
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
                <Button variant="ghost" className="text-dark hover:bg-[#02132D] relative overflow-hidden group">
                  <span className="group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:via-orange-400 group-hover:to-red-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    Entrar
                  </span>
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/90">
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
