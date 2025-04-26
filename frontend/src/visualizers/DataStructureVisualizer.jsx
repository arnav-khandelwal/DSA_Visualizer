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
  Tooltip,
  Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Initial hardcoded data structures
const INITIAL_BST = {
  value: 50,
  highlight: false,
  found: false,
  left: {
    value: 25,
    highlight: false,
    found: false,
    left: {
      value: 10,
      highlight: false,
      found: false,
      left: null,
      right: null
    },
    right: {
      value: 40,
      highlight: false,
      found: false,
      left: null,
      right: null
    }
  },
  right: {
    value: 75,
    highlight: false,
    found: false,
    left: {
      value: 60,
      highlight: false,
      found: false,
      left: null,
      right: null
    },
    right: {
      value: 90,
      highlight: false,
      found: false,
      left: null,
      right: null
    }
  }
};

// Define max heap as a binary tree structure
const INITIAL_HEAP = {
  value: 90,
  highlight: false,
  left: {
    value: 70,
    highlight: false,
    left: {
      value: 30,
      highlight: false,
      left: null,
      right: null
    },
    right: {
      value: 50,
      highlight: false,
      left: null,
      right: null
    }
  },
  right: {
    value: 60,
    highlight: false,
    left: {
      value: 20,
      highlight: false,
      left: null,
      right: null
    },
    right: {
      value: 40,
      highlight: false,
      left: null,
      right: null
    }
  }
};

