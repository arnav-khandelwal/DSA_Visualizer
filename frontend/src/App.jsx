import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Components
import Header from './components/Header.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import SortingVisualizer from './visualizers/SortingVisualizer.jsx';
import SearchingVisualizer from './visualizers/SearchingVisualizer.jsx';
import GraphVisualizer from './visualizers/GraphVisualizer.jsx';
import DataStructureVisualizer from './visualizers/DataStructureVisualizer.jsx';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          <Header />
          <div className="content-container">
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sorting" element={<SortingVisualizer />} />
                <Route path="/searching" element={<SearchingVisualizer />} />
                <Route path="/graph" element={<GraphVisualizer />} />
                <Route path="/data-structures" element={<DataStructureVisualizer />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;