import { useState } from "react";
import { MENU_ITEMS } from "../src/utils/menu.js";
import Container from "react-bootstrap/Container";
import {Col, Row} from "react-bootstrap";

export default function MenuPage({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [heartedItemId, setHeartedItemId] = useState(null);

  const categories = ["All", ...new Set(MENU_ITEMS.map(item => item.Category))];

  const filteredItems =
    selectedCategory === "All"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.Category === selectedCategory);
  function handleAddToCart(item) {
    addToCart(item);
    setHeartedItemId(item.Id);

    setTimeout(() => {
      setHeartedItemId(null);
    }, 800);
  }

  return (
    <Container className="mt-4">
      <Row className="card mb-3">
        <p> Welcome to the Three Brothers Bento Bistro! We offer a variety of delicious bento boxes carefully crafted by Chefs Leon, Remi and Donnie. </p>
        <p>Our bento boxes are made with the freshest ingredients and are served with a side of rice, california rolls
          and pot stickers. We hope you enjoy our bento boxes!</p>

      </Row>
      <Row className="mb-3">
        <Col className="text-center">
          <ul className="d-flex justify-content-center list-unstyled flex-wrap">
            {categories.map((category) => (
              <li className="p-2" key={category}>
                <button
                  className={`nav ${
                    selectedCategory === category ? "active-category" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </Col>
      </Row>

      <Row className="g-3">
        {filteredItems.map((item) => (
          <Col xs={12} sm={6} md={3} key={item.Id}>
            <div className="card h-100">
              <div className="heart-layer">
                {heartedItemId === item.Id && (
                  <span className="floating-heart">♥</span>
                )}
              </div>
              <img
                src={item.Image}
                className="card-img-top"
                alt={item.Name}
                style={{height: "250px", objectFit: "cover"}}
              />

              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.Name}</h5>
                <p className="card-text">{item.Description}</p>
                <p className="fw-bold">${item.Price.toFixed(2)}</p>

                <button
                  className="btn mt-auto nav cart_add"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>

  );
}
