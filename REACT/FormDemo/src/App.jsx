
import './App.css'
import {useState} from "react";

const App = () => {
  const initialData = {
    fname: "",
    password: "",
    age: 0
  }
  //established the object with initial values

  const [data, setData] =useState(initialData)
  //use this to be able to update the initial data with new values


  const handleChange = (e) => {
    //console.log("Change is triggered.", e) //made an event object e and logged it to see what console detected. In console, target: input. To get it would we use e.target.value
    // console.log(`${e.target.name}: ${e.target.value}`) //causes the console to log everything that it is changed to.
    setData({
      ...data, //we use the spread operator
      [e.target.name]: e.target.value
    })
    //e.target.name is in brackets because it is object notation so we use a variable
    console.log(data)
    //currently doesnt keep track of the most recent change, but when we submit it will send everything.
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    //stops the page from refreshing because that is the default for the submit button.
    console.log(data)

    //we need to get the data gathered from POST method in the form.
    let options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    }
    fetch(endpoint, options)
      .then(response)
      .then(parsedData)
      .catch(errors)

    setData(initialData)
  }

  return (
    <div>

      {/*with react we dont have an action. Have to control form inside the component first*/}
      <form onSubmit={handleSubmit} method={"POST"}>

        <br/>
        <label> First Name:
          <input
            type={"text"}
            onChange={handleChange}
            name={"fname"}
            //important because this becomes the key
            value={data.fname}
            autoComplete={"off"}
            required
            maxLength={3}
            //How many states would we need to keep track of? numInput + 1
          />
        </label>
        <br/>
        <label>Password:
          <input
            type={"password"}
            onChange={handleChange}
            name={"password"}
            value={data.password}
            pattern={"123"}
            minLength={3}
          />
        </label>
        <br/>
        <label>Age:
          <input
            type={"number"}
            onChange={handleChange}
            name={"age"}
            value={data.age}
            min={21}
            max={99}
          />
        </label>
        <br/>

        <button type={"submit"}> Submit </button>
        {/*currently refreshed on click, we will fix that with..*/}
        <br/>
        <button type={"reset"}> Reset </button>
      </form>
    </div>
  )
}

export default App
