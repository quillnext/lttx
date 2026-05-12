
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "xmytravel-ed995.appspot.com"
  });
}
const db = admin.firestore();
const bucket = admin.storage().bucket();

async function migrateCollections() {
  const collections = await db.listCollections();
  console.log(`🚀 Starting 1-to-1 Migration...`);

  for (const collection of collections) {
    const name = collection.id;
    console.log(`\n📦 Migrating Collection: ${name}`);
    
    try {
      const snapshot = await collection.get();
      for (const docSnap of snapshot.docs) {
        try {
          const data = docSnap.data();
          const id = docSnap.id;

          if (name === 'Profiles') {
            await supabase.from('profiles').upsert({
              id,
              full_name: data.fullName || '',
              username: data.username || `user_${id.substring(0, 5)}`,
              email: data.email || '',
              photo_url: data.photo || '',
              experience: data.experience || [],
              expertise: data.expertise || [],
              regions: data.regions || [],
              services: data.services || [],
              updated_at: new Date().toISOString(),
            });
          } else if (name === 'JoinQueries') {
            await supabase.from('join_queries').upsert({
              id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              purpose: data.purpose || '',
              message: data.message || '',
              created_at: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()) : new Date().toISOString()
            });
          } else {
            // Check if table exists by doing a dry-run upsert (or just catch the error)
            const { error } = await supabase.from(name).upsert({ id, data: data });
            if (error) {
              if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.warn(`⚠️ Table "${name}" not found in Supabase. Skipping.`);
                break; // Stop this collection if table doesn't exist
              } else {
                console.error(`❌ Error in ${name} for ID ${id}:`, error.message);
              }
            }
          }
        } catch (innerError) {
          console.error(`❌ Unexpected error for doc ${docSnap.id} in ${name}:`, innerError.message);
        }
      }
      console.log(`✅ ${name} complete.`);
    } catch (collError) {
      console.error(`❌ Failed to fetch collection ${name}:`, collError.message);
    }
  }
}

async function migrateStorage() {
  console.log('\n📁 Migrating ALL Storage files...');
  try {
    const [files] = await bucket.getFiles();
    console.log(`📸 Found ${files.length} files.`);
    for (const file of files) {
      try {
        console.log(`📤 Moving: ${file.name}`);
        const [buffer] = await file.download();
        const { error } = await supabase.storage.from('firebase-migration').upload(file.name, buffer, {
          contentType: file.metadata.contentType,
          upsert: true
        });
        if (error) console.error(`❌ Failed to upload ${file.name}:`, error.message);
      } catch (fileError) {
        console.error(`❌ Error with file ${file.name}:`, fileError.message);
      }
    }
  } catch (storageError) {
    console.error(`❌ Failed to access Storage:`, storageError.message);
  }
}

async function run() {
  await migrateCollections();
  await migrateStorage();
  console.log('\n🏆 MIGRATION ATTEMPT COMPLETE!');
}

run();
