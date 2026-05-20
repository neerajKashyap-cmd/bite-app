import React, { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMeals } from '../context/MealContext';
import { useNavigate } from 'react-router-dom';
import './LogMeal.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const LogMeal = () => {
  const { logMeal } = useMeals();
  const navigate = useNavigate();
  const [tab, setTab] = useState('search'); // 'search' | 'barcode' | 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('lunch');
  const [barcode, setBarcode] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [logging, setLogging] = useState(false);

  // Manual entry state
  const [manual, setManual] = useState({
    name: '', calories: '', protein: '', carbs: '', fats: '', fiber: ''
  });

  const searchFood = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await axios.get(`/api/nutrition/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data.data);
    } catch (err) {
      toast.error('Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => searchFood(val), 400);
  };

  const lookupBarcode = async () => {
    if (!barcode.trim()) { toast.error('Enter a barcode number'); return; }
    setBarcodeLoading(true);
    try {
      const res = await axios.get(`/api/barcode/${barcode.trim()}`);
      setSelected(res.data.data);
      setTab('search');
      toast.success(`Found: ${res.data.data.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Product not found');
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleLog = async () => {
    let mealData;

    if (tab === 'manual') {
      if (!manual.name || !manual.calories) {
        toast.error('Name and calories are required');
        return;
      }
      mealData = {
        name: manual.name,
        calories: parseFloat(manual.calories) || 0,
        protein: parseFloat(manual.protein) || 0,
        carbs: parseFloat(manual.carbs) || 0,
        fats: parseFloat(manual.fats) || 0,
        fiber: parseFloat(manual.fiber) || 0,
        meal_type: mealType,
        servings: 1
      };
    } else {
      if (!selected) { toast.error('Select a food first'); return; }
      mealData = {
        name: selected.name,
        calories: selected.calories,
        protein: selected.protein || 0,
        carbs: selected.carbs || 0,
        fats: selected.fats || 0,
        fiber: selected.fiber || 0,
        meal_type: mealType,
        servings: parseFloat(servings) || 1
      };
    }

    setLogging(true);
    try {
      await logMeal(mealData);
      toast.success('✅ Meal logged!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to log meal');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="log-meal">
      <h1 className="page-title">Log a Meal</h1>

      {/* Tabs */}
      <div className="tabs">
        {[
          { id: 'search', label: '🔍 Search Food' },
          { id: 'barcode', label: '📷 Barcode' },
          { id: 'manual', label: '✏️ Manual Entry' }
        ].map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <div className="tab-content card">
          <input
            className="input"
            placeholder="Search food (e.g. Apple, Dal, Chicken)"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />

          {searching && <div className="loading">Searching...</div>}

          {searchResults.length > 0 && !selected && (
            <div className="search-results">
              {searchResults.map((food, i) => (
                <div
                  key={food.id || i}
                  className="food-result"
                  onClick={() => { setSelected(food); setSearchResults([]); }}
                >
                  <div className="food-result-info">
                    <span className="food-result-name">{food.name}</span>
                    {food.brand && <span className="food-result-brand">{food.brand}</span>}
                  </div>
                  <div className="food-result-macros">
                    <span className="cal-badge">{food.calories} kcal</span>
                    <span className="macro-text">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected && (
            <div className="selected-food">
              <div className="selected-header">
                <div>
                  <div className="selected-name">{selected.name}</div>
                  {selected.brand && <div className="selected-brand">{selected.brand}</div>}
                </div>
                <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setSelected(null)}>Change</button>
              </div>

              <div className="nutrition-grid">
                {[
                  { label: 'Calories', value: Math.round(selected.calories * servings), unit: 'kcal', color: '#f59e0b' },
                  { label: 'Protein', value: ((selected.protein || 0) * servings).toFixed(1), unit: 'g', color: '#3b82f6' },
                  { label: 'Carbs', value: ((selected.carbs || 0) * servings).toFixed(1), unit: 'g', color: '#22c55e' },
                  { label: 'Fats', value: ((selected.fats || 0) * servings).toFixed(1), unit: 'g', color: '#f97316' },
                ].map(n => (
                  <div key={n.label} className="nutrition-item" style={{ borderTop: `3px solid ${n.color}` }}>
                    <span className="nutrition-val">{n.value}</span>
                    <span className="nutrition-unit">{n.unit}</span>
                    <span className="nutrition-lbl">{n.label}</span>
                  </div>
                ))}
              </div>

              <div className="serving-row">
                <label className="form-label">Servings</label>
                <input
                  type="number"
                  className="input"
                  min="0.25"
                  step="0.25"
                  value={servings}
                  onChange={e => setServings(e.target.value)}
                  style={{ maxWidth: '120px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barcode Tab */}
      {tab === 'barcode' && (
        <div className="tab-content card">
          <div className="barcode-section">
            <div className="barcode-icon">📷</div>
            <p className="barcode-hint">Enter the barcode number from the product packaging</p>
            <div className="barcode-input-row">
              <input
                className="input"
                placeholder="e.g. 8901058851084"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                type="number"
                onKeyDown={e => e.key === 'Enter' && lookupBarcode()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={lookupBarcode}
                disabled={barcodeLoading}
              >
                {barcodeLoading ? 'Looking up...' : '🔍 Lookup'}
              </button>
            </div>
            <p className="barcode-tip">
              💡 Try: <code>8901058851084</code> (Maggi) or <code>4006381333931</code> (Nutella)
            </p>
          </div>
        </div>
      )}

      {/* Manual Tab */}
      {tab === 'manual' && (
        <div className="tab-content card">
          <div className="manual-form">
            <div className="form-group">
              <label className="form-label">Food Name *</label>
              <input className="input" placeholder="e.g. Homemade Dal" value={manual.name} onChange={e => setManual(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Calories (kcal) *</label>
                <input className="input" type="number" placeholder="0" value={manual.calories} onChange={e => setManual(p => ({ ...p, calories: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Protein (g)</label>
                <input className="input" type="number" placeholder="0" value={manual.protein} onChange={e => setManual(p => ({ ...p, protein: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Carbs (g)</label>
                <input className="input" type="number" placeholder="0" value={manual.carbs} onChange={e => setManual(p => ({ ...p, carbs: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fats (g)</label>
                <input className="input" type="number" placeholder="0" value={manual.fats} onChange={e => setManual(p => ({ ...p, fats: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal type & Log button */}
      {(selected || tab === 'manual') && (
        <div className="log-footer card">
          <div className="meal-type-selector">
            <label className="form-label">Meal Type</label>
            <div className="meal-type-buttons">
              {MEAL_TYPES.map(type => (
                <button
                  key={type}
                  className={`meal-type-btn ${mealType === type ? 'active' : ''}`}
                  onClick={() => setMealType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary log-btn" onClick={handleLog} disabled={logging}>
            {logging ? 'Logging...' : '✅ Log Meal'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LogMeal;
