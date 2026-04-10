import passport from "passport";
import "dotenv/config";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../models/user";
import { User as DBUser } from "@shared/schema";

// Types
declare global {
  namespace Express {
    interface User extends DBUser {}
  }
}

// Utils
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${hash.toString("hex")}.${salt}`;
}

async function verifyPassword(input: string, stored: string) {
  const [hash, salt] = stored.split(".");
  const inputHash = (await scryptAsync(input, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hash, "hex"), inputHash);
}

//Auth Setup 
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  //Local Strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false);

        const valid = await verifyPassword(password, user.password);
        return valid ? done(null, user) : done(null, false);
      } catch (err) {
        done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    done(null, await storage.getUser(id));
  });

  //Routes 

  app.post("/api/register", async (req, res, next) => {
    const { username, password } = req.body;

    if (await storage.getUserByUsername(username)) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      username: username.toLowerCase(),
      password: await hashPassword(password),
    });

    req.login(user, (err) =>
      err ? next(err) : res.status(201).json(user)
    );
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      req.logIn(user, (err) =>
        err ? next(err) : res.json(user)
      );
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => (err ? next(err) : res.sendStatus(200)));
  });

  app.get("/api/user", (req, res) => {
    req.isAuthenticated()
      ? res.json(req.user)
      : res.sendStatus(401);
  });
}
