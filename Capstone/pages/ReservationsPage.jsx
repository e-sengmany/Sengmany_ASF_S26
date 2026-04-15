import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AppModal from "../src/components/AppModal.jsx";

const reservationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email"),
  date: yup
    .string()
    .required("Reservation date is required"),
  time: yup
    .string()
    .required("Reservation time is required"),
  seating: yup
    .string()
    .required("Please choose a seating preference"),
  dietary: yup
    .string()
    .max(250, "Dietary restrictions must be 250 characters or less"),
  optIn: yup.boolean(),
  size: yup
    .string()
    .required("Please select a party size"),
});

export default function ReservationsPage() {
  const [showReservationModal, setShowReservationModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: yupResolver(reservationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      date: "",
      time: "",
      seating: "",
      dietary: "",
      optIn: false,
      size: "",
    },
  });

  function onSubmit(data) {
    console.log("Reservation submitted:", data);
    setShowReservationModal(true);
    reset();
  }

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
          {isSubmitted && Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Please fix the highlighted fields and try again.
            </Alert>
          )}
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="p-4">
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First and Last Name"
                  isInvalid={!!errors.name}
                  {...register("name")}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ex: email@blank.com"
                  isInvalid={!!errors.email}
                  {...register("email")}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="date">
                    <Form.Label>Reservation Date</Form.Label>
                    <Form.Control
                      type="date"
                      isInvalid={!!errors.date}
                      {...register("date")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="time">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time"
                      isInvalid={!!errors.time}
                      {...register("time")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.time?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Seating Preference</Form.Label>
                <div>
                  <Form.Check
                    inline
                    label="Inside"
                    type="radio"
                    id="inside"
                    value="inside"
                    {...register("seating")}
                  />
                  <Form.Check
                    inline
                    label="Outside"
                    type="radio"
                    id="outside"
                    value="outside"
                    {...register("seating")}
                  />
                  <Form.Check
                    inline
                    label="Bar"
                    type="radio"
                    id="bar"
                    value="bar"
                    {...register("seating")}
                  />
                </div>
                {errors.seating && (
                  <div className="text-danger small mt-1">
                    {errors.seating.message}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="dietary">
                <Form.Label>Dietary Restrictions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  isInvalid={!!errors.dietary}
                  {...register("dietary")}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dietary?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 text-center" controlId="opt_in">
                <Form.Check
                  inline
                  type="checkbox"
                  label="Join our newsletter?"
                  {...register("optIn")}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="size">
                <Form.Label>Party Size</Form.Label>
                <Form.Select
                  isInvalid={!!errors.size}
                  {...register("size")}
                >
                  <option value="">Select party size</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.size?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-center gap-3">
                <Button className="send" type="submit">
                  Submit
                </Button>
                <Button
                  className="send"
                  type="button"
                  onClick={() => reset()}
                >
                  Reset
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
      <AppModal
        show={showReservationModal}
        onHide={() => setShowReservationModal(false)}
        title="Reservation Submitted"
        body="Thank you! Your reservation request has been received."
        confirmText="OK"
        onConfirm={() => setShowReservationModal(false)}
      />
    </Container>
  );
}
