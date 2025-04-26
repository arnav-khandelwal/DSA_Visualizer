import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Box,
  Collapse,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HomeIcon from '@mui/icons-material/Home';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;
  
  const [openSections, setOpenSections] = useState({
    sorting: true,
    searching: true,
    graph: true,
    dataStructures: true
  });

  const handleClick = (section) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };

  const sortingAlgorithms = [
    { name: 'Bubble Sort', path: '/sorting?algorithm=bubble' },
    { name: 'Insertion Sort', path: '/sorting?algorithm=insertion' },
    { name: 'Selection Sort', path: '/sorting?algorithm=selection' },
    { name: 'Merge Sort', path: '/sorting?algorithm=merge' },
    { name: 'Quick Sort', path: '/sorting?algorithm=quick' },
    { name: 'Heap Sort', path: '/sorting?algorithm=heap' },
  ];

  const searchingAlgorithms = [
    { name: 'Linear Search', path: '/searching?algorithm=linear' },
    { name: 'Binary Search', path: '/searching?algorithm=binary' },
  ];

  const graphAlgorithms = [
    { name: 'BFS', path: '/graph?algorithm=bfs' },
    { name: 'DFS', path: '/graph?algorithm=dfs' },
    { name: 'Dijkstra', path: '/graph?algorithm=dijkstra' },
    { name: 'Kruskal', path: '/graph?algorithm=kruskal' },
    { name: 'Prim', path: '/graph?algorithm=prim' },
  ];

  const dataStructures = [
    { name: 'Binary Search Tree', path: '/data-structures?structure=bst' },
    { name: 'Heap', path: '/data-structures?structure=heap' },
    { name: 'Trie', path: '/data-structures?structure=trie' },
    { name: 'AVL Tree', path: '/data-structures?structure=avl' },
  ];

  const drawerVariant = isMobile ? 'temporary' : 'permanent';

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: isMobile ? 'fixed' : 'relative',
        },
      }}
      variant={drawerVariant}
      anchor="left"
      open={!isMobile}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          
          <Divider />
          
          {/* Sorting Algorithms */}
          <ListItem button onClick={() => handleClick('sorting')}>
            <ListItemIcon>
              <SortIcon />
            </ListItemIcon>
            <ListItemText primary="Sorting Algorithms" />
            {openSections.sorting ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSections.sorting} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {sortingAlgorithms.map((algo) => (
                <ListItem button key={algo.name} component={Link} to={algo.path} sx={{ pl: 4 }}>
                  <ListItemText primary={algo.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* Searching Algorithms */}
          <ListItem button onClick={() => handleClick('searching')}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Searching Algorithms" />
            {openSections.searching ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSections.searching} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {searchingAlgorithms.map((algo) => (
                <ListItem button key={algo.name} component={Link} to={algo.path} sx={{ pl: 4 }}>
                  <ListItemText primary={algo.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* Graph Algorithms */}
          <ListItem button onClick={() => handleClick('graph')}>
            <ListItemIcon>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Graph Algorithms" />
            {openSections.graph ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSections.graph} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {graphAlgorithms.map((algo) => (
                <ListItem button key={algo.name} component={Link} to={algo.path} sx={{ pl: 4 }}>
                  <ListItemText primary={algo.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* Data Structures */}
          <ListItem button onClick={() => handleClick('dataStructures')}>
            <ListItemIcon>
              <DataArrayIcon />
            </ListItemIcon>
            <ListItemText primary="Data Structures" />
            {openSections.dataStructures ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openSections.dataStructures} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {dataStructures.map((structure) => (
                <ListItem button key={structure.name} component={Link} to={structure.path} sx={{ pl: 4 }}>
                  <ListItemText primary={structure.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;