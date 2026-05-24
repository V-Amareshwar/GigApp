import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: Router = Router();

router.get("/v1/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { unread_only } = req.query;

  const conditions = [eq(notificationsTable.userId, userId)];
  if (unread_only === "true") conditions.push(eq(notificationsTable.isRead, false));

  const notifications = await db.select().from(notificationsTable)
    .where(and(...conditions))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications.map(n => ({
    id: n.id,
    user_id: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    is_read: n.isRead,
    job_id: n.jobId,
    application_id: n.applicationId,
    created_at: n.createdAt.toISOString(),
  })));
});

router.put("/v1/notifications/mark-read", requireAuth, async (req, res): Promise<void> => {
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.userId!));
  res.json({ message: "All notifications marked as read" });
});

export default router;
