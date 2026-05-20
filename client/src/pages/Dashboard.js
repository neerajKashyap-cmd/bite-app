import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeals } from '../context/MealContext';
import NutritionRing from '../components/NutritionRing';
import MealCard from '../components/MealCard';
import './Dashboard.css';

const Dashboard = () => {
  const { meals, todayTotals, goals, loading, selectedDate, setSelectedDate } = useMeals();
  const navigate = useNavigate();

  const caloriesPct = Math.round((todayTotals.calories / goals.calories) * 100);
  const remaining = Math.max(0, goals.calories - todayTotals.calories);

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  // Group meals by type
  const mealGroups = {
    breakfast: meals.filter(m => m.meal_type === 'breakfast'),
    lunch: meals.filter(m => m.meal_type === 'lunch'),
    dinner: meals.filter(m => m.meal_type === 'dinner'),
    snack: meals.filter(m => m.meal_type === 'snack'),
  };

  return (
    <div className="dashboard">
      {/* Date selector */}
      <div className="date-bar">
        <button
          className="date-nav-btn"
          onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().split('T')[0]);
          }}
        >←</button>
        <div className="date-display">
          <span className="date-main">
            {isToday ? 'Today' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input-hidden"
          />
        </div>
        <button
          className="date-nav-btn"
          onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            setSelectedDate(d.toISOString().split('T')[0]);
          }}
          disabled={isToday}
        >→</button>
      </div>

      {/* Calorie summary card */}
      <div className="calorie-card card">
        <div className="calorie-main">
          <div className="calorie-circle" style={{ '--pct': `${caloriesPct}%` }}>
            <div className="calorie-inner">
              <span className="calorie-num">{todayTotals.calories}</span>
              <span className="calorie-label">consumed</span>
            </div>
          </div>
          <div className="calorie-stats">
            <div className="calorie-stat">
              <span className="stat-value">{goals.calories}</span>
              <span className="stat-label">🎯 Goal</span>
            </div>
            <div className="calorie-divider" />
            <div className="calorie-stat">
              <span className="stat-value" style={{ color: remaining === 0 ? 'var(--red)' : 'var(--green-dark)' }}>
                {remaining}
              </span>
              <span className="stat-label">⚡ Remaining</span>
            </div>
            <div className="calorie-divider" />
            <div className="calorie-stat">
              <span className="stat-value">{meals.length}</span>
              <span className="stat-label">🍽️ Meals</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(caloriesPct, 100)}%`,
                background: caloriesPct > 100 ? 'var(--red)' : caloriesPct > 80 ? 'var(--orange)' : 'var(--green)'
              }}
            />
          </div>
          <span className="progress-label">{caloriesPct}%</span>
        </div>

        {/* Macro rings */}
        <div className="macro-rings">
          <NutritionRing value={todayTotals.protein} goal={goals.protein} label="Protein" color="#3b82f6" />
          <NutritionRing value={todayTotals.carbs} goal={goals.carbs} label="Carbs" color="#22c55e" />
          <NutritionRing value={todayTotals.fats} goal={goals.fats} label="Fats" color="#f97316" />
        </div>
      </div>

      {/* Meals list */}
      <div className="meals-section">
        <div className="section-header">
          <h2 className="section-title">Meals logged</h2>
          <button className="btn btn-primary" onClick={() => navigate('/log')}>
            + Log Meal
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">🥗</div>
            <p>No meals logged yet</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/log')}
              style={{ marginTop: '16px' }}
            >
              Log your first meal
            </button>
          </div>
        ) : (
          <div className="meals-list">
            {Object.entries(mealGroups).map(([type, groupMeals]) =>
              groupMeals.length > 0 ? (
                <div key={type} className="meal-group">
                  <div className="meal-group-header">
                    <span className="meal-group-title">{type}</span>
                    <span className="meal-group-cal">
                      {groupMeals.reduce((s, m) => s + m.calories, 0)} kcal
                    </span>
                  </div>
                  {groupMeals.map(meal => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
