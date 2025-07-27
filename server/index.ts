import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testConnection, initializeTables, db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { syncParticipantsCount } from "./sync-participants.ts";
import { fixUserVerificationStatus } from "./fix-user-verification";
// import { setupReferralSystem } from "./setup-referral-system"; // Removed for PostgreSQL migration

const app = express();

// Trust proxy for Replit environment
app.set("trust proxy", 1);

// Cookie parser before any other middleware that needs it
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to fix user verification status
async function fixUserVerificationStatus() {
  try {
    const verifiedUsers = ['tom', 'maria', 'carlos'];
    
    for (const username of verifiedUsers) {
      const result = await db.update(users)
        .set({ 
          isVerified: true, 
          verificationMethod: 'referral' 
        })
        .where(eq(users.username, username));
        
      console.log(`✅ Status de verificação corrigido para ${username}`);
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir status de verificação:', error);
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Initialize database in background after server starts
  (async () => {
    console.log("🔗 Testando conexão PostgreSQL...");
    await testConnection();
    console.log("🏗️ Inicializando tabelas PostgreSQL...");
    await initializeTables();
    
    // Fix user verification status
    console.log("🔧 Corrigindo status de verificação dos usuários...");
    await fixUserVerificationStatus();
    
    // Sync participants count
    console.log("🔄 Sincronizando contagem de participantes...");
    await syncParticipantsCount();
    
    // Setup referral system
    console.log("🎫 Configurando sistema de códigos de indicação...");
    // System will be setup later
  })().catch(console.error);
})();
