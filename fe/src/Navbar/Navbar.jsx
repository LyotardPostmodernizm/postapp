import React, {useState} from 'react';
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
import {Tooltip} from "@mui/material";

function Navbar({ isAuthenticated, setIsAuthenticated }) {
    const userId = localStorage.getItem("userId")
    const navigate = useNavigate();

    const clickLogout = () => {
        localStorage.removeItem("userId")
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")

        setIsAuthenticated(false)
        navigate("/auth", {replace: true});
    }
    const clickAuth = () => {
        navigate("/auth", {replace: true});
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
                        {isAuthenticated ?
                            <Link className="userLink" to={{pathname: "/users/" + userId}}>
                                Profil</Link> :
                            <Link className="userLink" to={{pathname: "/auth"}}>Kayıt/Giriş</Link>

                        }

                    </Typography>
                    {isAuthenticated ?
                        <Tooltip title={"Çıkış Yap"}>
                            <IconButton size="large"
                                        edge="end"
                                        color="inherit"
                                        aria-label="menu"
                                        onClick={clickLogout}
                            >

                                <Link className="userLink" to={{pathname: "/auth"}}>
                                    <LogoutIcon/>
                                </Link>
                            </IconButton>
                        </Tooltip> :
                        null}
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Navbar;