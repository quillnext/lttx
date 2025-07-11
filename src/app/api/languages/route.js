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

    let languageOptions = languagesData.map(lang => ({
      value: lang.name,
      label: lang.name,
    }));

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