import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DataArrayIcon from '@mui/icons-material/DataArray';

const Dashboard = () => {
  const cards = [
    {
      title: 'Sorting Algorithms',
      description: 'Visualize how different sorting algorithms work step-by-step.',
      link: '/sorting',
      icon: <SortIcon sx={{ fontSize: 50, color: '#3f51b5' }} />,
      algorithms: ['Bubble Sort', 'Insertion Sort', 'Selection Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort']
    },
    {
      title: 'Searching Algorithms',
      description: 'Learn how searching algorithms find elements in arrays.',
      link: '/searching',
      icon: <SearchIcon sx={{ fontSize: 50, color: '#3f51b5' }} />,
      algorithms: ['Linear Search', 'Binary Search']
    },
    {
      title: 'Graph Algorithms',
      description: 'Explore graph traversal and shortest path algorithms.',
      link: '/graph',
      icon: <AccountTreeIcon sx={{ fontSize: 50, color: '#3f51b5' }} />,
      algorithms: ['BFS', 'DFS', 'Dijkstra', 'Kruskal', 'Prim']
    },
    {
      title: 'Data Structures',
      description: 'Visualize operations on various data structures.',
      link: '/data-structures',
      icon: <DataArrayIcon sx={{ fontSize: 50, color: '#3f51b5' }} />,
      algorithms: ['Binary Search Tree', 'Heap', 'Trie', 'AVL Tree']
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Algorithm Visualizer
        </Typography>
        <Typography variant="subtitle1" paragraph>
          Welcome to the Algorithm Visualizer! This tool helps you understand how different algorithms 
          and data structures work through interactive visualizations.
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {cards.map((card) => (
          <Grid item key={card.title} xs={12} sm={6}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Typography gutterBottom variant="h5" component="h2" sx={{ ml: 2 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {card.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Includes:</strong>
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '1.5rem' }}>
                    {card.algorithms.map(algo => (
                      <li key={algo}>{algo}</li>
                    ))}
                  </ul>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="medium" 
                  color="primary" 
                  variant="contained" 
                  component={Link} 
                  to={card.link}
                  sx={{ ml: 1, mb: 1 }}
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;