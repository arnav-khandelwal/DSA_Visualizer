import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Stack,
  Divider,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShuffleIcon from '@mui/icons-material/Shuffle';

// Initial hardcoded graph
const INITIAL_GRAPH = {
  nodes: [
    { id: 0, state: 'unvisited' },
    { id: 1, state: 'unvisited' },
    { id: 2, state: 'unvisited' },
    { id: 3, state: 'unvisited' },
    { id: 4, state: 'unvisited' },
    { id: 5, state: 'unvisited' }
  ],
  edges: [
    { source: 0, target: 1, weight: 4 },
    { source: 0, target: 2, weight: 2 },
    { source: 1, target: 2, weight: 5 },
    { source: 1, target: 3, weight: 10 },
    { source: 2, target: 4, weight: 3 },
    { source: 3, target: 5, weight: 7 },
    { source: 4, target: 3, weight: 4 },
    { source: 4, target: 5, weight: 6 }
  ],
  status: 'Initial graph'
};

const GraphVisualizer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const algorithmParam = queryParams.get('algorithm');

  const [algorithm, setAlgorithm] = useState(algorithmParam || 'bfs');
  const [currentGraph, setCurrentGraph] = useState(INITIAL_GRAPH);
  const [graphData, setGraphData] = useState(INITIAL_GRAPH);
  const [startNode, setStartNode] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms between steps
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize graph visualization on component mount
    setGraphData(currentGraph);
    setTimeout(renderGraph, 0);
    
    // Clear any existing interval when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentGraph]);

  useEffect(() => {
    // Update algorithm from URL params
    if (algorithmParam) {
      setAlgorithm(algorithmParam);
    }
  }, [algorithmParam]);

  useEffect(() => {
    // Auto-play/pause logic
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep >= steps.length - 1) {
            setIsPlaying(false);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, speed, steps.length]);

  // Format graph data for visualization
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setGraphData(steps[currentStep]);
      renderGraph();
    }
  }, [steps, currentStep]);

  // Render the graph on canvas
  const renderGraph = () => {
    if (!graphData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Position nodes in a circle
    const radius = Math.min(width, height) * 0.35;
    const center = { x: width / 2, y: height / 2 };
    const nodePositions = {};
    
    // Calculate node positions
    graphData.nodes.forEach((node, i) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      nodePositions[node.id] = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
        state: node.state
      };
    });
    
    // Draw edges
    graphData.edges.forEach(edge => {
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      
      if (sourcePos && targetPos) {
        // Set edge style based on its state (highlighted or not)
        if (edge.state === 'highlighted') {
          ctx.strokeStyle = '#4caf50'; // Highlighted edge (for MST)
          ctx.lineWidth = 3;
        } else if (edge.state === 'considered') {
          ctx.strokeStyle = '#f50057'; // Currently considered edge
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#999'; // Normal edge
          ctx.lineWidth = 1;
        }
        
        // Draw the edge
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
        
        // Draw edge weight
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(edge.weight, midX, midY);
      }
    });
    
    // Draw nodes
    Object.entries(nodePositions).forEach(([id, pos]) => {
      // Node color based on state
      if (pos.state === 'current') {
        ctx.fillStyle = '#f50057'; // Current node - red
      } else if (pos.state === 'visited') {
        ctx.fillStyle = '#4caf50'; // Visited node - green
      } else if (pos.state === 'included') {  
        ctx.fillStyle = '#ff9800'; // Included in MST - orange
      } else {
        ctx.fillStyle = '#3f51b5'; // Unvisited node - blue
      }
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw node ID
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, pos.x, pos.y);
    });
  };

  const generateRandomGraph = () => {
    // Create a random graph with 5-10 nodes
    const nodeCount = Math.floor(Math.random() * 6) + 5;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: i, state: 'unvisited' }));
    
    // Calculate minimum and maximum number of edges
    const minEdges = nodeCount; // At least n edges to ensure connectivity
    const maxEdges = Math.floor(nodeCount * (nodeCount - 1) / 2); // Maximum possible edges for undirected graph
    
    // Choose a random number of edges between min and max
    const targetEdgeCount = Math.floor(Math.random() * (maxEdges - minEdges + 1)) + minEdges;
    
    // First create a spanning tree to ensure connectivity
    const edges = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      const weight = Math.floor(Math.random() * 10) + 1;
      edges.push({ source: i, target: i + 1, weight });
    }
    
    // Add the final edge to complete the cycle (optional but ensures better connectivity)
    edges.push({ source: nodeCount - 1, target: 0, weight: Math.floor(Math.random() * 10) + 1 });
    
    // Track all possible edges that could be added
    const possibleEdges = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // Skip edges that are already in the spanning tree
        if (!edges.some(e => 
          (e.source === i && e.target === j) || 
          (e.source === j && e.target === i))) {
          possibleEdges.push({ source: i, target: j });
        }
      }
    }
    
    // Shuffle the possible edges
    for (let i = possibleEdges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleEdges[i], possibleEdges[j]] = [possibleEdges[j], possibleEdges[i]];
    }
    
    // Add random edges until we reach the target count
    while (edges.length < targetEdgeCount && possibleEdges.length > 0) {
      const edge = possibleEdges.pop();
      const weight = Math.floor(Math.random() * 10) + 1;
      edges.push({ ...edge, weight });
    }
    
    // Create and set the new graph
    const newGraph = { 
      nodes, 
      edges, 
      status: `Random graph generated with ${nodes.length} nodes and ${edges.length} edges` 
    };
    
    setCurrentGraph(newGraph);
    setGraphData(newGraph);
    setStartNode(0);
    
    // Reset steps
    setSteps([]);
    setCurrentStep(0);
    
    // Ensure the canvas is updated
    setTimeout(() => renderGraph(), 0);
  };
  const resetToInitialGraph = () => {
    setCurrentGraph(INITIAL_GRAPH);
    setGraphData(INITIAL_GRAPH);
    setStartNode(0);
    setSteps([]);
    setCurrentStep(0);
    setTimeout(renderGraph, 0);
  };

  // Simulated visualization logic for demonstration
  const simulateBFS = (startNode) => {
    const steps = [];
    const nodes = [...currentGraph.nodes];
    const edges = [...currentGraph.edges];
    
    // Create adjacency list from edges
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
    });
    
    // Initial state
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting BFS from node ${startNode}`
    });
    
    // Visited set
    const visited = new Set();
    visited.add(startNode);
    
    // Queue for BFS
    const queue = [startNode];
    
    // Current state with start node marked as current
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: node.id === startNode ? 'current' : 'unvisited'
      })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting with node ${startNode}`
    });
    
    // Perform BFS
    while (queue.length > 0) {
      const current = queue.shift();
      
      // Mark current as visited
      steps.push({
        nodes: nodes.map(node => ({
          ...node,
          state: node.id === current ? 'current' : 
                 visited.has(node.id) ? 'visited' : 'unvisited'
        })),
        edges: edges.map(edge => ({ ...edge })),
        status: `Processing node ${current}`
      });
      
      // Process neighbors
      for (const neighbor of adjList[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          
          // Show discovery of neighbor
          steps.push({
            nodes: nodes.map(node => ({
              ...node,
              state: node.id === neighbor ? 'current' : 
                     node.id === current ? 'visited' : 
                     visited.has(node.id) ? 'visited' : 'unvisited'
            })),
            edges: edges.map(edge => {
              if (edge.source === current && edge.target === neighbor) {
                return { ...edge, state: 'highlighted' };
              }
              return { ...edge };
            }),
            status: `Discovered node ${neighbor} from ${current}`
          });
        }
      }
    }
    
    // Final state
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: visited.has(node.id) ? 'visited' : 'unvisited'
      })),
      edges: edges.map(edge => ({ ...edge })),
      status: 'BFS complete'
    });
    
    return steps;
  };
  
  const simulateDFS = (startNode) => {
    const steps = [];
    const nodes = [...currentGraph.nodes];
    const edges = [...currentGraph.edges];
    
    // Create adjacency list from edges
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push(edge.target);
    });
    
    // Initial state
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting DFS from node ${startNode}`
    });
    
    // Visited set
    const visited = new Set();
    
    // Function for recursive DFS
    const dfsRecursive = (node) => {
      // Mark as current and visited
      visited.add(node);
      
      steps.push({
        nodes: nodes.map(n => ({
          ...n,
          state: n.id === node ? 'current' : 
                 visited.has(n.id) ? 'visited' : 'unvisited'
        })),
        edges: edges.map(edge => ({ ...edge })),
        status: `Visiting node ${node}`
      });
      
      // Process neighbors
      for (const neighbor of adjList[node]) {
        if (!visited.has(neighbor)) {
          steps.push({
            nodes: nodes.map(n => ({
              ...n,
              state: n.id === neighbor ? 'current' : 
                     n.id === node ? 'visited' : 
                     visited.has(n.id) ? 'visited' : 'unvisited'
            })),
            edges: edges.map(edge => {
              if (edge.source === node && edge.target === neighbor) {
                return { ...edge, state: 'highlighted' };
              }
              return { ...edge };
            }),
            status: `Exploring edge from ${node} to ${neighbor}`
          });
          
          dfsRecursive(neighbor);
        }
      }
    };
    
    // Start DFS
    dfsRecursive(startNode);
    
    // Final state
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: visited.has(node.id) ? 'visited' : 'unvisited'
      })),
      edges: edges.map(edge => ({ ...edge })),
      status: 'DFS complete'
    });
    
    return steps;
  };
  
  const simulateDijkstra = (startNode) => {
    const steps = [];
    const nodes = [...currentGraph.nodes];
    const edges = [...currentGraph.edges];
    
    // Create adjacency list with weights
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      adjList[edge.source].push({ node: edge.target, weight: edge.weight });
    });
    
    // Initial state
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting Dijkstra's algorithm from node ${startNode}`
    });
    
    // Distance array
    const distances = Array(nodes.length).fill(Infinity);
    distances[startNode] = 0;
    
    // Set to keep track of visited nodes
    const visited = new Set();
    
    // Priority queue (simplified)
    const queue = [{ node: startNode, distance: 0 }];
    
    while (queue.length > 0) {
      // Sort to get minimum distance node
      queue.sort((a, b) => a.distance - b.distance);
      
      const { node: current, distance } = queue.shift();
      
      // Skip if already processed
      if (visited.has(current)) continue;
      
      // Mark as visited
      visited.add(current);
      
      // Update step
      steps.push({
        nodes: nodes.map(node => ({
          ...node,
          state: node.id === current ? 'current' : 
                 visited.has(node.id) ? 'visited' : 'unvisited'
        })),
        edges: edges.map(edge => ({ ...edge })),
        status: `Processing node ${current} with distance ${distance}`
      });
      
      // Process neighbors
      for (const { node: neighbor, weight } of adjList[current]) {
        if (!visited.has(neighbor)) {
          const newDistance = distances[current] + weight;
          
          // If we found a better path
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            queue.push({ node: neighbor, distance: newDistance });
            
            // Update step
            steps.push({
              nodes: nodes.map(node => ({
                ...node,
                state: node.id === neighbor ? 'current' : 
                       node.id === current ? 'visited' : 
                       visited.has(node.id) ? 'visited' : 'unvisited'
              })),
              edges: edges.map(edge => {
                if (edge.source === current && edge.target === neighbor) {
                  return { ...edge, state: 'highlighted' };
                }
                return { ...edge };
              }),
              status: `Updated distance to node ${neighbor} = ${newDistance}`
            });
          }
        }
      }
    }
    
    // Final state
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: visited.has(node.id) ? 'visited' : 'unvisited'
      })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Dijkstra's algorithm complete. Final distances: ${distances.map((d, i) => `${i}(${d === Infinity ? '∞' : d})`).join(', ')}`
    });
    
    return steps;
  };
  
  const simulateKruskal = () => {
    const steps = [];
    const nodes = [...currentGraph.nodes];
    const edges = [...currentGraph.edges];
    
    // Initial state
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting Kruskal's MST algorithm`
    });
    
    // Sort edges by weight (ascending)
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    
    // Disjoint set for cycle detection
    const parent = {};
    nodes.forEach(node => {
      parent[node.id] = node.id;
    });
    
    // Find root of a set
    const find = (i) => {
      if (parent[i] !== i) {
        parent[i] = find(parent[i]);
      }
      return parent[i];
    };
    
    // Union of two sets
    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      parent[rootI] = rootJ;
    };
    
    // MST result
    const mstEdges = [];
    let totalWeight = 0;
    
    // Process edges
    for (const edge of sortedEdges) {
      const { source, target, weight } = edge;
      
      // Add step showing edge consideration
      steps.push({
        nodes: nodes.map(node => ({
          ...node,
          state: node.id === source || node.id === target ? 'current' : 
                 mstEdges.some(e => e.source === node.id || e.target === node.id) ? 'included' : 'unvisited'
        })),
        edges: edges.map(e => {
          if (e === edge) {
            return { ...e, state: 'considered' };
          } else if (mstEdges.includes(e)) {
            return { ...e, state: 'highlighted' };
          }
          return { ...e };
        }),
        status: `Considering edge ${source}-${target} with weight ${weight}`
      });
      
      // Check if adding this edge creates a cycle
      const rootSource = find(source);
      const rootTarget = find(target);
      
      if (rootSource !== rootTarget) {
        // Add to MST
        mstEdges.push(edge);
        totalWeight += weight;
        union(source, target);
        
        // Add step showing edge addition
        steps.push({
          nodes: nodes.map(node => ({
            ...node,
            state: node.id === source || node.id === target ? 'included' : 
                   mstEdges.some(e => e.source === node.id || e.target === node.id) ? 'included' : 'unvisited'
          })),
          edges: edges.map(e => {
            if (mstEdges.includes(e)) {
              return { ...e, state: 'highlighted' };
            }
            return { ...e };
          }),
          status: `Added edge ${source}-${target} to MST (weight: ${weight}, total: ${totalWeight})`
        });
      } else {
        // Add step showing edge rejection (would create cycle)
        steps.push({
          nodes: nodes.map(node => ({
            ...node,
            state: node.id === source || node.id === target ? 'current' : 
                   mstEdges.some(e => e.source === node.id || e.target === node.id) ? 'included' : 'unvisited'
          })),
          edges: edges.map(e => {
            if (e === edge) {
              return { ...e, state: 'considered' };
            } else if (mstEdges.includes(e)) {
              return { ...e, state: 'highlighted' };
            }
            return { ...e };
          }),
          status: `Rejected edge ${source}-${target} - would create a cycle`
        });
      }
    }
    
    // Final state
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: mstEdges.some(e => e.source === node.id || e.target === node.id) ? 'included' : 'unvisited'
      })),
      edges: edges.map(e => {
        if (mstEdges.includes(e)) {
          return { ...e, state: 'highlighted' };
        }
        return { ...e };
      }),
      status: `Kruskal's MST algorithm complete. Total MST weight: ${totalWeight}`
    });
    
    return steps;
  };
  
  const simulatePrim = (startNode) => {
    const steps = [];
    const nodes = [...currentGraph.nodes];
    const edges = [...currentGraph.edges];
    
    // Initial state
    steps.push({
      nodes: nodes.map(node => ({ ...node })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting Prim's MST algorithm from node ${startNode}`
    });
    
    // Create adjacency list with weights
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    // Create undirected graph representation
    edges.forEach(edge => {
      adjList[edge.source].push({ node: edge.target, weight: edge.weight, originalEdge: edge });
      // For Prim's, we need to consider the graph as undirected
      if (!adjList[edge.target].some(e => e.node === edge.source)) {
        adjList[edge.target].push({ node: edge.source, weight: edge.weight, originalEdge: edge });
      }
    });
    
    // Set of vertices included in MST
    const included = new Set([startNode]);
    
    // Set of edges in the MST
    const mstEdges = [];
    let totalWeight = 0;
    
    // Mark start node
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: node.id === startNode ? 'included' : 'unvisited'
      })),
      edges: edges.map(edge => ({ ...edge })),
      status: `Starting from node ${startNode}`
    });
    
    // Run until all nodes are included
    while (included.size < nodes.length) {
      let nextEdge = null;
      let minWeight = Infinity;
      let fromNode = null;
      let toNode = null;
      
      // Find the minimum weight edge from included to non-included vertices
      for (const u of included) {
        for (const { node: v, weight, originalEdge } of adjList[u]) {
          if (!included.has(v) && weight < minWeight) {
            minWeight = weight;
            nextEdge = originalEdge;
            fromNode = u;
            toNode = v;
          }
        }
      }
      
      // If no edge found, graph is disconnected
      if (!nextEdge) {
        steps.push({
          nodes: nodes.map(node => ({
            ...node,
            state: included.has(node.id) ? 'included' : 'unvisited'
          })),
          edges: edges.map(e => {
            if (mstEdges.includes(e)) {
              return { ...e, state: 'highlighted' };
            }
            return { ...e };
          }),
          status: `Graph is disconnected. Cannot complete MST.`
        });
        break;
      }
      
      // Show edge being considered
      steps.push({
        nodes: nodes.map(node => ({
          ...node,
          state: node.id === toNode ? 'current' : 
                 included.has(node.id) ? 'included' : 'unvisited'
        })),
        edges: edges.map(e => {
          if (e === nextEdge) {
            return { ...e, state: 'considered' };
          } else if (mstEdges.includes(e)) {
            return { ...e, state: 'highlighted' };
          }
          return { ...e };
        }),
        status: `Considering edge ${fromNode}-${toNode} with weight ${minWeight}`
      });
      
      // Add edge to MST
      mstEdges.push(nextEdge);
      included.add(toNode);
      totalWeight += minWeight;
      
      // Show edge addition
      steps.push({
        nodes: nodes.map(node => ({
          ...node,
          state: included.has(node.id) ? 'included' : 'unvisited'
        })),
        edges: edges.map(e => {
          if (mstEdges.includes(e)) {
            return { ...e, state: 'highlighted' };
          }
          return { ...e };
        }),
        status: `Added edge ${fromNode}-${toNode} to MST (weight: ${minWeight}, total: ${totalWeight})`
      });
    }
    
    // Final state
    steps.push({
      nodes: nodes.map(node => ({
        ...node,
        state: included.has(node.id) ? 'included' : 'unvisited'
      })),
      edges: edges.map(e => {
        if (mstEdges.includes(e)) {
          return { ...e, state: 'highlighted' };
        }
        return { ...e };
      }),
      status: `Prim's MST algorithm complete. Total MST weight: ${totalWeight}`
    });
    
    return steps;
  };

  const visualizeGraph = () => {
    try {
      setError('');
      
      // Simulate algorithm visualization
      let simulatedSteps = [];
      
      if (algorithm === 'bfs') {
        simulatedSteps = simulateBFS(startNode);
      } else if (algorithm === 'dfs') {
        simulatedSteps = simulateDFS(startNode);
      } else if (algorithm === 'dijkstra') {
        simulatedSteps = simulateDijkstra(startNode);
      } else if (algorithm === 'kruskal') {
        simulatedSteps = simulateKruskal();
      } else if (algorithm === 'prim') {
        simulatedSteps = simulatePrim(startNode);
      }
      
      setSteps(simulatedSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      
    } catch (error) {
      console.error('Error visualizing graph algorithm:', error);
      setError('Error visualizing graph algorithm');
    }
  };

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (_, newValue) => {
    setSpeed(1000 - newValue); // Invert so higher value = faster
  };

  const handleStartNodeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value < currentGraph.nodes.length) {
      setStartNode(value);
    }
  };

  const getAlgorithmInfo = () => {
    switch (algorithm) {
      case 'bfs':
        return {
          name: 'Breadth-First Search',
          description: 'Explores all the neighbors at the present depth prior to moving on to nodes at the next depth level.',
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        };
      case 'dfs':
        return {
          name: 'Depth-First Search',
          description: 'Explores as far as possible along each branch before backtracking.',
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        };
      case 'dijkstra':
        return {
          name: 'Dijkstra\'s Algorithm',
          description: 'Finds the shortest paths between nodes in a graph with non-negative edge weights.',
          timeComplexity: 'O(E log V)',
          spaceComplexity: 'O(V)'
        };
      case 'kruskal':
        return {
          name: 'Kruskal\'s Algorithm',
          description: 'Finds a minimum spanning tree for a connected weighted graph by considering edges in ascending order of weight.',
          timeComplexity: 'O(E log E)',
          spaceComplexity: 'O(V)'
        };
      case 'prim':
        return {
          name: 'Prim\'s Algorithm',
          description: 'Finds a minimum spanning tree for a connected weighted graph by growing the tree one edge at a time from a starting vertex.',
          timeComplexity: 'O(E log V)',
          spaceComplexity: 'O(V)'
        };
      default:
        return {
          name: 'Unknown Algorithm',
          description: '',
          timeComplexity: '',
          spaceComplexity: ''
        };
    }
  };

  const algorithmInfo = getAlgorithmInfo();

  // Get current step status/description
  const getCurrentStatus = () => {
    if (!graphData) return '';
    return graphData.status || '';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {algorithmInfo.name} Visualization
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="body1" paragraph>
          {algorithmInfo.description}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Time Complexity
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {algorithmInfo.timeComplexity}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Space Complexity
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {algorithmInfo.spaceComplexity}
            </Typography>
          </Box>
        </Stack>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
              <Select
                labelId="algorithm-select-label"
                value={algorithm}
                label="Algorithm"
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <MenuItem value="bfs">Breadth-First Search</MenuItem>
                <MenuItem value="dfs">Depth-First Search</MenuItem>
                <MenuItem value="dijkstra">Dijkstra's Algorithm</MenuItem>
                <MenuItem value="kruskal">Kruskal's MST</MenuItem>
                <MenuItem value="prim">Prim's MST</MenuItem>
              </Select>
            </FormControl>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Node"
                variant="outlined"
                type="number"
                value={startNode}
                onChange={handleStartNodeChange}
                InputProps={{ 
                  inputProps: { 
                    min: 0, 
                    max: currentGraph.nodes.length - 1 
                  } 
                }}
                disabled={algorithm === 'kruskal'} // Kruskal doesn't need a start node
                sx={{ width: '150px' }}
              />
              
              <Tooltip title="Reset to Default Graph">
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={resetToInitialGraph}
                  sx={{ minWidth: 50, height: 56 }}
                >
                  <RestartAltIcon />
                </Button>
              </Tooltip>
              
              <Tooltip title="Generate Random Graph">
                <Button 
                  variant="contained" 
                  onClick={generateRandomGraph}
                  sx={{ minWidth: 50, height: 56 }}
                >
                  <ShuffleIcon />
                </Button>
              </Tooltip>
            </Stack>
            
            <Box>
              <Typography gutterBottom>Animation Speed</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">Slow</Typography>
                <Slider
                  value={1000 - speed}
                  onChange={handleSpeedChange}
                  min={100}
                  max={900}
                  sx={{ flexGrow: 1 }}
                />
                <Typography variant="body2">Fast</Typography>
              </Stack>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={visualizeGraph}
              startIcon={<PlayArrowIcon />}
            >
              Visualize
            </Button>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Visualization</Typography>
          <Chip 
            label={`Step ${steps.length > 0 ? currentStep + 1 : 0} of ${steps.length}`} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          {getCurrentStatus()}
        </Typography>
        
        <Box sx={{ height: '400px', border: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={handleStepBackward} 
            disabled={currentStep <= 0 || steps.length === 0}
            startIcon={<SkipPreviousIcon />}
          >
            Previous
          </Button>
          
          {isPlaying ? (
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handlePause}
              startIcon={<PauseIcon />}
            >
              Pause
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handlePlay} 
              disabled={steps.length === 0}
              startIcon={<PlayArrowIcon />}
            >
              Play
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            onClick={handleStepForward} 
            disabled={currentStep >= steps.length - 1 || steps.length === 0}
            endIcon={<SkipNextIcon />}
          >
            Next
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleReset} 
            disabled={currentStep === 0 || steps.length === 0}
            startIcon={<RestartAltIcon />}
          >
            Reset
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default GraphVisualizer;