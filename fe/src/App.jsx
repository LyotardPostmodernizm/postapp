import {useEffect, useState} from 'react'
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./Navbar/Navbar.jsx";
import Home from "./Home/Home.jsx";
import User from "./User/User.jsx";
import AuthRegister from "./components/Auth/AuthRegister.jsx";
import AuthLogin from "./components/Auth/AuthLogin.jsx";


function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // localStorage'dan token kontrolü
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);


    return (
        <div className="App">
            <BrowserRouter>
                <Navbar isAuthenticated={isAuthenticated}
                        setIsAuthenticated={setIsAuthenticated}
                />
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/users/:userId" element={<User />} />
                    <Route
                        exact path="/auth"
                        element={<AuthRegister />}
                    />
                    <Route
                        exact path="/login"
                        element={<AuthLogin />}
                    />
                </Routes>
            </BrowserRouter>

        </div>
    );


}

export default App
