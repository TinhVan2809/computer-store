import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css'
import { UserProvider } from "./context/AdminContext";

// PAGES AND COMPONENTS
import Home from "./pages/Home";
import Manufacturers from "./pages/Manufacturers";
import Products from "./pages/Products";
import Navbar from './components/Navbar';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Voucher from './pages/Voucher';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';


function App() {  
  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/manufacturers" element={<Manufacturers />} />
            <Route path="/products" element={<Products />} />
            <Route path='/users' element={<Users />}></Route>
            <Route path='/categories' element={<Categories />} />
            <Route path='/login' element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/vouchers" element={<Voucher />} /> 
            <Route path="/orders" element={<Orders />} />
            <Route path='order:orderId' element={<OrderDetail />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </>
  )
}

export default App
