import { useState } from 'react'
import SecondComponent from "./components/SecondComponent.jsx"
import {theStuff, aNum} from "./utils/data.js"



//App components
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>My Component</h1>
      <SecondComponent data = {"Coolest Beans"}
                       thing={"stuff"}
                       whatever={"dude"}
                       anArray ={theStuff}
      />
    </>
  )
}

export default App
