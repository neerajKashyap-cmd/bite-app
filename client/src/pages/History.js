import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import './History.css';

const History = () => {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('calories');

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const res = await axios.get('/api/meals/summary/week');
        setWeekData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch weekly data');
      } finally {
        setLoading(false);
      }
    };
    fetchWeek();
  }, []);

  const GOAL = { calories: 2000, protein: 150, carbs: 250, fats: 65 };
  const COLORS = {
    calories: '#f59e0b',
    protein: '#3b82f6',
    carbs: '#22c55e',
    fats: '#f97316'
  };

  const avgCalories = weekData.length
    ? Math.round(weekData.reduce((s, d) => s + d.calories, 0) / weekData.length)
    : 0;

  const totalMeals = weekData.reduce((s, d) => s + d.meal_count, 0);

  const bestDay = weekData.length
    ? weekData.reduce((best, d) => {
        const diff = Math.abs(d.calories - GOAL.calories);
        const bestDiff = Math.abs(best.calories - GOAL.calories);
        return diff < bestDiff ? d : best;
      }, weekData[0])
    : null;

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="history-page">
      <h1 className="page-title">Weekly History</h1>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card card">
          <span className="summary-icon">🔥</span>
          <div className="summary-info">
            <span className="summary-val">{avgCalories}</span>
            <span className="summary-lbl">Avg calories/day</span>
          </div>
        </div>
        <div className="summary-card card">
          <span className="summary-icon">🍽️</span>
          <div className="summary-info">
            <span className="summary-val">{totalMeals}</span>
            <span className="summary-lbl">Total meals logged</span>
          </div>
        </div>
        <div className="summary-card card">
          <span className="summary-icon">🏆</span>
          <div className="summary-info">
            <span className="summary-val">{bestDay ? bestDay.day : '-'}</span>
            <span className="summary-lbl">Best day (closest to goal)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-card card">
        <div className="chart-header">
          <h2 className="section-title">7-Day Trend</h2>
          <div className="metric-tabs">
            {['calories', 'protein', 'carbs', 'fats'].map(m => (
              <button
                key={m}
                className={`metric-tab ${activeMetric === m ? 'active' : ''}`}
                style={activeMetric === m ? { background: COLORS[m], color: 'white' } : {}}
                onClick={() => setActiveMetric(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {weekData.every(d => d[activeMetric] === 0) ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>No data yet. Start logging meals!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'DM Sans'
                }}
                formatter={(val) => [
                  `${val} ${activeMetric === 'calories' ? 'kcal' : 'g'}`,
                  activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)
                ]}
              />
              <Bar
                dataKey={activeMetric}
                fill={COLORS[activeMetric]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Goal line indicator */}
        <div className="goal-line-info">
          <span className="goal-dot" style={{ background: COLORS[activeMetric] }} />
          <span className="goal-label">
            Daily goal: {GOAL[activeMetric]}{activeMetric === 'calories' ? ' kcal' : 'g'}
          </span>
        </div>
      </div>

      {/* Day breakdown */}
      <div className="day-breakdown card">
        <h2 className="section-title" style={{ marginBottom: '16px' }}>Daily Breakdown</h2>
        <div className="breakdown-rows">
          {weekData.map((day, i) => (
            <div key={i} className="breakdown-row">
              <div className="breakdown-day">
                <span className="day-name">{day.day}</span>
                <span className="day-date">{new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="breakdown-progress">
                <div className="breakdown-bar-wrapper">
                  <div
                    className="breakdown-bar-fill"
                    style={{
                      width: `${Math.min((day.calories / GOAL.calories) * 100, 100)}%`,
                      background: day.calories > GOAL.calories ? 'var(--red)' : 'var(--green)'
                    }}
                  />
                </div>
                <span className="breakdown-cal">{day.calories} kcal</span>
              </div>
              <div className="breakdown-macros">
                <span>P:{day.protein}g</span>
                <span>C:{day.carbs}g</span>
                <span>F:{day.fats}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
