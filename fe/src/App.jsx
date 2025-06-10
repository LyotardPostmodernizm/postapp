import {useEffect, useState} from 'react'
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Post from "./components/Post/Post.jsx";
import Navbar from "./Navbar/Navbar.jsx";
import Home from "./Home/Home.jsx"
import User from "./User/User.jsx";
import AuthRegister from "./components/Auth/AuthRegister.jsx";
import AuthLogin from "./components/Auth/AuthLogin.jsx";


function App() {



    return (
        <div className="App">
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/users/:userId" element={<User />} />
                    <Route
                        exact path="/auth"
                        element={
                            localStorage.getItem("userId") != null ? (
                                <Navigate to="/" replace />
                            ) : (
                                <AuthRegister />
                            )
                        }
                    />
                    <Route
                        exact path="/login"
                        element={
                            localStorage.getItem("userId") != null ? (
                                <Navigate to="/" replace />
                            ) : (
                                <AuthLogin />
                            )
                        }
                        />
                </Routes>
            </BrowserRouter>

        </div>
    );


}

export default App
