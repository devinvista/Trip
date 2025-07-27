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
  // Configuração de sessão simplificada para PostgreSQL
  app.use(session({
    secret: process.env.SESSION_SECRET || "viaja-junto-secret-key-2024",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'lax'
    },
    name: 'connect.sid'
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Estratégia local simplificada
  passport.use(new LocalStrategy(
    {
      usernameField: 'identifier',
      passwordField: 'password'
    },
    async (identifier, password, done) => {
      try {
        console.log(`🔐 Tentativa de login para: ${identifier}`);
        
        // Buscar usuário
        let user = await storage.getUserByUsername(identifier);
        if (!user) {
          user = await storage.getUserByEmail(identifier);
        }
        
        if (!user) {
          console.log(`❌ Usuário não encontrado: ${identifier}`);
          return done(null, false, { message: 'Usuário não encontrado' });
        }

        console.log(`👤 Usuário encontrado: ${user.username}`);
        
        // Verificar senha
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`🔑 Verificação de senha: ${isValid ? 'SUCESSO' : 'FALHA'}`);
        
        if (!isValid) {
          console.log(`❌ Login falhado: Senha incorreta para ${user.username}`);
          return done(null, false, { message: 'Senha incorreta' });
        }

        // Remover senha do objeto retornado
        const { password: _, ...userWithoutPassword } = user;
        const cleanUser = {
          ...userWithoutPassword,
          bio: userWithoutPassword.bio || undefined,
          location: userWithoutPassword.location || undefined,
          profilePhoto: userWithoutPassword.profilePhoto || undefined,
          languages: userWithoutPassword.languages as string[] || undefined,
          interests: userWithoutPassword.interests as string[] || undefined,
          travelStyles: userWithoutPassword.travelStyles as string[] || undefined,
          averageRating: userWithoutPassword.averageRating || undefined,
        };

        console.log(`✅ Login bem-sucedido: ${user.username}`);
        return done(null, cleanUser);
      } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        return done(error);
      }
    }
  ));

  // Serialização/deserialização do usuário
  passport.serializeUser((user: any, done) => {
    console.log(`📝 Serializando usuário: ${user.username} (ID: ${user.id})`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`🔍 Deserializando usuário ID: ${id}`);
      const user = await storage.getUser(id);
      
      if (!user) {
        console.log(`❌ Usuário não encontrado na deserialização: ${id}`);
        return done(null, false);
      }

      const { password: _, ...userWithoutPassword } = user;
      const cleanUser = {
        ...userWithoutPassword,
        bio: userWithoutPassword.bio || undefined,
        location: userWithoutPassword.location || undefined,
        profilePhoto: userWithoutPassword.profilePhoto || undefined,
        languages: userWithoutPassword.languages as string[] || undefined,
        interests: userWithoutPassword.interests as string[] || undefined,
        travelStyles: userWithoutPassword.travelStyles as string[] || undefined,
      };

      console.log(`✅ Usuário deserializado: ${user.username}`);
      done(null, cleanUser);
    } catch (error) {
      console.error('❌ Erro na deserialização:', error);
      done(error);
    }
  });

  // Rotas de autenticação
  app.post("/api/auth/login", (req, res, next) => {
    console.log(`🚪 Tentativa de login: ${req.body.identifier}`);
    
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('❌ Erro no passport authenticate:', err);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
      
      if (!user) {
        console.log(`❌ Login falhado: ${info?.message || 'Credenciais inválidas'}`);
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error('❌ Erro no req.logIn:', err);
          return res.status(500).json({ message: "Erro ao fazer login" });
        }
        
        console.log(`✅ Login completo: ${user.username}`);
        res.json({ 
          user,
          message: "Login realizado com sucesso"
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, phone } = req.body;
      
      console.log(`📝 Tentativa de registro: ${username}`);

      // Verificar se o usuário já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Criar novo usuário
      const newUser = await storage.createUser({
        username,
        email,
        password,
        fullName,
        phone,
        bio: null,
        location: null,
        profilePhoto: null,
        languages: [],
        interests: [],
        travelStyles: [],
        isVerified: false,
        averageRating: "5.00",
        totalRatings: 0,
        verificationMethod: null
      });

      const { password: _, ...userWithoutPassword } = newUser;
      const cleanUser = {
        ...userWithoutPassword,
        bio: userWithoutPassword.bio || undefined,
        location: userWithoutPassword.location || undefined,
        profilePhoto: userWithoutPassword.profilePhoto || undefined,
        languages: userWithoutPassword.languages as string[] || undefined,
        interests: userWithoutPassword.interests as string[] || undefined,
        travelStyles: userWithoutPassword.travelStyles as string[] || undefined,
      };

      console.log(`✅ Usuário registrado: ${newUser.username}`);

      // Fazer login automático
      req.logIn(cleanUser, (err) => {
        if (err) {
          console.error('❌ Erro no login automático:', err);
          return res.json({ 
            user: cleanUser,
            message: "Usuário criado com sucesso, mas erro no login automático"
          });
        }
        
        res.json({ 
          user: cleanUser,
          message: "Usuário criado e logado com sucesso"
        });
      });
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const username = req.user?.username;
    
    req.logout((err) => {
      if (err) {
        console.error('❌ Erro ao fazer logout:', err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Erro ao destruir sessão:', err);
          return res.status(500).json({ message: "Erro ao finalizar sessão" });
        }
        
        console.log(`👋 Logout realizado: ${username}`);
        res.json({ message: "Logout realizado com sucesso" });
      });
    });
  });
}