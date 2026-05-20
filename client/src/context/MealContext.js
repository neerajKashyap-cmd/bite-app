import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MealContext = createContext();

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) throw new Error('useMeals must be used within MealProvider');
  return context;
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Daily goals
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65
  };

  const fetchMeals = useCallback(async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/meals?date=${date || selectedDate}`);
      setMeals(res.data.data);
      setTodayTotals(res.data.totals);
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const logMeal = async (mealData) => {
    const res = await axios.post('/api/meals', {
      ...mealData,
      date: selectedDate
    });
    await fetchMeals(selectedDate);
    return res.data.data;
  };

  const deleteMeal = async (id) => {
    await axios.delete(`/api/meals/${id}`);
    await fetchMeals(selectedDate);
  };

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate, fetchMeals]);

  return (
    <MealContext.Provider value={{
      meals,
      todayTotals,
      goals,
      loading,
      selectedDate,
      setSelectedDate,
      logMeal,
      deleteMeal,
      fetchMeals
    }}>
      {children}
    </MealContext.Provider>
  );
};
