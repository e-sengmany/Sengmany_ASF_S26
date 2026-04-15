
import './App.css'
import MainPage from "./components/MainPage.jsx";

const App = () => {

  const appStyle ={
    border: "blue solid 2px"
  }
  return (
    <>
      <header style={appStyle}> This is the header</header>
      <MainPage/>
    </>
  )
}

export default App
