import React from 'react';
import './NutritionRing.css';

const NutritionRing = ({ value, goal, label, color, unit = 'g' }) => {
  const pct = Math.min((value / goal) * 100, 100);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="nutrition-ring">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="40" y="38" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1f2937">
          {value}
        </text>
        <text x="40" y="52" textAnchor="middle" fontSize="9" fill="#9ca3af">
          /{goal}{unit}
        </text>
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
};

export default NutritionRing;
