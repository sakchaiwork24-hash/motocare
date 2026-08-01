import Tesseract from 'tesseract.js';

export type ScannedReceipt = { liters?: number; thb?: number; odo?: number; station?: string };

export async function scanFuelReceipt(file: File): Promise<ScannedReceipt> {
  const { data } = await Tesseract.recognize(file, 'eng');
  const text = data.text;
  
  const result: ScannedReceipt = {};

  try {
    // Basic heuristics to parse receipts
    
    // Liters-like decimal number (e.g., 4.56, 12.0)
    // Often next to L, Litre, etc. Let's look for a decimal number under 50 (most bike tanks are <30L, some up to 40)
    // We'll look for something like 'xx.xx' or 'x.xxx'
    const volumeMatch = text.match(/\b([1-4]?\d\.\d{2,3})\b/);
    if (volumeMatch) {
      result.liters = parseFloat(volumeMatch[1]);
    }
    
    // Total THB (often near THB, Total)
    const amountMatch = text.match(/(?:TOTAL|THB|BAHT)[\s:.-]*([1-9]\d{1,3}(?:\.\d{2})?)/i);
    if (amountMatch) {
      result.thb = parseFloat(amountMatch[1]);
    } else {
      // Look for a larger number that could be the total (e.g., 100-2000)
      const matches = text.match(/\b([1-9]\d{2,3}(?:\.\d{2})?)\b/g);
      if (matches) {
        // Maybe pick the largest?
        const nums = matches.map(m => parseFloat(m)).filter(n => n > 50 && n < 3000);
        if (nums.length > 0) {
          result.thb = Math.max(...nums);
        }
      }
    }

    // Odometer: A large integer (e.g., 1000 - 999999)
    // Sometimes written down manually or captured in app if screenshot
    // Just looking for a 4-6 digit integer without decimals around it
    // Often it might not be on the receipt itself unless handwritten
    const odoMatch = text.match(/(?:ODO|MILEAGE|KM)[\s:.-]*([1-9]\d{2,5})\b/i);
    if (odoMatch) {
      result.odo = parseInt(odoMatch[1], 10);
    } else {
      // Find possible odo
      const matches = text.match(/\b([1-9]\d{3,5})\b/g);
      if (matches) {
        const nums = matches.map(m => parseInt(m, 10)).filter(n => n > 1000 && n < 200000);
        if (nums.length > 0) {
           // just take the largest integer that might be an odo
           result.odo = Math.max(...nums);
        }
      }
    }

    // Station name guess (capitalized words near the top)
    // Receipts usually have the station name in the first few lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const topLines = lines.slice(0, 3);
      for (const line of topLines) {
        if (line.match(/[A-Z]{3,}/)) { // Looks like a brand name
          // Extract something that looks like PTT, SHELL, BANGCHAK, ESSO, CALTEX
          const brands = ['PTT', 'SHELL', 'BANGCHAK', 'ESSO', 'CALTEX', 'SUSCO', 'PT'];
          for (const brand of brands) {
             if (line.toUpperCase().includes(brand)) {
                result.station = brand;
                break;
             }
          }
          if (result.station) break;
          // Or just take the first capitalized line
          result.station = line.substring(0, 20); // truncate
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error parsing receipt:', err);
  }

  return result;
}
