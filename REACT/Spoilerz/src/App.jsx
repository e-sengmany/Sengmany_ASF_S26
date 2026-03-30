import React from "react";
import {NavBar} from "./component/NavBar.jsx";
import BlogPage from "./pages/BlogPage.jsx";

const App = () => {
  return(
    //parent container
    <>
      <NavBar />
      <h1> Spoilerz aka App Component</h1>
      <p>Bruce Willis is a ghost. </p>
      <BlogPage/>
    </>


  )
}
export default App;
