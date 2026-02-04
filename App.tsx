// Main App with Shared Data Provider
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SharedDataProvider } from './sharedDataContext';
import SmartCampusView from './SmartCampusView';
import LoginScreen from './LoginScreen';
import StudentDetailView from './StudentDetailView';

function App() {
  return (
    <SharedDataProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/dashboard" element={<SmartCampusView />} />
            <Route path="/student/:id" element={<StudentDetailView />} />
          </Routes>
        </div>
      </Router>
    </SharedDataProvider>
  );
}

export default App;
