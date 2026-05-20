import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MealProvider } from './context/MealContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <MealProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogMeal />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif'
              }
            }}
          />
        </div>
      </Router>
    </MealProvider>
  );
}

export default App;
