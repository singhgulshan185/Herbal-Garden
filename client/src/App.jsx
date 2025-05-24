import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'

function App() {
  useEffect(() => {
    console.log('App component mounted');
    // Log environment variables (without revealing sensitive data)
    console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <header className="bg-green-700 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold">Herbal Garden</h1>
            <p className="text-sm">Discover the medicinal properties of plants</p>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        
        <footer className="bg-green-700 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>© {new Date().getFullYear()} Herbal Garden - Identify medicinal plants</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
