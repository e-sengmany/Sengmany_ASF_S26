import React from 'react';
import PracticePage from "../Pages/PracticePage.jsx";
import HomePage from "../Pages/HomePage.jsx";
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";

const NavBar = () => {
  return (
    <Router>
      <div>
        <div>
          <ul>
            <li><Link to ="/Home"> Home </Link></li>
            <li><Link to ="/Practice"> Practice Land Nav </Link></li>
            <li><Link to ="/Scenario"> Practice Scenario </Link></li>
          </ul>
          <Routes>
            <Route path="/Home" element ={<HomePage/>}/>
            <Route path="/Practice" element ={<PracticePage/>}/>
            <Route path="/Scenario" element ={<HomePage/>}/>
            {/*change this later*/}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default NavBar;
