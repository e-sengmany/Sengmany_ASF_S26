import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import AppModal from "../src/components/AppModal.jsx";

const ShoppingCartPage = ({
                            cart,
                            removeFromCart,
                            updateQuantity,
                            clearCart,
                          }) => {
  const navigate = useNavigate();

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    body: "",
    confirmText: "OK",
    cancelText: undefined,
    onConfirm: null,
  });

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.Price * item.quantity,
    0
  );
  const taxRate = .0825;
  const taxAmount = totalPrice * taxRate;
  const grandTotal = totalPrice + taxAmount;

  function closeModal() {
    setModalConfig((prev) => ({
      ...prev,
      show: false,
    }));
  }

  function showSubmitConfirmation() {
    setModalConfig({
      show: true,
      title: "Submit Order?",
      body: "Are you sure you want to submit this order?",
      confirmText: "Yes, Submit",
      cancelText: "No",
      onConfirm: () => {
        setModalConfig({
          show: true,
          title: "Thank You!",
          body: "Your order has been submitted successfully.",
          confirmText: "Back to Menu",
          cancelText: undefined,
          onConfirm: () => {
            clearCart();
            closeModal();
            navigate("/menu");
          },
        });
      },
    });
  }

  function showCancelConfirmation() {
    setModalConfig({
      show: true,
      title: "Cancel Order?",
      body: "Are you sure you want to cancel your order?",
      confirmText: "Yes, Cancel Order",
      cancelText: "No",
      onConfirm: () => {
        setModalConfig({
          show: true,
          title: "Thank You",
          body: "Your order has been cancelled.",
          confirmText: "Back to Menu",
          cancelText: undefined,
          onConfirm: () => {
            clearCart();
            closeModal();
            navigate("/menu");
          },
        });
      },
    });
  }
  return (
    <Container className="mt-4 card">
      <h2 className="text-center mb-4">Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          <Row className="g-3">
            {cart.map((item) => (
              <Col xs={12} key={item.Id}>
                <Card className="p-3">
                  <Row className="align-items-center">
                    <Col md={2}>
                      <img
                        src={item.Image}
                        alt={item.Name}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </Col>

                    <Col md={3}>
                      <h5>{item.Name}</h5>
                      <p className="mb-1">${item.Price.toFixed(2)} each</p>
                    </Col>

                    <Col md={3}>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-dark"
                          onClick={() => updateQuantity(item.Id, -1)}
                        >
                          -
                        </Button>

                        <span>{item.quantity}</span>

                        <Button
                          variant="outline-dark"
                          onClick={() => updateQuantity(item.Id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </Col>

                    <Col md={2}>
                      <p className="fw-bold mb-0">
                        ${(item.Price * item.quantity).toFixed(2)}
                      </p>
                    </Col>

                    <Col md={2}>
                      <Button
                        className={"nav"}
                        variant="danger"
                        onClick={() => removeFromCart(item.Id)}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <h4>Subtotal: ${totalPrice.toFixed(2)}</h4>
            <h4>Tax: ${taxAmount.toFixed(2)}</h4>
            <h4>Total: ${grandTotal.toFixed(2)}</h4>

            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button className={"nav"} variant="success" onClick={showSubmitConfirmation}>
                Submit Order
              </Button>

              <Button className={"nav"} variant="danger" onClick={showCancelConfirmation}>
                Cancel Order
              </Button>
            </div>
          </div>
        </>
      )}
      <AppModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
        body={modalConfig.body}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
      />
    </Container>
  );
};

export default ShoppingCartPage;
