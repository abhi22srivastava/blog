import { useState } from 'react';

import { BrowserRouter, Routes, Route  } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/blog';
import Contact from './pages/Contact';
import blogs from './data/blogs';
import BlogDetails from './pages/BlogDetails';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddArticle from "./pages/AddArticle";
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from "react";


import AOS from "aos";
import "aos/dist/aos.css";



function App() {
  const [count, setCount] = useState(0)
  const isLoggedIn = localStorage.getItem("token");
  useEffect(() => {
    AOS.init({
      duration: 1000,   // Animation duration (ms)
      once: true,       // Animate only once
      offset: 100,      // Start animation before the element reaches the viewport
      easing: "ease-in-out",
    });
  }, []);

  return (
    <>
  
    
 <BrowserRouter>
     
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
       
        <Route path="/contact" element={<Contact />} />
         <Route path="/login" element={<Login />} />
      
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
               
            </ProtectedRoute>
          }
        />

      <Route
          path="/blog/:id"
          element={
            <ProtectedRoute token={isLoggedIn}>
              <BlogDetails  />
            </ProtectedRoute>
          }
        />

        <Route path="/add-article" element={<AddArticle />} />


      </Routes>
  </BrowserRouter>
    </>
  )
}

export default App
