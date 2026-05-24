import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET ?? "gigwork-dev-secret";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}

export function signToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const [header, payload, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (sig !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const [user] = await db.select({ id: usersTable.id, currentRole: usersTable.currentRole, isBanned: usersTable.isBanned })
    .from(usersTable).where(eq(usersTable.id, payload.sub));
  if (!user || user.isBanned) {
    res.status(401).json({ error: "User not found or banned" });
    return;
  }
  req.userId = user.id;
  req.userRole = user.currentRole;
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole !== role) {
      res.status(403).json({ error: `Requires ${role} role` });
      return;
    }
    next();
  };
}
