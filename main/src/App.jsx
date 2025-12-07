// LIBRARY
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// PAGES
import Home from "./pages/Home";
import Manufacturers from "./pages/Manufacturers";
import Products from "./pages/Products";

// COMPONENTS
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/manufacturers" element={<Manufacturers />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
