import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


//COMPONENTS AND PAGES
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Detail from './pages/Detail';

//STYLES
import './styles/navbar.css';
import './styles/App.css';

function App() {

  return (
    <>
    <Navbar />

    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:product_id" element={<Detail />} />
        </Routes>
    </BrowserRouter>
  </>
  );
}

export default App
