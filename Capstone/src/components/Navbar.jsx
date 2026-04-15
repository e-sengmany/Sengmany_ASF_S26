import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function NavBar({ cartItemCount }) {
  return (
    <ul className={"d-flex list-unstyled sticky-top"}>
      <li className={"p-2"}>
        <Link to="/">
          <img
            src={"../src/assets/3BB.png"}
            className={"list-inline-item"}
            alt="logo"
            style={{ inlineSize: "200px" }}
          />
        </Link>
      </li>

      <li className={"p-2"}>
        <Link to="/" className={"nav"}>
          Home
        </Link>
      </li>

      <li className={"p-2"}>
        <Link to="/menu" className={"nav"}>
          Menu
        </Link>
      </li>

      <li className={"p-2"}>
        <Link to="/reservations" className={"nav"}>
          Reservation
        </Link>
      </li>

      <li className={"p-2"}>
        <Link to="/cart" className={"nav"}>
          Shopping Cart ({cartItemCount})
        </Link>
      </li>
    </ul>
  );
}

export default NavBar;
