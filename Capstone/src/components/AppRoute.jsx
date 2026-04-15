import React from 'react';
import {Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import MenuPage from "../../pages/MenuPage.jsx";
import HomePage from "../../pages/HomePage.jsx";
import ReservationsPage from "../../pages/ReservationsPage.jsx";
import ShoppingCartPage from "../../pages/ShoppingCartPage.jsx";


export const AppRoute = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path={"/"} element={<Navigate to="/home"/>}/>
      <Route path={"/home"} element={<HomePage/>}/>
      <Route path={"/menu"} element={<MenuPage/>}/>
      <Route path={"/reservations"} element={<ReservationsPage/>}/>
      <Route path={"/cart"} element={<ShoppingCartPage/>}/>
    </Routes>
  );
};

