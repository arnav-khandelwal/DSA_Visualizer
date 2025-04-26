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

const SearchingVisualizer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const algorithmParam = queryParams.get('algorithm');

  const [algorithm, setAlgorithm] = useState(algorithmParam || 'linear');
  const [array, setArray] = useState([]);
  const [arrayInput, setArrayInput] = useState('');
  const [target, setTarget] = useState(0);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(-1);
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
    
    // For binary search, sort the array if that's the selected algorithm
    if (algorithm === 'binary') {
      newArray.sort((a, b) => a - b);
    }
    
    // Pick a random target (sometimes from the array, sometimes not)
    const useExistingValue = Math.random() > 0.3;
    const targetValue = useExistingValue 
      ? newArray[Math.floor(Math.random() * newArray.length)]
      : Math.floor(Math.random() * 100) + 1;
    
    setArray(newArray);
    setArrayInput(newArray.join(', '));
    setTarget(targetValue);
    setError('');
  };

  const handleInputChange = (e) => {
    setArrayInput(e.target.value);
    setError('');
  };

  const handleTargetChange = (e) => {
    setTarget(parseInt(e.target.value) || 0);
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

  const visualizeSearch = async () => {
    if (!parseInput()) return;

    try {
      setError('');
      
      // For binary search, ensure the array is sorted
      let searchArray = [...array];
      if (algorithm === 'binary') {
        searchArray.sort((a, b) => a - b);
        setArray(searchArray);
        setArrayInput(searchArray.join(', '));
      }
      
      const response = await AlgorithmsAPI.visualizeSearch(algorithm, searchArray, target);
      console.log("Response data:", response.data); // For debugging
      setSteps(response.data.steps);
      setResult(response.data.result);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error visualizing search:', error);
      setError('Error visualizing search. Please check the console for details.');
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
      case 'linear':
        return {
          name: 'Linear Search',
          description: 'A simple search algorithm that sequentially checks each element in the list until a match is found or the whole list has been searched.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)'
        };
      case 'binary':
        return {
          name: 'Binary Search',
          description: 'A faster search algorithm that works on sorted arrays by repeatedly dividing the search interval in half.',
          timeComplexity: 'O(log n)',
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
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          {array.map((value, index) => (
            <Box
              key={index}
              sx={{
                width: '50px',
                height: '50px',
                backgroundColor: '#3f51b5',
                margin: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                borderRadius: '4px'
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
      );
    }

    try {
      // Process the step data
      let stepData;
      const currentStepData = steps[currentStep];
      
      if (typeof currentStepData === 'string') {
        try {
          stepData = JSON.parse(currentStepData);
        } catch (e) {
          console.error("Error parsing step data:", e);
          return <Typography color="error">Error rendering visualization</Typography>;
        }
      } else {
        stepData = currentStepData;
      }
      
      const status = stepData.status || '';
      
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            {stepData.array.map((item, index) => {
              const value = item.value;
              const highlight = item.highlight;
              
              return (
                <Box
                  key={index}
                  sx={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: highlight ? '#f50057' : '#3f51b5',
                    margin: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  {value}
                </Box>
              );
            })}
          </Box>
          
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            {status}
          </Typography>
          
          {currentStep === steps.length - 1 && (
            <Typography variant="h6" align="center" sx={{ mt: 2, fontWeight: 'bold', color: result >= 0 ? 'success.main' : 'error.main' }}>
              {result >= 0 
                ? `Target ${target} found at index ${result}` 
                : `Target ${target} not found in the array`}
            </Typography>
          )}
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
                <MenuItem value="linear">Linear Search</MenuItem>
                <MenuItem value="binary">Binary Search</MenuItem>
              </Select>
            </FormControl>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Array (comma separated)"
                variant="outlined"
                fullWidth
                value={arrayInput}
                onChange={handleInputChange}
                error={!!error}
                helperText={error}
              />
              
              <TextField
                label="Target Value"
                variant="outlined"
                type="number"
                value={target}
                onChange={handleTargetChange}
                sx={{ minWidth: '120px' }}
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
            
            {algorithm === 'binary' && (
              <Alert severity="info">
                For Binary Search, the array will be automatically sorted before searching.
              </Alert>
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
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={visualizeSearch}
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

export default SearchingVisualizer;