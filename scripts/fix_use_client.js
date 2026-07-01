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
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // If "use client" is in the file but not at the very top
  if (content.includes('"use client"') || content.includes("'use client'")) {
    // Normalize newlines and trim initial whitespaces
    let cleanContent = content.trim();
    
    // Check if it already starts with "use client"
    if (cleanContent.startsWith('"use client"') || cleanContent.startsWith("'use client'")) {
      return;
    }
    
    // Remove "use client" from its current location
    cleanContent = cleanContent.replace(/"use client";?/g, '').replace(/'use client';?/g, '');
    
    // Put "use client" at the very beginning
    const newContent = `"use client";\n\n${cleanContent.trim()}\n`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed "use client" position in: ${filePath}`);
  }
}

walk(dir);
console.log('Cleanup of "use client" positions completed.');
