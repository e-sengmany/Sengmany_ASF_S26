import React from 'react';
import {Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import LandingPage from "../../pages/LandingPage.jsx";
import ErrorPage from "../../pages/ErrorPage.jsx";
import ResultsPage from "../../pages/ResultsPage.jsx";


// This is the actual router. We will do the logic for all the routing here.

export const AppRoute = () => {
  const navigate = useNavigate();

  return (

    <Routes>
      {/*default page, we changed this to add navigate so that the users default page is redirected to the landing page*/}
      <Route path={"/"} element={<Navigate to="/landing"/>}/>
      <Route path={"/landing"} element={<LandingPage/>}/>
      <Route path={"/errors"} element={<ErrorPage/>}/>
      <Route path={"/results"} element={<ResultsPage/>}/>
    </Routes>
  );
};

