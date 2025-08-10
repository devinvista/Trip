
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { storage, sessionConfig } from "./storage";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string;
      phone: string;
      bio?: string;
      location?: string;
      profilePhoto?: string;
      languages?: string[];
      interests?: string[];
      travelStyles?: string[];
      isVerified?: boolean;
      averageRating?: string;
      totalRatings?: number;
    }
  }
}

export function setupAuth(app: Express) {
  // Configuração de sessão
  app.use(session({
    secret: process.env.SESSION_SECRET || "viaja-junto-secret-key-2024",
    resave: false,
    saveUninitialized: true, // Create session even if not modified
    cookie: {
      secure: false, // false para desenvolvimento
      httpOnly: false, // Allow frontend access in development
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax', // Use lax for same-site in Replit
      path: '/',
      domain: undefined, // Use default domain
      partitioned: false // Prevent partitioned cookies
    },
    name: 'connect.sid',
    store: storage.sessionStore,
    rolling: true // Extend session on each request
  }));

  // Add CORS headers for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Inicializar Passport ANTES do middleware customizado
  app.use(passport.initialize());
  app.use(passport.session());

  // Custom authentication middleware to handle both session and manual session ID
  app.use(async (req: any, res, next) => {
    // Log session information for debugging
    if (req.path.startsWith('/api/')) {
      console.log('🔍 Session debug:', {
        url: req.url,
        method: req.method,
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'undefined',
        hasUser: !!req.user,
        sessionData: req.session,
        cookies: Object.keys(req.cookies || {}),
        headers: {
          cookie: req.headers.cookie ? 'presente' : 'ausente',
          sessionIdHeader: req.headers['x-session-id'] ? 'presente' : 'ausente'
        }
      });
    }
    
    // If already authenticated via session, continue
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return next();
    }
    
    // Check for session ID in headers (fallback for browser compatibility)
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (sessionId && req.path.startsWith('/api/')) {
      try {
        // Try to find session in store
        const sessionData = await new Promise((resolve, reject) => {
          sessionConfig.store.get(sessionId, (err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        
        if (sessionData && (sessionData as any).passport && (sessionData as any).passport.user) {
          const userId = (sessionData as any).passport.user;
          const user = await storage.getUserById(userId);
          
          if (user) {
            // Manually set user on request
            const { password: _, ...userWithoutPassword } = user;
            const cleanUser = {
              ...userWithoutPassword,
              bio: userWithoutPassword.bio || undefined,
              location: userWithoutPassword.location || undefined,
              profilePhoto: userWithoutPassword.profilePhoto || undefined,
              languages: userWithoutPassword.languages || undefined,
              interests: userWithoutPassword.interests || undefined,
              travelStyles: userWithoutPassword.travelStyless || undefined,
            };
            
            req.user = cleanUser as any;
            req.isAuthenticated = () => true;
            console.log('✅ Autenticação manual bem-sucedida:', user.username);
          }
        }
      } catch (error) {
        console.error('Erro na autenticação manual:', error);
      }
    }
    
    // Final debug log after authentication attempts
    if (req.path.startsWith('/api/')) {
      console.log('🔍 Verificando usuário atual:', {
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        hasUser: !!req.user,
        user: req.user ? req.user.username : undefined,
        sessionID: req.sessionID,
        session: req.session,
        cookies: req.cookies
      });
    }
    next();
  });

  // Estratégia local
  passport.use(new LocalStrategy(
    {
      usernameField: 'identifier',
      passwordField: 'password'
    },
    async (identifier, password, done) => {
      try {
        // Tenta buscar o usuário por username, email ou telefone
        let user = await storage.getUserByUsername(identifier);
        
        if (!user) {
          user = await storage.getUserByEmail(identifier);
        }
        
        if (!user) {
          // Remove formatação do telefone para busca
          const cleanPhone = identifier.replace(/\D/g, '');
          user = await storage.getUserByPhone(cleanPhone);
        }
        
        if (!user) {
          return done(null, false, { message: 'Usuário não encontrado' });
        }

        // Check if password uses the new scrypt format (contains a dot)
        let isValid = false;
        if (user.password.includes('.')) {
          // New scrypt format
          const { scrypt } = await import('crypto');
          const { promisify } = await import('util');
          const scryptAsync = promisify(scrypt);
          
          const [hash, salt] = user.password.split('.');
          const buf = (await scryptAsync(password, salt, 64)) as Buffer;
          isValid = buf.toString('hex') === hash;
        } else {
          // Legacy bcrypt format
          isValid = await bcrypt.compare(password, user.password);
        }
        
        if (!isValid) {
          return done(null, false, { message: 'Senha incorreta' });
        }

        // Remover senha do objeto usuário
        const { password: _, ...userWithoutPassword } = user;
        // Convert null values to undefined for TypeScript compatibility
        const cleanUser = {
          ...userWithoutPassword,
          bio: userWithoutPassword.bio || undefined,
          location: userWithoutPassword.location || undefined,
          profilePhoto: userWithoutPassword.profilePhoto || undefined,
          languages: userWithoutPassword.languages || undefined,
          interests: userWithoutPassword.interests || undefined,
          travelStyles: userWithoutPassword.travelStyless || undefined,
        };
        return done(null, cleanUser);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialização do usuário
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialização do usuário
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) {
        return done(null, false);
      }
      
      const { password: _, ...userWithoutPassword } = user;
      // Convert null values to undefined for TypeScript compatibility
      const cleanUser = {
        ...userWithoutPassword,
        bio: userWithoutPassword.bio || undefined,
        location: userWithoutPassword.location || undefined,
        profilePhoto: userWithoutPassword.profilePhoto || undefined,
        languages: userWithoutPassword.languages || undefined,
        interests: userWithoutPassword.interests || undefined,
        travelStyles: userWithoutPassword.travelStyles || undefined,
      };
      done(null, cleanUser);
    } catch (error) {
      done(error);
    }
  });

  // Rota de verificação do usuário
  app.get("/api/user", async (req, res) => {
    if (req.isAuthenticated() && req.user) {
      // Always fetch fresh user data from database to ensure latest verification status
      try {
        const freshUser = await storage.getUserById((req.user as any).id);
        if (freshUser) {
          const { password: _, ...userWithoutPassword } = freshUser;
          const cleanUser = {
            ...userWithoutPassword,
            bio: userWithoutPassword.bio || undefined,
            location: userWithoutPassword.location || undefined,
            profilePhoto: userWithoutPassword.profilePhoto || undefined,
            languages: userWithoutPassword.languages || undefined,
            interests: userWithoutPassword.interests || undefined,
            travelStyles: userWithoutPassword.travelStyles || undefined,
          };
          console.log('✅ Fresh user data loaded, isVerified:', cleanUser.isVerified);
          res.json(cleanUser);
        } else {
          res.status(401).json({ message: "Usuário não encontrado" });
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    } else {
      console.log('🔍 Verificando usuário atual:', {
        isAuthenticated: req.isAuthenticated(),
        hasUser: !!req.user,
        user: req.user,
        sessionID: req.sessionID,
        session: req.session,
        cookies: req.cookies
      });
      res.status(401).json({ message: "Não autorizado" });
    }
  });

  // Debug route to test API functionality
  app.get("/api/auth/test", (req, res) => {
    res.json({ message: "API está funcionando", timestamp: new Date().toISOString() });
  });

  // Rota de login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Erro na autenticação:', err);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
      
      if (!user) {
        console.log('Login falhado:', info?.message);
        return res.status(401).json({ 
          message: info?.message || "Credenciais inválidas" 
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error('Erro ao fazer login:', err);
          return res.status(500).json({ message: "Erro ao fazer login" });
        }
        
        console.log('Login bem-sucedido:', {
          userId: user.id,
          username: user.username,
          sessionID: req.sessionID,
          isAuthenticated: req.isAuthenticated()
        });
        
        // Force session save to ensure persistence
        req.session.save((err) => {
          if (err) {
            console.error('Erro ao salvar sessão:', err);
            return res.status(500).json({ message: "Erro ao salvar sessão" });
          }
          
          console.log('Sessão salva com sucesso. SessionID:', req.sessionID);
          console.log('Cookie headers:', res.getHeaders());
          
          // Also send session ID in response for browser compatibility
          return res.json({
            ...user,
            sessionId: req.sessionID
          });
        });
      });
    })(req, res, next);
  });

  // Rota de registro
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, fullName, phone, bio, location, languages, interests, travelStyles, referredBy } = req.body;

      // Verificar se usuário já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está cadastrado" });
      }

      // Hash da senha using scrypt (consistent with test user)
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Determinar se usuário deve ser verificado automaticamente
      const isVerified = !!referredBy; // Usuários com código de indicação são verificados automaticamente
      const verificationMethod = referredBy ? 'referral' : null;

      // Criar usuário
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        phone,
        bio,
        location,
        languages,
        interests,
        travelStyles,
        referredBy,
        isVerified,
        verificationMethod
      });

      // Fazer login automático
      const { password: _, ...userWithoutPassword } = newUser;
      // Convert null values to undefined for TypeScript compatibility
      const cleanUser = {
        ...userWithoutPassword,
        bio: userWithoutPassword.bio || undefined,
        location: userWithoutPassword.location || undefined,
        profilePhoto: userWithoutPassword.profilePhoto || undefined,
        languages: userWithoutPassword.languages || undefined,
        interests: userWithoutPassword.interests || undefined,
        travelStyles: userWithoutPassword.travelStyles || undefined,
      };
      
      req.logIn(cleanUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login automático" });
        }
        
        return res.status(201).json(cleanUser);
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota de logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao destruir sessão" });
        }
        
        res.clearCookie('viaja.session');
        res.json({ message: "Logout realizado com sucesso" });
      });
    });
  });

  // Rota para solicitações do usuário
  app.get("/api/user-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const requests = await storage.getUserTripRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      res.status(500).json({ message: "Erro ao buscar solicitações" });
    }
  });
}
