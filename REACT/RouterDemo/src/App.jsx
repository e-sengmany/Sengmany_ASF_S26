import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="App">
        <div>
          <ul>
            <li><Link to ="/Home"> Home </Link></li>
            <li><Link to ="/About"> About </Link></li>
            <li><Link to ="/Contact"> Contact </Link></li>
          </ul>
          <Routes>
            <Route path="/Home" element ={<Home/>}/>
            <Route path="/About" element ={<About/>}/>
            <Route path="/Contact" element ={<Contact/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;
