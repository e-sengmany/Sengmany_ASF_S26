import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "../pages/MenuPage.jsx";
import ReservationsPage from "../pages/ReservationsPage.jsx";
import ShoppingCartPage from "../pages/ShoppingCartPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import "./App.css";

function App() {
  const [cart, setCart] = useState([]);

  function addToCart(item) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.Id === item.Id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.Id === item.Id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prevCart) => prevCart.filter((item) => item.Id !== id));
  }

  function updateQuantity(id, change) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.Id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div>
        <h1 className="header">
          <strong> Three </strong>
          <strong style={{ color: "blue" }}> Brothers </strong>
          <strong style={{ color: "red" }}>Bento </strong>
          <strong style={{ color: "purple" }}>Bistro</strong>
        </h1>
      </div>

      <Navbar cartItemCount={cartItemCount} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/menu"
          element={<MenuPage addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <ShoppingCartPage
              cart={cart}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              clearCart={clearCart}
            />
          }
        />
        <Route path="/reservations" element={<ReservationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
