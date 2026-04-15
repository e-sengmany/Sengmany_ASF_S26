import React from 'react';
import {Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import MenuPage from "../../pages/MenuPage.jsx";
import HomePage from "../../pages/HomePage.jsx";
import ReservationsPage from "../../pages/ReservationsPage.jsx";
import ShoppingCartPage from "../../pages/ShoppingCartPage.jsx";


// This is the actual router. We will do the logic for all the routing here.

export const AppRoute = () => {
  const navigate = useNavigate();

  return (

    <Routes>
      {/*default page, we changed this to add navigate so that the users default page is redirected to the landing page*/}
      <Route path={"/"} element={<Navigate to="/home"/>}/>
      <Route path={"/home"} element={<HomePage/>}/>
      <Route path={"/menu"} element={<MenuPage/>}/>
      <Route path={"/reservations"} element={<ReservationsPage/>}/>
      <Route path={"/cart"} element={<ShoppingCartPage/>}/>
    </Routes>
  );
};

