import React from 'react';
import Container from "react-bootstrap/Container";

const HomePage = () => {
  return (
    <Container>
      <h1 className="card">
        We are a small family owned restaraunt, who want to share our love of food with everyone else. The three chefs
        are Leon, Remi and Donnie. Which is
      </h1>
      <img src="../src/assets/Hero.jpeg" alt="Meet the Chefs" id="hero" className="center" style={{marginRight: "auto", marginLeft:"auto"}}/>
      <p className="card">Welcome to our Bistro! We hope our love for cooking makes your day an even better one! Please click on the menu icon to see our dishes</p>
    </Container>
  );
};

export default HomePage;
