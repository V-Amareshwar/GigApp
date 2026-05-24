import { db, usersTable, seekerProfilesTable, providerProfilesTable, categoriesTable, jobsTable } from "@workspace/db";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET ?? "gigwork-dev-secret";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Categories
  const categories = [
    { name: "Delivery", nameHi: "डिलीवरी", iconName: "truck", sortOrder: 1 },
    { name: "Restaurant & Food", nameHi: "रेस्टोरेंट", iconName: "utensils", sortOrder: 2 },
    { name: "Construction", nameHi: "निर्माण", iconName: "hard-hat", sortOrder: 3 },
    { name: "Domestic Help", nameHi: "घरेलू सहायता", iconName: "home", sortOrder: 4 },
    { name: "Security", nameHi: "सुरक्षा", iconName: "shield", sortOrder: 5 },
    { name: "Events", nameHi: "इवेंट", iconName: "calendar", sortOrder: 6 },
    { name: "Warehouse", nameHi: "गोदाम", iconName: "package", sortOrder: 7 },
    { name: "Driving", nameHi: "ड्राइविंग", iconName: "car", sortOrder: 8 },
    { name: "Retail", nameHi: "खुदरा", iconName: "shopping-bag", sortOrder: 9 },
    { name: "Healthcare", nameHi: "स्वास्थ्य सेवा", iconName: "heart", sortOrder: 10 },
  ];

  const insertedCategories = await db.insert(categoriesTable).values(categories).onConflictDoNothing().returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  // Fetch categories to get their IDs
  const allCats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(allCats.map(c => [c.name, c.id]));

  // Provider users
  const providers = [
    { phone: "9876543210", name: "Ravi Kumar", city: "Mumbai" },
    { phone: "9876543211", name: "Priya Sharma", city: "Delhi" },
    { phone: "9876543212", name: "Anand Logistics", city: "Bangalore" },
  ];

  const providerIds: string[] = [];
  for (const p of providers) {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(
      (await import("drizzle-orm")).eq(usersTable.phone, p.phone)
    );
    if (existing.length > 0) {
      providerIds.push(existing[0].id);
      continue;
    }
    const [user] = await db.insert(usersTable).values({
      phone: p.phone, name: p.name, city: p.city,
      passwordHash: hashPassword("password123"),
      currentRole: "provider", isPhoneVerified: true,
    }).returning();
    await db.insert(providerProfilesTable).values({ userId: user.id, businessName: p.name }).onConflictDoNothing();
    providerIds.push(user.id);
  }
  console.log(`Providers ready: ${providerIds.length}`);

  // Seeker users
  const seekers = [
    { phone: "9123456780", name: "Suresh Yadav", city: "Mumbai" },
    { phone: "9123456781", name: "Meena Devi", city: "Delhi" },
    { phone: "9123456782", name: "Arun Singh", city: "Bangalore" },
  ];

  const seekerIds: string[] = [];
  for (const s of seekers) {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(
      (await import("drizzle-orm")).eq(usersTable.phone, s.phone)
    );
    if (existing.length > 0) {
      seekerIds.push(existing[0].id);
      continue;
    }
    const [user] = await db.insert(usersTable).values({
      phone: s.phone, name: s.name, city: s.city,
      passwordHash: hashPassword("password123"),
      currentRole: "seeker", isPhoneVerified: true,
    }).returning();
    await db.insert(seekerProfilesTable).values({
      userId: user.id, bio: "Looking for daily work", availability: "immediate",
      skills: ["hard-working", "punctual"],
    }).onConflictDoNothing();
    seekerIds.push(user.id);
  }
  console.log(`Seekers ready: ${seekerIds.length}`);

  // Sample jobs
  const jobs = [
    {
      providerId: providerIds[0],
      title: "Delivery Boy - E-commerce",
      categoryId: catMap["Delivery"],
      description: "Deliver packages across South Mumbai. Own bike preferred.",
      workType: "daily",
      dailyWage: 700,
      city: "Mumbai",
      address: "Andheri East, Mumbai",
      isUrgent: true,
      foodIncluded: false,
      skillsRequired: ["bike-riding", "smartphone"],
    },
    {
      providerId: providerIds[1],
      title: "Cook Helper",
      categoryId: catMap["Restaurant & Food"],
      description: "Assist head cook in a busy restaurant kitchen. Morning shift.",
      workType: "monthly",
      monthlySalary: 14000,
      city: "Delhi",
      address: "Connaught Place, Delhi",
      isUrgent: false,
      foodIncluded: true,
      skillsRequired: ["cooking-basics"],
    },
    {
      providerId: providerIds[2],
      title: "Warehouse Helper",
      categoryId: catMap["Warehouse"],
      description: "Loading and unloading goods in warehouse.",
      workType: "hourly",
      hourlyRate: 120,
      totalHours: 8,
      city: "Bangalore",
      address: "Whitefield, Bangalore",
      isUrgent: false,
      skillsRequired: ["physical-fitness"],
    },
    {
      providerId: providerIds[0],
      title: "Security Guard - Night Shift",
      categoryId: catMap["Security"],
      description: "Night security for commercial building.",
      workType: "monthly",
      monthlySalary: 16000,
      city: "Mumbai",
      address: "Bandra West, Mumbai",
      isUrgent: true,
      skillsRequired: ["security-training"],
    },
    {
      providerId: providerIds[1],
      title: "House Cleaning",
      categoryId: catMap["Domestic Help"],
      description: "Daily cleaning of a 3BHK apartment.",
      workType: "daily",
      dailyWage: 400,
      city: "Delhi",
      address: "Dwarka, Delhi",
      isUrgent: false,
      skillsRequired: ["cleaning"],
    },
  ];

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  for (const job of jobs) {
    await db.insert(jobsTable).values({ ...job, status: "active", expiresAt }).onConflictDoNothing();
  }
  console.log(`Jobs inserted`);

  console.log("\n=== TEST CREDENTIALS ===");
  console.log("Provider: phone=9876543210, password=password123");
  console.log("Seeker:   phone=9123456780, password=password123");
  console.log("========================\n");
}

seed().then(() => { console.log("Seed complete!"); process.exit(0); })
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); });
