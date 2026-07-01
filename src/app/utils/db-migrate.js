import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

// Load .env.local values for fallback
import fs from "fs";
import path from "path";
if (fs.existsSync(".env.local")) {
  const envLocal = fs.readFileSync(".env.local", "utf8");
  envLocal.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const run = async () => {
  const connectionString = "postgresql://postgres:KmHvCI7hdDbyAEemKJyNOfzm@cjlwfbusxxvvwlavdkjr.supabase.co:6543/postgres";
  console.log("Connecting directly to remote Postgres via pg Client...");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully. Applying SQL updates...");

    const queries = [
      `DELETE FROM public.profiles 
       WHERE id NOT IN (
         SELECT MIN(id) 
         FROM public.profiles 
         GROUP BY LOWER(TRIM(email))
       ) AND email IS NOT NULL AND email != '';`,
       
      `DELETE FROM public.profiles 
       WHERE id NOT IN (
         SELECT MIN(id) 
         FROM public.profiles 
         GROUP BY TRIM(phone)
       ) AND phone IS NOT NULL AND phone != '';`,

      `ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_profile_email;`,
      `ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_profile_phone;`,
      `ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profile_role;`,

      `ALTER TABLE public.profiles ADD CONSTRAINT unique_profile_email UNIQUE (email);`,
      `ALTER TABLE public.profiles ADD CONSTRAINT unique_profile_phone UNIQUE (phone);`,

      `ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('user', 'expert', 'agency', 'admin'));`
    ];

    for (let query of queries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
    }
    console.log("Database constraints applied successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
  }
};

run();
