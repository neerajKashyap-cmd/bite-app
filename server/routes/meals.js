const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Simple file-based storage (no database needed for this project)
const DATA_FILE = path.join(__dirname, '../data/meals.json');

// Initialize data file
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const readMeals = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeMeals = (meals) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(meals, null, 2));
};

// GET /api/meals - Get all meals (optionally filter by date)
router.get('/', (req, res) => {
  const { date } = req.query;
  let meals = readMeals();

  if (date) {
    meals = meals.filter(m => m.date === date);
  }

  // Calculate daily totals
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fats: acc.fats + (meal.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  res.json({
    success: true,
    data: meals,
    totals: {
      calories: Math.round(totals.calories),
      protein: parseFloat(totals.protein.toFixed(1)),
      carbs: parseFloat(totals.carbs.toFixed(1)),
      fats: parseFloat(totals.fats.toFixed(1))
    }
  });
});

// POST /api/meals - Log a new meal
router.post('/', (req, res) => {
  const { name, calories, protein, carbs, fats, fiber, meal_type, servings, date } = req.body;

  if (!name || calories === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name and calories are required'
    });
  }

  const meals = readMeals();
  const newMeal = {
    id: Date.now().toString(),
    name,
    calories: Math.round(calories * (servings || 1)),
    protein: parseFloat(((protein || 0) * (servings || 1)).toFixed(1)),
    carbs: parseFloat(((carbs || 0) * (servings || 1)).toFixed(1)),
    fats: parseFloat(((fats || 0) * (servings || 1)).toFixed(1)),
    fiber: parseFloat(((fiber || 0) * (servings || 1)).toFixed(1)),
    meal_type: meal_type || 'snack',
    servings: servings || 1,
    date: date || new Date().toISOString().split('T')[0],
    logged_at: new Date().toISOString()
  };

  meals.push(newMeal);
  writeMeals(meals);

  res.status(201).json({ success: true, data: newMeal });
});

// DELETE /api/meals/:id - Remove a meal
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let meals = readMeals();
  const initialLength = meals.length;
  meals = meals.filter(m => m.id !== id);

  if (meals.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Meal not found' });
  }

  writeMeals(meals);
  res.json({ success: true, message: 'Meal deleted successfully' });
});

// GET /api/meals/summary/week - Weekly nutrition summary
router.get('/summary/week', (req, res) => {
  const meals = readMeals();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = meals.filter(m => m.date === dateStr);

    weeklyData.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      protein: parseFloat(dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(1)),
      carbs: parseFloat(dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0).toFixed(1)),
      fats: parseFloat(dayMeals.reduce((sum, m) => sum + (m.fats || 0), 0).toFixed(1)),
      meal_count: dayMeals.length
    });
  }

  res.json({ success: true, data: weeklyData });
});

module.exports = router;
