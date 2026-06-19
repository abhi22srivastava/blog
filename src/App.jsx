import { useState } from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";

import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/blog';
import Contact from './pages/Contact';
import blogs from './data/blogs';
import BlogDetails from './pages/BlogDetails';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
    
 <BrowserRouter>
     
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/contact" element={<Contact />} />
      
      </Routes>
  </BrowserRouter>
    </>
  )
}

export default App
