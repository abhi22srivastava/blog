import { useState } from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/blog';
import Contact from './pages/Contact';
import blogs from './data/blogs';
import BlogDetails from './pages/BlogDetails';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const [count, setCount] = useState(0)
  const isLoggedIn = localStorage.getItem("token");
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


      </Routes>
  </BrowserRouter>
    </>
  )
}

export default App
