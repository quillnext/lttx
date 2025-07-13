import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'cities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    let citiesData = JSON.parse(fileContent);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let cityOptions = [];
    for (const countryName in citiesData) {
      if (Object.prototype.hasOwnProperty.call(citiesData, countryName)) {
        const citiesInCountry = citiesData[countryName];
        citiesInCountry.forEach(city => {
          const label = `${city}, ${countryName}`;
          if (!search || label.toLowerCase().includes(search.toLowerCase())) {
            cityOptions.push({
              value: label,
              label: label,
              country: countryName,
            });
          }
        });
      }
    }

    // Limit to 20 results for dropdown performance
    cityOptions = cityOptions.slice(0, 100);

    return NextResponse.json(cityOptions);
  } catch (error) {
    console.error('Error in /api/cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}