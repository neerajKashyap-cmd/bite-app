const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/barcode/:code
// Scan barcode and get nutrition info from Open Food Facts (FREE API)
router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json`
    );

    if (response.data.status === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for this barcode'
      });
    }

    const product = response.data.product;
    const nutriments = product.nutriments || {};

    const nutrition = {
      barcode: code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      image: product.image_url || '',
      serving_size: product.serving_size || '100g',
      calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein: parseFloat((nutriments.proteins_100g || 0).toFixed(1)),
      carbs: parseFloat((nutriments.carbohydrates_100g || 0).toFixed(1)),
      fats: parseFloat((nutriments.fat_100g || 0).toFixed(1)),
      fiber: parseFloat((nutriments.fiber_100g || 0).toFixed(1)),
      sugar: parseFloat((nutriments.sugars_100g || 0).toFixed(1)),
      sodium: parseFloat((nutriments.sodium_100g || 0).toFixed(2))
    };

    res.json({ success: true, data: nutrition });
  } catch (error) {
    console.error('Barcode lookup error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product information'
    });
  }
});

module.exports = router;
