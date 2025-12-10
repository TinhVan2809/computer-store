import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


//COMPONENTS AND PAGES
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Detail from './pages/Detail';
import Login from './pages/Login';

//STYLES
import './styles/navbar.css';
import './styles/App.css';

function App() {

  return (
    <>
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:product_id" element={<Detail />} />
        <Route path='/login'element={<Login />}/>
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App
