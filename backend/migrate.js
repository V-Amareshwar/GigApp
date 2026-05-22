require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const migrate = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sqlPath = path.join(__dirname, 'supabase_migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration script...');
    await client.query(sql);

    // Let's insert a dummy mock user so we can test the frontend easily
    console.log('Seeding dummy user for mock auth...');
    const seedSql = `
      INSERT INTO public.profiles (
        id, role, name, phone, city, languages, gender, age, 
        skills, experience, preferred_work_type, preferred_categories, 
        salary_expectation, availability, business_name, 
        rating, jobs_completed, attendance_score, cancellation_rate, 
        phone_verified, id_verified, active_jobs, hiring_success_rate, 
        response_time, total_applications, response_rate
      ) VALUES (
        '11111111-1111-1111-1111-111111111111', 
        'Seeker', 
        'Mock User', 
        '+91 98765 43210', 
        'Hyderabad', 
        ARRAY['English', 'Hindi', 'Telugu'], 
        'Male', 
        '28', 
        ARRAY['Driving', 'Packing', 'Delivery'], 
        '1-3 Years', 
        'Daily', 
        ARRAY['Delivery', 'Warehouse'], 
        '₹800/day', 
        'Available Now', 
        'FreshMart Logistics', 
        4.8, 
        52, 
        '95%', 
        '2%', 
        true, 
        true, 
        8, 
        '92%', 
        'Replies within 10 mins', 
        120, 
        '98%'
      ) ON CONFLICT (id) DO NOTHING;
    `;
    await client.query(seedSql);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
};

migrate();
