import { Routes, Route } from 'react-router-dom';
import API from './api/api';
import 'remixicon/fonts/remixicon.css'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


//COMPONENTS AND PAGES
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Detail from './pages/Detail';
import Login from './pages/Login';
import Carts from './pages/Carts';
import Register from './pages/Register';
import Profile from './pages/Profile';


//STYLES
import './styles/navbar.css';
import './styles/App.css';

function App() {
   

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:product_id" element={<Detail />} />
        <Route path='/login'element={<Login />}/>
        <Route path='/register' element={<Register />} />
        <Route path='/cart/:user_id' element={<Carts />}></Route>
        <Route path='/profile/*' element={<Profile />} />
      </Routes>

  </>
  );
}

export default App
