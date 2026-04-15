import React from 'react';
import ErrorPage from "../pages/ErrorPage.jsx";
import ResultsPage from "../pages/ResultsPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import NavBar from "./components/NavBar.jsx";
import {BrowserRouter as Router}  from "react-router";
import {AppRoute} from "./components/AppRoute.jsx";

const App = () => {
  return (

    <Router>
      {/*We put the navbar inside of the router because we would not be able to pass information if outside of it*/}
      <NavBar/>
      <AppRoute/>
    </Router>
  );
};

export default App;
