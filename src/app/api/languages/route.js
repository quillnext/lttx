import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'languages.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    let languagesData = JSON.parse(fileContent);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const languageMap = new Map();
    languagesData.forEach(lang => {
      // Ensure lang and lang.name are valid before processing
      if (lang && typeof lang.name === 'string') {
        const trimmedName = lang.name.trim();
        // Use a consistent key (lowercase) for de-duplication
        const key = trimmedName.toLowerCase();
        // Add to map only if the key doesn't exist, preserving first-seen casing
        if (trimmedName && !languageMap.has(key)) {
          languageMap.set(key, {
            value: trimmedName,
            label: trimmedName,
          });
        }
      }
    });
    
    let languageOptions = Array.from(languageMap.values());


    if (search) {
      languageOptions = languageOptions.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Limit to 100 results for performance
    languageOptions = languageOptions.slice(0, 100);

    return NextResponse.json(languageOptions);
  } catch (error) {
    console.error('Error in /api/languages:', error);
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}