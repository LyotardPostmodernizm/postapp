import React from 'react';
import {Link} from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.scss';

function Navbar() {
    let userId = 1; //Değişecek!!! Current User'in userID'sini alacak
    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" >
                        <Link className={"homeLink"} to="/">Ana sayfa</Link>
                    </Typography>

                    <Typography variant="h6" component="div" sx={{marginLeft: "auto"}}>
                    <Link className="userLink" to={{pathname: "/users/" + userId}}>User</Link>
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Navbar;