import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { serializeUser } from "../lib/userSerializer";

const router: Router = Router();

router.post("/v1/reviews", requireAuth, async (req, res): Promise<void> => {
  const { application_id, reviewee_id, rating, reviewer_role, comment } = req.body;
  if (!reviewee_id || !rating || !reviewer_role) {
    res.status(400).json({ error: "reviewee_id, rating, and reviewer_role are required" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "rating must be between 1 and 5" });
    return;
  }
  const [review] = await db.insert(reviewsTable).values({
    applicationId: application_id ?? null,
    reviewerId: req.userId!,
    revieweeId: reviewee_id,
    reviewerRole: reviewer_role,
    rating,
    comment: comment ?? null,
  }).returning();

  const reviewer = await serializeUser(review.reviewerId);
  res.status(201).json({
    id: review.id,
    application_id: review.applicationId,
    reviewer_id: review.reviewerId,
    reviewee_id: review.revieweeId,
    reviewer_role: review.reviewerRole,
    rating: review.rating,
    comment: review.comment,
    reviewer,
    created_at: review.createdAt.toISOString(),
  });
});

router.get("/v1/users/:userId/reviews", requireAuth, async (req, res): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.revieweeId, userId))
    .orderBy(desc(reviewsTable.createdAt));

  const results = await Promise.all(reviews.map(async (r) => {
    const reviewer = await serializeUser(r.reviewerId);
    return {
      id: r.id,
      application_id: r.applicationId,
      reviewer_id: r.reviewerId,
      reviewee_id: r.revieweeId,
      reviewer_role: r.reviewerRole,
      rating: r.rating,
      comment: r.comment,
      reviewer,
      created_at: r.createdAt.toISOString(),
    };
  }));
  res.json(results);
});

export default router;
