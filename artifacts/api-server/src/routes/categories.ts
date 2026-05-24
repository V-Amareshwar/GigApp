import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: Router = Router();

router.get("/v1/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(asc(categoriesTable.sortOrder));
  res.json(categories.map(c => ({
    id: c.id,
    name: c.name,
    name_hi: c.nameHi,
    icon_name: c.iconName,
    sort_order: c.sortOrder,
  })));
});

export default router;
