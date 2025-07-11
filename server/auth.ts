
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string;
      bio?: string;
      location?: string;
      profilePhoto?: string;
      languages?: string[];
      interests?: string[];
      travelStyle?: string;
    }
  }
}

export function setupAuth(app: Express) {
  // Configuração de sessão
  app.use(session({
    secret: process.env.SESSION_SECRET || "viaja-junto-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false para desenvolvimento
      httpOnly: false, // Allow frontend access in development
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax'
    },
    name: 'connect.sid',
    store: storage.sessionStore
  }));

  // Inicializar Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Estratégia local
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
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
          travelStyle: userWithoutPassword.travelStyle || undefined,
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
      const user = await storage.getUser(id);
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
        travelStyle: userWithoutPassword.travelStyle || undefined,
      };
      done(null, cleanUser);
    } catch (error) {
      done(error);
    }
  });

  // Rota de verificação do usuário
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Não autorizado" });
    }
  });

  // Rota de login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
      
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Credenciais inválidas" 
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login" });
        }
        
        return res.json(user);
      });
    })(req, res, next);
  });

  // Rota de registro
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, fullName, bio, location, languages, interests, travelStyle } = req.body;

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

      // Criar usuário
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        bio,
        location,
        languages,
        interests,
        travelStyle
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
        travelStyle: userWithoutPassword.travelStyle || undefined,
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