const DataStructureVisualizer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const structureParam = queryParams.get('structure');

  const [structure, setStructure] = useState(structureParam || 'bst');
  const [operation, setOperation] = useState('insert');
  const [value, setValue] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms between steps
  const [error, setError] = useState('');
  const [currentBST, setCurrentBST] = useState(INITIAL_BST);
  const [currentHeap, setCurrentHeap] = useState(INITIAL_HEAP);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Update structure from URL params
    if (structureParam) {
      setStructure(structureParam);
    }
    
    // Render the initial structure
    if (structure === 'bst') {
      setTimeout(() => renderTree(currentBST), 100);
    } else if (structure === 'heap') {
      setTimeout(() => renderTree(currentHeap, true), 100);
    }
    
    // Clear any existing interval when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [structureParam, structure, currentBST, currentHeap]);

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

  // Format data for visualization when steps change
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      try {
        // Process the step data
        const stepData = steps[currentStep];
        
        if (structure === 'bst') {
          // Process BST data
          if (stepData.tree) {
            renderTree(stepData.tree);
          }
        } else if (structure === 'heap') {
          // Process Heap data
          if (stepData.tree) {
            renderTree(stepData.tree, true);
          }
        }
      } catch (e) {
        console.error('Error processing step data:', e);
      }
    }
  }, [steps, currentStep, structure]);

  // Deep clone function for objects
  const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    const copy = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy;
  };

  // Render tree function for both BST and Heap
  const renderTree = (tree, isHeap = false) => {
    if (!tree || tree === "null" || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up tree drawing parameters
    const nodeRadius = 20;
    const levelHeight = 80;
    
    // Draw tree recursively
    const drawNode = (node, x, y, level = 0, parentX = null, parentY = null) => {
      if (!node || node === "null") return;
      
      // Draw line from parent
      if (parentX !== null && parentY !== null) {
        ctx.beginPath();
        ctx.moveTo(parentX, parentY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      
      // Set node color based on highlight/found status
      if (node.highlight) {
        ctx.fillStyle = isHeap ? '#f50057' : node.found ? '#4caf50' : '#f50057';
      } else {
        ctx.fillStyle = isHeap ? '#ff9800' : '#3f51b5'; // Orange for heap, blue for BST
      }
      
      ctx.fill();
      
      // Draw node value
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value, x, y);
      
      // Calculate child positions
      const spacing = width / Math.pow(2, level + 2);
      
      // Draw left child
      if (node.left && node.left !== "null") {
        drawNode(node.left, x - spacing, y + levelHeight, level + 1, x, y);
      }
      
      // Draw right child
      if (node.right && node.right !== "null") {
        drawNode(node.right, x + spacing, y + levelHeight, level + 1, x, y);
      }
    };
    
    // Start drawing from the root
    drawNode(tree, width / 2, 50);
  };

  const handleValueChange = (e) => {
    setValue(parseInt(e.target.value) || 0);
  };

  const handleClear = () => {
    try {
      // Reset to empty structures
      if (structure === 'bst') {
        setCurrentBST(null);
        // Clear canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } else if (structure === 'heap') {
        setCurrentHeap(null);
        // Clear canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      // Reset steps
      setSteps([]);
      setCurrentStep(0);
      setError('');
      
    } catch (error) {
      console.error('Error clearing data structure:', error);
      setError('Error clearing data structure');
    }
  };

  // Reset to initial data structures
  const resetToInitial = () => {
    if (structure === 'bst') {
      setCurrentBST(deepClone(INITIAL_BST));
      setTimeout(() => renderTree(INITIAL_BST), 0);
    } else if (structure === 'heap') {
      setCurrentHeap(deepClone(INITIAL_HEAP));
      setTimeout(() => renderTree(INITIAL_HEAP, true), 0);
    }
    
    setSteps([]);
    setCurrentStep(0);
    setError('');
  };

  // BST Operations
  const bstInsert = (tree, val, path = [], highlight = false) => {
    // If tree is empty, create a new node
    if (!tree) {
      return {
        value: val,
        highlight: highlight,
        found: false,
        left: null,
        right: null
      };
    }
    
    // Clone the current node to avoid modifying the original
    const newNode = { ...tree };
    
    // If current node should be highlighted
    if (path.length === 0 && highlight) {
      newNode.highlight = true;
    }
    
    // Recursively insert into left or right subtree
    if (val < tree.value) {
      newNode.left = bstInsert(tree.left, val, [...path, 'left'], highlight && path.length === 0);
    } else if (val > tree.value) {
      newNode.right = bstInsert(tree.right, val, [...path, 'right'], highlight && path.length === 0);
    } else {
      // Value already exists, just highlight it
      newNode.highlight = highlight;
    }
    
    return newNode;
  };
  
  const bstSearch = (tree, val, highlight = false) => {
    if (!tree) return null;
    
    // Clone the tree to avoid modifying the original
    const newTree = deepClone(tree);
    
    // Helper function to search and highlight nodes
    const searchHelper = (node, val) => {
      if (!node) return false;
      
      // Highlight the current node
      node.highlight = highlight;
      
      // If found, mark as found
      if (node.value === val) {
        node.found = true;
        return true;
      }
      
      // Search in left or right subtree
      if (val < node.value) {
        return searchHelper(node.left, val);
      } else {
        return searchHelper(node.right, val);
      }
    };
    
    searchHelper(newTree, val);
    return newTree;
  };
  
  const bstDelete = (tree, val) => {
    if (!tree) return null;
    
    // Clone the tree to avoid modifying the original
    const newTree = deepClone(tree);
    
    // Helper function to delete a node
    const deleteNode = (node, val) => {
      if (!node) return null;
      
      // Highlight the current node
      node.highlight = true;
      
      // Find the node to delete
      if (val < node.value) {
        node.left = deleteNode(node.left, val);
        return node;
      } else if (val > node.value) {
        node.right = deleteNode(node.right, val);
        return node;
      }
      
      // Node to delete found
      
      // Case 1: Leaf node
      if (!node.left && !node.right) {
        return null;
      }
      
      // Case 2: Node with only one child
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      
      // Case 3: Node with two children
      // Find inorder successor (smallest in right subtree)
      let successor = node.right;
      while (successor.left) {
        successor = successor.left;
      }
      
      // Replace value with successor's value
      node.value = successor.value;
      
      // Delete the successor
      node.right = deleteNode(node.right, successor.value);
      return node;
    };
    
    return deleteNode(newTree, val);
  };

  // Heap operations using BST-like structure
  // Check if heap property is satisfied (parent >= children)
  const isValidHeap = (node) => {
    if (!node) return true;
    
    let valid = true;
    
    if (node.left) {
      valid = valid && node.value >= node.left.value && isValidHeap(node.left);
    }
    
    if (node.right) {
      valid = valid && node.value >= node.right.value && isValidHeap(node.right);
    }
    
    return valid;
  };
  
  // Get next insertion position in the heap and the path to it
  const getNextHeapPosition = (root) => {
    if (!root) return { path: [], parent: null, side: 'left' };
    
    // BFS to find the first position for insertion
    const queue = [{ node: root, path: [] }];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      
      if (!node.left) {
        return { path, parent: node, side: 'left' };
      }
      
      if (!node.right) {
        return { path, parent: node, side: 'right' };
      }
      
      queue.push({ node: node.left, path: [...path, 'left'] });
      queue.push({ node: node.right, path: [...path, 'right'] });
    }
    
    return { path: [], parent: null, side: 'left' }; // Should never reach here
  };
  
  // Heap insert operation with BST-like structure
  const heapInsert = (heap, val) => {
    if (!heap) {
      return {
        value: val,
        highlight: false,
        left: null,
        right: null
      };
    }
    
    const newHeap = deepClone(heap);
    
    // Find the next position to insert
    const { path, parent, side } = getNextHeapPosition(newHeap);
    
    // Create the new node
    const newNode = {
      value: val,
      highlight: false,
      left: null,
      right: null
    };
    
    // Insert the node
    if (!parent) {
      return newNode; // Empty heap
    }
    
    parent[side] = newNode;
    
    // Bubble up if necessary
    let current = newNode;
    let currentPath = [...path, side];
    
    while (currentPath.length > 0) {
      // Find parent node
      let parentNode = newHeap;
      for (let i = 0; i < currentPath.length - 1; i++) {
        parentNode = parentNode[currentPath[i]];
      }
      
      // If parent value is less than current, swap values
      if (parentNode.value < current.value) {
        const temp = parentNode.value;
        parentNode.value = current.value;
        current.value = temp;
        
        // Move up
        current = parentNode;
        currentPath.pop();
      } else {
        break; // Heap property satisfied
      }
    }
    
    return newHeap;
  };
  
  // Extract max (root) from heap
  const heapExtractMax = (heap) => {
    if (!heap) return null;
    if (!heap.left && !heap.right) return null; // Only one node
    
    const newHeap = deepClone(heap);
    
    // Find the last node using BFS
    const queue = [{ node: newHeap, path: [] }];
    let lastNodePath = [];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      
      if (!node.left && !node.right) {
        lastNodePath = path;
        break;
      }
      
      if (node.right) {
        queue.push({ node: node.right, path: [...path, 'right'] });
      }
      
      if (node.left) {
        queue.push({ node: node.left, path: [...path, 'left'] });
      }
    }
    
    // No last node found (shouldn't happen)
    if (lastNodePath.length === 0) return newHeap;
    
    // Find the last node and its parent
    let lastNode = newHeap;
    let lastParent = null;
    let lastSide = '';
    
    for (let i = 0; i < lastNodePath.length; i++) {
      lastParent = lastNode;
      lastSide = lastNodePath[i];
      lastNode = lastNode[lastNodePath[i]];
    }
    
    // Replace root value with last node value
    const maxValue = newHeap.value;
    newHeap.value = lastNode.value;
    
    // Remove the last node
    if (lastParent) {
      lastParent[lastSide] = null;
    }
    
    // Heapify down from root
    let current = newHeap;
    
    while (true) {
      let largest = current;
      let largestPath = [];
      
      // Check left child
      if (current.left && current.left.value > largest.value) {
        largest = current.left;
        largestPath = ['left'];
      }
      
      // Check right child
      if (current.right && current.right.value > largest.value) {
        largest = current.right;
        largestPath = ['right'];
      }
      
      // If largest is not current, swap and continue
      if (largest !== current) {
        const temp = current.value;
        current.value = largest.value;
        largest.value = temp;
        
        current = largest;
      } else {
        break; // Heap property satisfied
      }
    }
    
    return newHeap;
  };

  // Simulation for BST operations
  const simulateBSTInsert = (val) => {
    const steps = [];
    
    // Step 1: Start with current BST
    steps.push({
      tree: deepClone(currentBST),
      status: `Starting insertion of ${val}`
    });
    
    // Step 2: Highlight search path
    let currentNode = currentBST;
    let path = [];
    
    // If tree is empty, create new root
    if (!currentNode) {
      steps.push({
        tree: {
          value: val,
          highlight: true,
          found: false,
          left: null,
          right: null
        },
        status: `Created new tree with root ${val}`
      });
      
      setCurrentBST({
        value: val,
        highlight: false,
        found: false,
        left: null,
        right: null
      });
      
      return steps;
    }
    
    // Find insertion point
    while (true) {
      const highlightedTree = bstSearch(currentBST, currentNode.value, true);
      steps.push({
        tree: highlightedTree,
        status: `Comparing ${val} with ${currentNode.value}`
      });
      
      if (val < currentNode.value) {
        if (!currentNode.left) {
          break;
        }
        path.push('left');
        currentNode = currentNode.left;
      } else if (val > currentNode.value) {
        if (!currentNode.right) {
          break;
        }
        path.push('right');
        currentNode = currentNode.right;
      } else {
        // Value already exists
        steps.push({
          tree: bstSearch(currentBST, val, true),
          status: `Value ${val} already exists in the tree`
        });
        return steps;
      }
    }
    
    // Step 3: Insert the new node
    const newTree = bstInsert(currentBST, val);
    steps.push({
      tree: bstSearch(newTree, val, true),
      status: `Inserted ${val} ${path.length > 0 ? 'as ' + path.join(' ') + ' child of ' + currentNode.value : 'as root'}`
    });
    
    // Update the current BST (without highlights)
    setCurrentBST(newTree);
    
    return steps;
  };
  
  const simulateBSTSearch = (val) => {
    const steps = [];
    
    // Step 1: Start with current BST
    steps.push({
      tree: deepClone(currentBST),
      status: `Starting search for ${val}`
    });
    
    if (!currentBST) {
      steps.push({
        tree: null,
        status: `Tree is empty, value ${val} not found`
      });
      return steps;
    }
    
    // Step 2: Search and highlight path
    let currentNode = currentBST;
    let found = false;
    
    while (currentNode) {
      const highlightedTree = bstSearch(currentBST, currentNode.value, true);
      steps.push({
        tree: highlightedTree,
        status: `Comparing ${val} with ${currentNode.value}`
      });
      
      if (val === currentNode.value) {
        found = true;
        break;
      } else if (val < currentNode.value) {
        if (!currentNode.left) break;
        currentNode = currentNode.left;
      } else {
        if (!currentNode.right) break;
        currentNode = currentNode.right;
      }
    }
    
    // Final step showing search result
    if (found) {
      const resultTree = bstSearch(currentBST, val, true);
      if (resultTree) resultTree.found = true;
      steps.push({
        tree: resultTree,
        status: `Found ${val} in the tree`
      });
    } else {
      steps.push({
        tree: deepClone(currentBST),
        status: `Value ${val} not found in the tree`
      });
    }
    
    return steps;
  };
  
  const simulateBSTDelete = (val) => {
    const steps = [];
    
    // Step 1: Start with current BST
    steps.push({
      tree: deepClone(currentBST),
      status: `Starting deletion of ${val}`
    });
    
    if (!currentBST) {
      steps.push({
        tree: null,
        status: `Tree is empty, nothing to delete`
      });
      return steps;
    }
    
    // Step 2: Search for the node to delete
    let currentNode = currentBST;
    let found = false;
    
    while (currentNode) {
      const highlightedTree = bstSearch(currentBST, currentNode.value, true);
      steps.push({
        tree: highlightedTree,
        status: `Searching for ${val}, comparing with ${currentNode.value}`
      });
      
      if (val === currentNode.value) {
        found = true;
        break;
      } else if (val < currentNode.value) {
        if (!currentNode.left) break;
        currentNode = currentNode.left;
      } else {
        if (!currentNode.right) break;
        currentNode = currentNode.right;
      }
    }
    
    // If value not found
    if (!found) {
      steps.push({
        tree: deepClone(currentBST),
        status: `Value ${val} not found in the tree, nothing to delete`
      });
      return steps;
    }
    
    // Step 3: Delete the node
    const newTree = bstDelete(currentBST, val);
    steps.push({
      tree: newTree,
      status: `Deleted ${val} from the tree`
    });
    
    // Update the current BST
    setCurrentBST(newTree);
    
    return steps;
  };

  // Simulation for Heap operations
  const simulateHeapInsert = (val) => {
    const steps = [];
    
    // Step 1: Start with current heap
    steps.push({
      tree: deepClone(currentHeap),
      status: `Starting insertion of ${val}`
    });
    
    if (!currentHeap) {
      // Create new heap with just the root
      const newHeap = {
        value: val,
        highlight: true,
        left: null,
        right: null
      };
      
      steps.push({
        tree: newHeap,
        status: `Created new heap with root ${val}`
      });
      
      setCurrentHeap(deepClone(newHeap));
      return steps;
    }
    
    // Step 2: Find the next position to insert
    const { path, parent, side } = getNextHeapPosition(currentHeap);
    let parentPath = path;
    
    // Show the insertion position
    const positionTree = deepClone(currentHeap);
    let currentNode = positionTree;
    for (const dir of parentPath) {
      currentNode = currentNode[dir];
    }
    currentNode.highlight = true;
    
    steps.push({
      tree: positionTree,
      status: `Found insertion position as ${side} child of node ${currentNode.value}`
    });
    
    // Step 3: Insert new node
    const insertedTree = deepClone(currentHeap);
    currentNode = insertedTree;
    for (const dir of parentPath) {
      currentNode = currentNode[dir];
    }
    
    currentNode[side] = {
      value: val,
      highlight: true,
      left: null,
      right: null
    };
    
    steps.push({
      tree: insertedTree,
      status: `Inserted ${val} as ${side} child of node ${currentNode.value}`
    });
    
    // Step 4: Bubble up if necessary
    let bubbleTree = deepClone(insertedTree);
    let current = currentNode[side];
    let currentPathArray = [...parentPath, side];
    
    while (currentPathArray.length > 0) {
      // Find parent node
      let parentNode = bubbleTree;
      for (let i = 0; i < currentPathArray.length - 1; i++) {
        parentNode = parentNode[currentPathArray[i]];
      }
      
      // Compare with parent
      steps.push({
        tree: deepClone(bubbleTree),
        status: `Comparing ${current.value} with parent ${parentNode.value}`
      });
      
      // If parent value is less than current, swap values
      if (parentNode.value < current.value) {
        steps.push({
          tree: deepClone(bubbleTree),
          status: `${current.value} > ${parentNode.value}, swapping values`
        });
        
        const temp = parentNode.value;
        parentNode.value = current.value;
        current.value = temp;
        
        parentNode.highlight = true;
        current.highlight = false;
        
        steps.push({
          tree: deepClone(bubbleTree),
          status: `Swapped values, continuing upward`
        });
        
        // Move up
        current = parentNode;
        currentPathArray.pop();
      } else {
        steps.push({
          tree: deepClone(bubbleTree),
          status: `Heap property satisfied (${parentNode.value} >= ${current.value}), insertion complete`
        });
        break; // Heap property satisfied
      }
    }
    
    // Final result - clear highlights
    const finalTree = deepClone(bubbleTree);
    const clearHighlights = (node) => {
      if (!node) return;
      node.highlight = false;
      if (node.left) clearHighlights(node.left);
      if (node.right) clearHighlights(node.right);
    };
    clearHighlights(finalTree);
    
    steps.push({
      tree: finalTree,
      status: `Insertion of ${val} complete, heap property maintained`
    });
    
    // Update the current heap
    setCurrentHeap(finalTree);
    
    return steps;
  };
  
  const simulateHeapExtractMax = () => {
    const steps = [];
    
    // Step 1: Start with current heap
    steps.push({
      tree: deepClone(currentHeap),
      status: `Starting extract max operation`
    });
    
    if (!currentHeap) {
      steps.push({
        tree: null,
        status: `Heap is empty, nothing to extract`
      });
      return steps;
    }
    
    // Step 2: Highlight the max element (root)
    const maxTree = deepClone(currentHeap);
    maxTree.highlight = true;
    
    steps.push({
      tree: maxTree,
      status: `Maximum value is ${currentHeap.value} (at root)`
    });
    
    if (!currentHeap.left && !currentHeap.right) {
      // Only one node in the heap
      steps.push({
        tree: null,
        status: `Removed only element, heap is now empty`
      });
      
      setCurrentHeap(null);
      return steps;
    }
    
    // Step 3: Find the last node using BFS
    const queue = [{ node: currentHeap, path: [] }];
    let lastNodePath = [];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift();
      
      if (node.right) {
        queue.push({ node: node.right, path: [...path, 'right'] });
      }
      
      if (node.left) {
        queue.push({ node: node.left, path: [...path, 'left'] });
      }
      
      if (!node.left && !node.right) {
        lastNodePath = path;
        break;
      }
    }
    
    // Highlight the last node
    const lastNodeTree = deepClone(currentHeap);
    let lastNode = lastNodeTree;
    for (const dir of lastNodePath) {
      lastNode = lastNode[dir];
    }
    lastNode.highlight = true;
    
    steps.push({
      tree: lastNodeTree,
      status: `Found last node with value ${lastNode.value}`
    });
    
    // Step 4: Replace root with last node and remove last node
    const replacedTree = deepClone(currentHeap);
    
    // Find last node parent
    let lastParent = null;
    let lastSide = '';
    if (lastNodePath.length > 0) {
      lastParent = replacedTree;
      for (let i = 0; i < lastNodePath.length - 1; i++) {
        lastParent = lastParent[lastNodePath[i]];
      }
      lastSide = lastNodePath[lastNodePath.length - 1];
    }
    
    // Store the value to replace root
    let lastNodeValue;
    if (lastParent) {
      lastNodeValue = lastParent[lastSide].value;
      // Remove the last node
      lastParent[lastSide] = null;
    } else {
      // Only root node with one child
      lastNodeValue = replacedTree.left ? replacedTree.left.value : replacedTree.right.value;
      if (replacedTree.left) {
        replacedTree.left = null;
      } else {
        replacedTree.right = null;
      }
    }
    
    // Replace root value
    const maxValue = replacedTree.value;
    replacedTree.value = lastNodeValue;
    replacedTree.highlight = true;
    
    steps.push({
      tree: replacedTree,
      status: `Replaced root with last node value ${lastNodeValue}, removed last node`
    });
    
    // Step 5: Heapify down
    const heapifyTree = deepClone(replacedTree);
    let current = heapifyTree;
    current.highlight = true;
    
    // Continue heapify down until heap property is satisfied
    while (true) {
      let largest = current;
      let largestChild = null;
      let largestSide = '';
      
      // Check left child
      if (current.left && current.left.value > largest.value) {
        largest = current.left;
        largestChild = current.left;
        largestSide = 'left';
      }
      
      // Check right child
      if (current.right && current.right.value > largest.value) {
        largest = current.right;
        largestChild = current.right;
        largestSide = 'right';
      }
      
      // If current is not the largest, show comparison
      if (largest !== current) {
        const compareTree = deepClone(heapifyTree);
        let currentNode = compareTree;
        // Find current node in the heapifyTree
        const findNode = (node, target) => {
          if (!node) return null;
          if (node === current) return node;
          const leftResult = findNode(node.left, target);
          if (leftResult) return leftResult;
          return findNode(node.right, target);
        };
        currentNode = findNode(compareTree, current);
        
        if (currentNode) {
          currentNode.highlight = true;
          if (largestSide === 'left') {
            currentNode.left.highlight = true;
          } else {
            currentNode.right.highlight = true;
          }
          
          steps.push({
            tree: compareTree,
            status: `Comparing ${currentNode.value} with ${largestSide} child ${largest.value}`
          });
          
          // Swap values
          const temp = currentNode.value;
          currentNode.value = largest.value;
          if (largestSide === 'left') {
            currentNode.left.value = temp;
            currentNode.left.highlight = false;
          } else {
            currentNode.right.value = temp;
            currentNode.right.highlight = false;
          }
          
          steps.push({
            tree: deepClone(compareTree),
            status: `Swapped ${temp} with ${largest.value}, continuing downward`
          });
          
          // Move down
          current = largestSide === 'left' ? currentNode.left : currentNode.right;
          current.highlight = true;
        }
      } else {
        // No more swaps needed
        steps.push({
          tree: deepClone(heapifyTree),
          status: `Heap property satisfied, extract max operation complete`
        });
        break;
      }
    }
    
    // Final result - clear highlights
    const finalTree = deepClone(heapifyTree);
    const clearHighlights = (node) => {
      if (!node) return;
      node.highlight = false;
      if (node.left) clearHighlights(node.left);
      if (node.right) clearHighlights(node.right);
    };
    clearHighlights(finalTree);
    
    steps.push({
      tree: finalTree,
      status: `Extracted max value ${maxValue}, heap property maintained`
    });
    
    // Update the current heap
    setCurrentHeap(finalTree);
    
    return steps;
  };

  const performOperation = () => {
    try {
      setError('');
      
      let simulatedSteps = [];
      
      if (structure === 'bst') {
        if (operation === 'insert') {
          simulatedSteps = simulateBSTInsert(value);
        } else if (operation === 'search') {
          simulatedSteps = simulateBSTSearch(value);
        } else if (operation === 'delete') {
          simulatedSteps = simulateBSTDelete(value);
        } else if (operation === 'clear') {
          handleClear();
          return;
        }
      } else if (structure === 'heap') {
        if (operation === 'insert') {
          simulatedSteps = simulateHeapInsert(value);
        } else if (operation === 'extractMax') {
          simulatedSteps = simulateHeapExtractMax();
        } else if (operation === 'clear') {
          handleClear();
          return;
        }
      }
      
      setSteps(simulatedSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      
    } catch (error) {
      console.error('Error performing operation:', error);
      setError('Error performing operation: ' + error.message);
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

  const getStructureInfo = () => {
    switch (structure) {
      case 'bst':
        return {
          name: 'Binary Search Tree',
          description: 'A tree data structure in which each node has at most two children, with all nodes to the left having values less than the node, and all nodes to the right having values greater than the node.',
          operations: ['insert', 'delete', 'search', 'clear'],
          timeComplexity: {
            insert: 'O(log n) average, O(n) worst',
            delete: 'O(log n) average, O(n) worst',
            search: 'O(log n) average, O(n) worst'
          }
        };
      case 'heap':
        return {
          name: 'Max Heap',
          description: 'A complete binary tree where the value in each internal node is greater than or equal to the values in the children of that node.',
          operations: ['insert', 'extractMax', 'clear'],
          timeComplexity: {
            insert: 'O(log n)',
            extractMax: 'O(log n)'
          }
        };
      default:
        return {
          name: 'Unknown Data Structure',
          description: '',
          operations: [],
          timeComplexity: {}
        };
    }
  };

  const structureInfo = getStructureInfo();

  // Get current step status/description
  const getCurrentStatus = () => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return '';
    }
    
    try {
      const stepData = steps[currentStep];
      return stepData.status || '';
    } catch (e) {
      console.error('Error getting status:', e);
      return '';
    }
  };

  // Handle structure change
  const handleStructureChange = (e) => {
    const newStructure = e.target.value;
    setStructure(newStructure);
    
    // Reset operation to first available one
    const newStructureInfo = {
      bst: {
        operations: ['insert', 'delete', 'search', 'clear']
      },
      heap: {
        operations: ['insert', 'extractMax', 'clear']
      }
    }[newStructure] || { operations: [] };
    
    if (newStructureInfo.operations.length > 0) {
      setOperation(newStructureInfo.operations[0]);
    }
    
    // Reset visualization
    setSteps([]);
    setCurrentStep(0);
    setError('');
    
    // Reset to initial state for the selected structure
    if (newStructure === 'bst') {
      setCurrentBST(deepClone(INITIAL_BST));
      setTimeout(() => renderTree(INITIAL_BST), 0);
    } else if (newStructure === 'heap') {
      setCurrentHeap(deepClone(INITIAL_HEAP));
      setTimeout(() => renderTree(INITIAL_HEAP, true), 0);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {structureInfo.name} Visualization
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Typography variant="body1" paragraph>
          {structureInfo.description}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Time Complexity
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(structureInfo.timeComplexity).map(([op, complexity]) => (
            <Grid item xs={12} sm={4} key={op}>
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {complexity}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="structure-select-label">Data Structure</InputLabel>
              <Select
                labelId="structure-select-label"
                value={structure}
                label="Data Structure"
                onChange={handleStructureChange}
              >
                <MenuItem value="bst">Binary Search Tree</MenuItem>
                <MenuItem value="heap">Max Heap</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel id="operation-select-label">Operation</InputLabel>
              <Select
                labelId="operation-select-label"
                value={operation}
                label="Operation"
                onChange={(e) => setOperation(e.target.value)}
              >
                {structureInfo.operations.map(op => (
                  <MenuItem key={op} value={op}>
                    {op.charAt(0).toUpperCase() + op.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {operation !== 'clear' && operation !== 'extractMax' && (
              <TextField
                label="Value"
                variant="outlined"
                type="number"
                value={value}
                onChange={handleValueChange}
              />
            )}
            
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
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={performOperation}
                startIcon={
                  operation === 'insert' ? <AddIcon /> : 
                  operation === 'search' ? <SearchIcon /> : 
                  operation === 'delete' ? <DeleteIcon /> : 
                  operation === 'extractMax' ? <PlayArrowIcon /> :
                  <DeleteIcon />
                }
                sx={{ flexGrow: 1 }}
              >
                {operation.charAt(0).toUpperCase() + operation.slice(1)}
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={resetToInitial}
                startIcon={<RestartAltIcon />}
              >
                Reset
              </Button>
            </Stack>
            
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
        
        <Box sx={{ height: '400px', border: '1px solid #eee', overflow: 'hidden' }}>
          {(structure === 'bst' || structure === 'heap') ? (
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={400} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body1">
                Use the controls above to build and manipulate the data structure
              </Typography>
            </Box>
          )}
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

export default DataStructureVisualizer;