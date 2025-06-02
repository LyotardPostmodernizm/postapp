import React from 'react';
import {Link, useNavigate} from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.scss';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate();
    const clickLogout = () => {
            localStorage.removeItem("userId")
            localStorage.removeItem("token")
            navigate("/login")

    }
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
                    <Typography variant="h6" component="div">
                        <Link className={"homeLink"} to="/">Ana sayfa</Link>
                    </Typography>

                    <Typography variant="h6" component="div" sx={{marginLeft: "auto"}}>
                        {localStorage.getItem("userId") != null ?
                            <Link className="userLink" to={{pathname: "/users/" + userId}}>
                                Profil</Link> :


                            <Link className="userLink" to={{pathname: "/auth"}}>Kayıt/Giriş</Link>

                        }

                    </Typography>
                    <IconButton size="large"
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={clickLogout}
                    >
                        {localStorage.getItem("userId") != null ?

                            <Link className="userLink" to={{pathname: "/login"}}>
                                <LogoutIcon/>
                            </Link> :
                            null}
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Navbar;