import {useState} from "react";


function mainPage() {
  // future data for the user
  // const userSchema = object({
  //   userName: string(),
  //   password: string(),
  //
  // })

  //What are they doing? Register, navigate,
  const [action, setAction] = useState("default");



  //Main menu
  function mainMenu(){
    setAction("mainMenu");
  }

  // Start Land navigation
  function navigate(){
    setAction("navigate");

  }

  const pageStyling = {
    width: "100%",
    border: "red solid 2px",
    margin: "0 auto 0 auto"
  }

  return(
    <div style={pageStyling}>
      <h1> Land Navigation Demo</h1>
      <p> This is what we should see</p>


    </div>
  )

  }


export default mainPage;
