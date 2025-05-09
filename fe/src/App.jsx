import { useState } from 'react'
import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Post from "./components/Post/Post.jsx";
import Navbar from "./Navbar/Navbar.jsx";
import Home from "./Home/Home.jsx"
import User from "./User/User.jsx";


function App() {


  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Post />} />
          <Route path="/users/:userId" element={<User/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
