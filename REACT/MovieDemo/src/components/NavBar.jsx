import React from 'react';

const NavBar = () => {
  return (
    <ul>

      <li><a href={"/landing"}>Landing </a></li>
      <li><a href={"/results"}>Results </a></li>
      <li><a href={"/errors"}>Errors </a></li>

    </ul>
  );
};

export default NavBar;
