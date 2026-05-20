import React from 'react';
import { useMeals } from '../context/MealContext';
import toast from 'react-hot-toast';
import './MealCard.css';

const mealTypeColors = {
  breakfast: { bg: '#fef3c7', color: '#92400e', emoji: '🌅' },
  lunch: { bg: '#dbeafe', color: '#1e40af', emoji: '☀️' },
  dinner: { bg: '#ede9fe', color: '#5b21b6', emoji: '🌙' },
  snack: { bg: '#dcfce7', color: '#166534', emoji: '🍪' },
};

const MealCard = ({ meal }) => {
  const { deleteMeal } = useMeals();
  const type = mealTypeColors[meal.meal_type] || mealTypeColors.snack;

  const handleDelete = async () => {
    try {
      await deleteMeal(meal.id);
      toast.success('Meal removed');
    } catch (err) {
      toast.error('Failed to delete meal');
    }
  };

  return (
    <div className="meal-card">
      <div className="meal-card-left">
        <div className="meal-type-badge" style={{ background: type.bg, color: type.color }}>
          {type.emoji} {meal.meal_type}
        </div>
        <div className="meal-name">{meal.name}</div>
        {meal.servings > 1 && (
          <div className="meal-servings">× {meal.servings} servings</div>
        )}
      </div>
      <div className="meal-card-right">
        <div className="meal-macros">
          <span className="macro-pill calories">{meal.calories} kcal</span>
          <span className="macro-pill protein">P {meal.protein}g</span>
          <span className="macro-pill fats">F {meal.fats}g</span>
          <span className="macro-pill carbs">C {meal.carbs}g</span>
        </div>
        <button className="delete-btn" onClick={handleDelete} title="Remove meal">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default MealCard;
