import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const ShoppingCartPage = ({
                            cart,
                            removeFromCart,
                            updateQuantity,
                            clearCart,
                          }) => {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.Price * item.quantity,
    0
  );
  const taxRate = .08;
  const taxAmount = totalPrice * taxRate;
  const grandTotal = totalPrice + taxAmount;
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
            <Button variant="danger" className="mt-2" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default ShoppingCartPage;
