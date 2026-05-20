const express = require('express');
const router = express.Router();
const axios = require('axios');

// Sample food database (used as fallback)
const sampleFoods = [
  { id: 1, name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.4, serving: '1 medium (182g)' },
  { id: 2, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3.1, serving: '1 medium (118g)' },
  { id: 3, name: 'Chicken Breast (cooked)', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, serving: '100g' },
  { id: 4, name: 'Brown Rice (cooked)', calories: 216, protein: 5, carbs: 45, fats: 1.8, fiber: 3.5, serving: '1 cup (195g)' },
  { id: 5, name: 'Egg (boiled)', calories: 77, protein: 6.3, carbs: 0.6, fats: 5.3, fiber: 0, serving: '1 large (50g)' },
  { id: 6, name: 'Almonds', calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, serving: '28g (23 nuts)' },
  { id: 7, name: 'Oatmeal (cooked)', calories: 147, protein: 5.4, carbs: 25, fats: 2.5, fiber: 4, serving: '1 cup (234g)' },
  { id: 8, name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fats: 0.7, fiber: 0, serving: '170g' },
  { id: 9, name: 'Salmon (cooked)', calories: 208, protein: 28, carbs: 0, fats: 10, fiber: 0, serving: '100g' },
  { id: 10, name: 'Broccoli (cooked)', calories: 55, protein: 3.7, carbs: 11, fats: 0.6, fiber: 5.1, serving: '1 cup (156g)' },
  { id: 11, name: 'Sweet Potato (baked)', calories: 103, protein: 2.3, carbs: 24, fats: 0.1, fiber: 3.8, serving: '1 medium (130g)' },
  { id: 12, name: 'Whole Milk', calories: 149, protein: 8, carbs: 12, fats: 8, fiber: 0, serving: '1 cup (244ml)' },
  { id: 13, name: 'White Rice (cooked)', calories: 200, protein: 4.2, carbs: 45, fats: 0.4, fiber: 0.6, serving: '1 cup (186g)' },
  { id: 14, name: 'Dal (Lentils cooked)', calories: 230, protein: 17, carbs: 40, fats: 0.8, fiber: 15, serving: '1 cup (198g)' },
  { id: 15, name: 'Roti (Wheat chapati)', calories: 120, protein: 3.1, carbs: 22, fats: 2.8, fiber: 2, serving: '1 piece (40g)' },
  { id: 16, name: 'Paneer', calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, serving: '100g' },
  { id: 17, name: 'Samosa (fried)', calories: 308, protein: 5, carbs: 36, fats: 17, fiber: 3, serving: '1 piece (100g)' },
  { id: 18, name: 'Lassi (salted)', calories: 70, protein: 3.5, carbs: 7, fats: 3, fiber: 0, serving: '200ml' },
  { id: 19, name: 'Peanut Butter', calories: 188, protein: 8, carbs: 6, fats: 16, fiber: 1.9, serving: '2 tbsp (32g)' },
  { id: 20, name: 'Orange', calories: 62, protein: 1.2, carbs: 15, fats: 0.2, fiber: 3.1, serving: '1 medium (131g)' },
];

// GET /api/nutrition/search?q=chicken
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  // Search local database
  const query = q.toLowerCase();
  const results = sampleFoods.filter(food =>
    food.name.toLowerCase().includes(query)
  );

  // Also try Open Food Facts search
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl`,
      {
        params: {
          search_terms: q,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 5,
          fields: 'product_name,brands,nutriments,serving_size,image_url'
        },
        timeout: 5000
      }
    );

    if (response.data.products && response.data.products.length > 0) {
      const apiResults = response.data.products
        .filter(p => p.product_name && p.nutriments)
        .slice(0, 5)
        .map((p, idx) => ({
          id: `api_${idx}`,
          name: p.product_name,
          brand: p.brands || '',
          image: p.image_url || '',
          serving: p.serving_size || '100g',
          calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
          protein: parseFloat((p.nutriments.proteins_100g || 0).toFixed(1)),
          carbs: parseFloat((p.nutriments.carbohydrates_100g || 0).toFixed(1)),
          fats: parseFloat((p.nutriments.fat_100g || 0).toFixed(1)),
          fiber: parseFloat((p.nutriments.fiber_100g || 0).toFixed(1)),
          source: 'Open Food Facts'
        }));

      return res.json({
        success: true,
        data: [...results.map(r => ({ ...r, source: 'local' })), ...apiResults]
      });
    }
  } catch (err) {
    // API failed - return local results only
    console.log('External API unavailable, using local data');
  }

  res.json({
    success: true,
    data: results.map(r => ({ ...r, source: 'local' }))
  });
});

// GET /api/nutrition/all - Get all foods from local DB
router.get('/all', (req, res) => {
  res.json({ success: true, data: sampleFoods });
});

module.exports = router;
