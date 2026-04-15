import {useState} from "react";

//user types in input, click button to see password.

const App = () => {

  // example of how we can use this to input multiple values. Below is setting data field to initial values
  // const person = {
  //   fname:"",
  //   lname:"",
  //   age:24
  // }
  // const [inputType, setInputType] = useState(person)

  //useState returns an array of two elements
  // 1) the actual variable with an initial value
  // 2) function that changes state
  const [inputType, setInputType] = useState(false)

  const handleClick =(event) =>{
    event.preventDefault()
    let result = !inputType
    setInputType(result)
    console.log("Clicked!!!")
  }
  return(
    <>
    <h1>I am the App</h1>
    <form action="">
      <label htmlFor=""> Password
        <input type ={inputType ?"text":"password"}/>
      </label>
      <button className="show"
      onClick={handleClick}
      >
        Show/Hide</button>

    </form>
    </>
  )
}

export default App;
