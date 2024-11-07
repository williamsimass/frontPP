import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login'; // Login component
import Home from './pages/Home'; // Main home page component

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} /> {/* Redirects to login */}
      <Route path="/login" element={<Login />} /> {/* Login page */}
      <Route path="/home" element={<Home />} /> {/* Main page */}
      {/* Consider renaming or removing /full route if not used */}
      <Route path="/full" element={<Home />} /> {/* Possibly redundant */}
    </Routes>
  );
};

export default App;
