import fs from 'fs/promises';
import path from 'path';

async function fetchFuelPrice() {
  try {
    const response = await fetch('https://oil-price.bangchak.co.th/ApiOilPrice2/en');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0 || !data[0].OilList) {
      throw new Error('Invalid response format: missing OilList');
    }
    
    const oilListStr = data[0].OilList;
    const oilList = JSON.parse(oilListStr);
    
    const gasohol95 = oilList.find((oil) => 
      oil.OilName && oil.OilName.toLowerCase().includes('gasohol 95')
    );
    
    if (!gasohol95) {
      throw new Error('Could not find Gasohol 95 in the oil list');
    }
    
    const price = parseFloat(gasohol95.PriceToday);
    if (isNaN(price)) {
      throw new Error(`Invalid price format: ${gasohol95.PriceToday}`);
    }
    
    const outData = {
      pricePerLitre: price,
      fuelType: gasohol95.OilName,
      fetchedAt: new Date().toISOString(),
      source: 'bangchak'
    };
    
    const outDir = path.join(process.cwd(), 'public');
    await fs.mkdir(outDir, { recursive: true });
    
    const outPath = path.join(outDir, 'fuel-price.json');
    await fs.writeFile(outPath, JSON.stringify(outData, null, 2), 'utf-8');
    
    console.log(`Successfully wrote fuel price to ${outPath}`);
  } catch (err) {
    console.error('Error fetching fuel price:', err.message);
    process.exit(1);
  }
}

fetchFuelPrice();
