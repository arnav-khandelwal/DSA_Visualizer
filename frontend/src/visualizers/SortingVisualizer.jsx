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
import AlgorithmsAPI from '../api/api';

const SortingVisualizer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const algorithmParam = queryParams.get('algorithm');

  const [algorithm, setAlgorithm] = useState(algorithmParam || 'bubble');
  const [array, setArray] = useState([]);
  const [arrayInput, setArrayInput] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms between steps
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    // Generate an initial random array
    generateRandomArray();
    
    // Clear any existing interval when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const generateRandomArray = () => {
    const size = Math.floor(Math.random() * 10) + 5; // 5 to 15 elements
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1); // 1 to 100
    }
    setArray(newArray);
    setArrayInput(newArray.join(', '));
    setError('');
  };

  const handleInputChange = (e) => {
    setArrayInput(e.target.value);
    setError('');
  };

  const parseInput = () => {
    try {
      const parsed = arrayInput.split(',').map(item => parseInt(item.trim()));
      if (parsed.some(isNaN)) {
        setError('Please enter valid numbers separated by commas');
        return false;
      }
      setArray(parsed);
      return true;
    } catch (e) {
      setError('Please enter valid numbers separated by commas');
      return false;
    }
  };

  const visualizeSort = async () => {
    if (!parseInput()) return;

    try {
      setError('');
      const response = await AlgorithmsAPI.visualizeSort(algorithm, array);
      console.log("Response data:", response.data); // For debugging
      setSteps(response.data.steps);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error visualizing sort:', error);
      setError('Error visualizing sort. Please check the console for details.');
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

  const getAlgorithmInfo = () => {
    switch (algorithm) {
      case 'bubble':
        return {
          name: 'Bubble Sort',
          description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)'
        };
      case 'insertion':
        return {
          name: 'Insertion Sort',
          description: 'Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)'
        };
      case 'selection':
        return {
          name: 'Selection Sort',
          description: 'Divides the input list into a sorted and an unsorted region, repeatedly selecting the smallest element from the unsorted region.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)'
        };
      case 'merge':
        return {
          name: 'Merge Sort',
          description: 'A divide and conquer algorithm that divides the input array into two halves, recursively sorts them, then merges the sorted halves.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)'
        };
      case 'quick':
        return {
          name: 'Quick Sort',
          description: 'A divide and conquer algorithm that picks an element as a pivot and partitions the array around the pivot.',
          timeComplexity: 'O(n log n) average, O(n²) worst case',
          spaceComplexity: 'O(log n)'
        };
      case 'heap':
        return {
          name: 'Heap Sort',
          description: 'Builds a max heap from the input data, then repeatedly extracts the maximum element from the heap.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(1)'
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

  // Render the current step
  const renderArray = () => {
    if (steps.length === 0 || currentStep >= steps.length) {
      // Show the initial array when no steps available
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '200px', my: 2, justifyContent: 'center' }}>
          {array.map((value, index) => (
            <Box
              key={index}
              sx={{
                width: '30px',
                height: `${(value / Math.max(...array)) * 180 + 20}px`,
                backgroundColor: '#3f51b5',
                margin: '0 2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
      );
    }

    try {
      // Make sure the step data is in the right format
      let currentArray;
      const stepData = steps[currentStep];
      
      // Handle different response formats
      if (typeof stepData === 'string') {
        try {
          // Try to parse if it's a JSON string
          currentArray = JSON.parse(stepData);
        } catch (e) {
          console.error("Error parsing step data:", e);
          // If parsing fails, assume it's already in the right format
          return <Typography color="error">Error rendering visualization</Typography>;
        }
      } else {
        // If it's not a string, assume it's already an object
        currentArray = stepData;
      }
      
      // Ensure we have an array of objects with value and highlight properties
      if (!Array.isArray(currentArray)) {
        console.error("Step data is not an array:", currentArray);
        return <Typography color="error">Invalid visualization data format</Typography>;
      }
      
      const maxValue = Math.max(...currentArray.map(item => 
        typeof item === 'object' ? item.value : item
      )) || 100;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '200px', my: 2, justifyContent: 'center' }}>
          {currentArray.map((item, index) => {
            // Handle both object format and simple number format
            const value = typeof item === 'object' ? item.value : item;
            const highlight = typeof item === 'object' ? item.highlight : false;
            
            return (
              <Box
                key={index}
                sx={{
                  width: '30px',
                  height: `${(value / maxValue) * 180 + 20}px`,
                  backgroundColor: highlight ? '#f50057' : '#3f51b5',
                  margin: '0 2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'height 0.3s ease, background-color 0.3s ease'
                }}
              >
                {value}
              </Box>
            );
          })}
        </Box>
      );
    } catch (e) {
      console.error('Error rendering array:', e);
      return <Typography color="error">Error rendering visualization</Typography>;
    }
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
                <MenuItem value="bubble">Bubble Sort</MenuItem>
                <MenuItem value="insertion">Insertion Sort</MenuItem>
                <MenuItem value="selection">Selection Sort</MenuItem>
                <MenuItem value="merge">Merge Sort</MenuItem>
                <MenuItem value="quick">Quick Sort</MenuItem>
                <MenuItem value="heap">Heap Sort</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Array (comma separated)"
                  variant="outlined"
                  fullWidth
                  value={arrayInput}
                  onChange={handleInputChange}
                  error={!!error}
                  helperText={error}
                />
                <Tooltip title="Generate Random Array">
                  <Button 
                    variant="contained" 
                    onClick={generateRandomArray}
                    sx={{ minWidth: 50, height: 56 }}
                  >
                    <ShuffleIcon />
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
            
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
              onClick={visualizeSort}
              startIcon={<PlayArrowIcon />}
            >
              Visualize
            </Button>
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
        
        {renderArray()}
        
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

export default SortingVisualizer;