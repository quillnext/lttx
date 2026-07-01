import fs from 'fs';
import path from 'path';

const dir = './src';

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      refactorFile(fullPath);
    }
  }
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Remove firebase imports and replace with supabase
  if (content.includes('from "firebase/firestore"') || content.includes("from 'firebase/firestore'")) {
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"]firebase\/firestore['"];?/g, '');
    modified = true;
  }
  if (content.includes('from "firebase/auth"') || content.includes("from 'firebase/auth'")) {
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"]firebase\/auth['"];?/g, '');
    modified = true;
  }
  if (content.includes('from "@/lib/firebase"') || content.includes("from '@/lib/firebase'")) {
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"]@\/lib\/firebase['"];?/g, '');
    modified = true;
  }
  if (content.includes('from "@/lib/firebaseAdmin"') || content.includes("from '@/lib/firebaseAdmin'")) {
    content = content.replace(/import\s+{[^}]+}\s+from\s+['"]@\/lib\/firebaseAdmin['"];?/g, '');
    modified = true;
  }
  if (content.includes('import admin from "firebase-admin";') || content.includes("import admin from 'firebase-admin';")) {
    content = content.replace(/import\s+admin\s+from\s+['"]firebase-admin['"];?/g, '');
    modified = true;
  }

  // 2. Remove const db = getFirestore(app);
  if (content.includes('const db = getFirestore(app);')) {
    content = content.replace(/const\s+db\s+=\s+getFirestore\(app\);?/g, '');
    modified = true;
  }
  if (content.includes('const db = getFirestore();')) {
    content = content.replace(/const\s+db\s+=\s+getFirestore\(\);?/g, '');
    modified = true;
  }

  // 3. Add supabase import if we removed firebase
  if (modified && !content.includes('@/lib/supabase')) {
    // Insert after "use client"; or at the top
    if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
      content = content.replace(/"use client";\s*/, '"use client";\n\nimport { supabase } from "@/lib/supabase";\n');
    } else {
      content = 'import { supabase } from "@/lib/supabase";\n' + content;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored imports in: ${filePath}`);
  }
}

walk(dir);
console.log('Bulk refactoring completed.');
