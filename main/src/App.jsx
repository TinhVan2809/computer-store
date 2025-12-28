import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css'

// PAGES AND COMPONENTS
import Home from "./pages/Home";
import Manufacturers from "./pages/Manufacturers";
import Products from "./pages/Products";
import Navbar from './components/Navbar';
import Users from './pages/Users';
import Categories from './pages/Categories';


function App() {  
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/manufacturers" element={<Manufacturers />} />
          <Route path="/products" element={<Products />} />
          <Route path='/users' element={<Users />}></Route>
          <Route path='/categories' element={<Categories />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
