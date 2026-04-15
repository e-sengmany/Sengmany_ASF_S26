import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";

export default function ReservationsPage() {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center mb-4">
        <Col xs={12} className="text-center">
          <h1 className="reservation">Make a Reservation with us!</h1>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8}>
          <Card className="p-3 text-center">
            <p className="mb-0">
              Please remember that reservations are request only and may change
              based on availability. Thank you for understanding and we hope to
              see you!
            </p>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mb-3">
        <Col xs={12} md={8}>
          <Alert variant="success" className="d-none">
            Reservation submitted successfully.
          </Alert>
          <Alert variant="danger" className="d-none">
            There was a problem submitting your reservation.
          </Alert>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="p-4">
            <Form>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First and Last Name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ex: email@blank.com"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="date">
                    <Form.Label>Reservation Date</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="time">
                    <Form.Label>Time</Form.Label>
                    <Form.Control type="time" />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Seating Preference</Form.Label>
                <div>
                  <Form.Check
                    inline
                    label="Inside"
                    name="seating"
                    type="radio"
                    value="inside"
                    id="inside"
                  />
                  <Form.Check
                    inline
                    label="Outside"
                    name="seating"
                    type="radio"
                    value="outside"
                    id="outside"
                  />
                  <Form.Check
                    inline
                    label="Bar"
                    name="seating"
                    type="radio"
                    value="bar"
                    id="bar"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="dietary">
                <Form.Label>Dietary Restrictions</Form.Label>
                <Form.Control as="textarea" rows={4} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="opt_in">
                <Form.Check
                  type="checkbox"
                  label="Join our newsletter?"
                  inline
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="size">
                <Form.Label>Party Size</Form.Label>
                <Form.Select defaultValue="">
                  <option value="" disabled>
                    Guests
                  </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-center gap-3">
                <Button variant="success" type="submit">
                  Submit
                </Button>
                <Button variant="warning" type="reset">
                  Reset
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
