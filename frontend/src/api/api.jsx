import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API functions for different algorithm categories
const AlgorithmsAPI = {
  // Get all available algorithms
  getAvailableAlgorithms: () => {
    return api.get('/algorithms');
  },
  
  // Sorting algorithms
  visualizeSort: (algorithm, array) => {
    return api.post('/sort', { algorithm, array: JSON.stringify(array) });
  },
  
  // Searching algorithms
  visualizeSearch: (algorithm, array, target) => {
    return api.post('/search', { algorithm, array: JSON.stringify(array), target });
  },
  
  // Graph algorithms
  visualizeGraph: (algorithm, graph, startNode = 0, endNode = 0) => {
    return api.post('/graph', { algorithm, graph: JSON.stringify(graph), startNode, endNode });
  },
  
  // Data structure operations
  visualizeDataStructure: (structure, operation, params = {}) => {
    return api.post('/data-structure', { structure, operation, ...params });
  },
  
  // Alias for backward compatibility
  dataStructureOperation: (structure, operation, value = null) => {
    const params = value !== null ? { value } : {};
    return api.post('/data-structure', { structure, operation, ...params });
  }
};

export default AlgorithmsAPI;