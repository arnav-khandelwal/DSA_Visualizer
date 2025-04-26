import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useMediaQuery, useTheme, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const Header = ({ toggleDrawer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Algorithm Visualizer
          </Link>
        </Typography>
        {!isMobile && (
          <Box>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/sorting">
              Sorting
            </Button>
            <Button color="inherit" component={Link} to="/searching">
              Searching
            </Button>
            <Button color="inherit" component={Link} to="/graph">
              Graph
            </Button>
            <Button color="inherit" component={Link} to="/data-structures">
              Data Structures
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;