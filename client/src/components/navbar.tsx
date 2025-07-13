import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Plus, 
  Menu, 
  LayoutDashboard, 
  User, 
  LogOut,
  Calendar,
  Bell,
  ChevronDown
} from "lucide-react";
import logoImage from "@assets/20250713_0013_Logo com Fundo Transparente_remix_01k00w7vt0fg184dm3z41h2sk1_1752377252367.png";

export function Navbar() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/search", label: "Buscar", icon: Search, tourData: "search-button" },
    { href: "/activities", label: "Atividades", icon: Calendar },
    { href: "/create-trip", label: "Criar", icon: Plus, tourData: "create-button", highlight: true },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300">
              <img 
                src={logoImage} 
                alt="PartiuTrip - Viaje Junto, Gaste Menos" 
                className="h-10 w-auto max-w-[180px] object-contain"
              />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300 flex-shrink-0">
            <img 
              src={logoImage} 
              alt="PartiuTrip - Viaje Junto, Gaste Menos" 
              className="h-10 w-auto max-w-[180px] object-contain"
            />
          </Link>
          
          {user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                          active
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25" 
                            : item.highlight
                            ? "text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-200 hover:border-transparent"
                            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      data-tour={item.tourData}
                    >
                        <Icon className={`h-4 w-4 ${active ? 'text-white' : ''} ${item.highlight && !active ? 'text-blue-600 group-hover:text-white' : ''}`} />
                        <span className="hidden xl:block">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-2">
                {/* Notifications - Desktop only */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-300 hidden lg:flex"
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2 hover:bg-blue-50 rounded-xl px-2 py-2 transition-all duration-300 h-auto"
                    >
                      <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
                        <AvatarImage src={user?.profilePhoto || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <div className="font-medium text-slate-700 text-sm leading-tight">
                          {user?.fullName?.split(' ')[0]}
                        </div>
                        <div className="text-xs text-slate-500 leading-tight">
                          {user?.location || 'Viajante'}
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-xl">
                    {/* User Info Header */}
                    <div className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.profilePhoto || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                            {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{user?.fullName}</div>
                          <div className="text-sm text-slate-500 truncate">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg mx-1">
                          <User className="h-4 w-4 text-slate-500" />
                          <span>Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg mx-1">
                          <LayoutDashboard className="h-4 w-4 text-slate-500" />
                          <span>Painel</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    
                    <DropdownMenuSeparator className="my-1" />
                    
                    <div className="py-1">
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg mx-1 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-300"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 sm:w-96 bg-white/95 backdrop-blur-xl border-l border-slate-200/60">
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                          <img 
                            src={logoImage} 
                            alt="PartiuTrip" 
                            className="h-8 w-auto object-contain"
                          />
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-3 py-6 border-b border-slate-100">
                          <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                            <AvatarImage src={user?.profilePhoto || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                              {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{user?.fullName}</div>
                            <div className="text-sm text-slate-600 truncate">{user?.email}</div>
                            {user?.location && (
                              <div className="text-xs text-slate-500 truncate">{user.location}</div>
                            )}
                          </div>
                        </div>

                        {/* Navigation - Modern Design */}
                        <nav className="flex-1 py-6 space-y-2">
                          <div className="space-y-2">
                            {navItems.map((item) => {
                              const Icon = item.icon;
                              const active = isActive(item.href);
                              
                              return (
                                <Link key={item.href} href={item.href} className="group">
                                  <Button 
                                    variant="ghost"
                                    className={`relative w-full justify-start gap-3 h-12 rounded-xl transition-all duration-300 border group-hover:scale-[1.02] overflow-hidden ${
                                      active
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-blue-500/20 hover:shadow-xl" 
                                        : item.highlight
                                        ? "text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 border border-blue-200 hover:border-transparent hover:shadow-md"
                                        : "text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 border-transparent hover:border-blue-100 hover:shadow-md"
                                    }`}
                                    data-tour={item.tourData}
                                  >
                                    <Icon className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-white' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                    {active && (
                                      <>
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-xl blur-xl -z-10"></div>
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                      </>
                                    )}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                          
                          {/* Profile & Logout - Modern Design */}
                          <div className="pt-6 border-t border-slate-100 space-y-2">
                            <Link href="/profile" className="group">
                              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 border border-transparent hover:border-blue-100 hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                                <User className="h-5 w-5 transition-colors duration-300" />
                                <span className="font-medium">Meu Perfil</span>
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="ghost" 
                              onClick={handleLogout}
                              className="group w-full justify-start gap-3 h-12 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50/80 border border-transparent hover:border-red-100 hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]"
                            >
                              <LogOut className="h-5 w-5 transition-colors duration-300" />
                              <span className="font-medium">Sair</span>
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

          {/* Guest Navigation - Modern & Professional */}
          {!user && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/auth" className="group">
                <Button 
                  variant="ghost" 
                  className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl px-4 sm:px-6 py-2.5 font-medium transition-all duration-300 text-sm backdrop-blur-sm border border-transparent hover:border-blue-100 hover:shadow-md group-hover:scale-105"
                >
                  <span className="relative z-10">Entrar</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Button>
              </Link>
              <Link href="/auth" className="group">
                <Button className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-semibold px-5 sm:px-8 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-sm group-hover:scale-105 border border-blue-500/20 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Cadastrar
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl -z-10"></div>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}