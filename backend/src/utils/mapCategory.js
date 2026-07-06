export const mapCategory = (cat) => {
  const categoryMap = {
    'Tops': 'top',
    'Dresses': 'dress',
    'Ethnic Wear': 'ethnic-wear',
    'Bottoms': 'bottom'
  };
  return categoryMap[cat] || cat.toLowerCase();
};

export const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const getImageDataUrl = (imageFilename) => {
  if (!imageFilename) {
    return 'https://via.placeholder.com/900x600?text=Product';
  }
  
  // This function will be used in the import script
  // For server-side use, we need to import fs and path
  return null; // Placeholder - actual implementation in import-csv.js
};