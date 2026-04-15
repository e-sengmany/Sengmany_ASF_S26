import {useState,useEffect} from "react";
import {Col, Button, Image, NavDropdown, Nav, Container, Navbar} from "react-bootstrap";



const App = () => {
  //set up state
  const [imgPath,setImgPath] = useState("https://images.dog.ceo/breeds/husky/n02110185_5495.jpg");

  //useEffeect(callback, dependencies)
  useEffect(() => {
    let endpoint = "https://dog.ceo/api/breeds/image/random";
    fetch(endpoint)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error("error in response")
        }
      })
      .then(parseData=>{
        console.log(parseData.message)
        setImgPath(parseData.message)
        //WE CANNOT DO THIS BECAUSE WE CANNOT DIRECTLY MUTATE DATA
      })
      .catch(errors =>{
        console.error(errors) //We
      })

  }, [imgPath]);

  const handleClickForRandomImage = () => {
    console.log("Clicked!!!")
    let endpoint = "https://dog.ceo/api/breeds/image/random";
    fetch(endpoint)
      .then(response =>
    {
      if (response.ok) {
        return response.json()
      } else {
        throw Error("error in response")
      }
      })
      .then(parseData=>{
        console.log(parseData.message)
        setImgPath(parseData.message)
        //WE CANNOT DO THIS BECAUSE WE CANNOT DIRECTLY MUTATE DATA
      })
      .catch(errors =>{
        console.error(errors) //We
      })
  }
  const theStyles = {
    border: "3px solid black",
    borderRadius: "20px"
  }
  return(
    <>
      <Navbar expand="lg" className="bg-body-tertiary" style={theStyles}>
        <Container>
          <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    <h1>Dog Image Generator</h1>
    <button onClick={handleClickForRandomImage}>Click for Random Image</button>
      <Button variant="danger">Danger</Button>
      <Col xs={6} md={4}>
        <Image src={imgPath} thumbnail />
      </Col>

    </>
  )
}

export default App
