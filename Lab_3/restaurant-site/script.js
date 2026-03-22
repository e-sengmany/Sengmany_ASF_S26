//-----------------------------------------------Menu Items-----------------------------------------------------//
//Price Formatting
const money = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
const tax = .08;

//Menu Sections
const lunchSection = document.getElementById("lunchSection");
const breakfastSection = document.getElementById("breakfastSection");
const dinnerSection = document.getElementById("dinnerSection");

//Menu Data
const MENU_ITEMS = [
  {Id: 1, Name: "Leon's Big Brother Bento", Description: "Crispy fried pork katsu made with japanese panko crumbs.", Price: 13.99, Category: "Lunch", Image: "./images/katsu_bento.png"},
  {Id: 2, Name: "Remi's Flaming Hot Bento", Description: "Savory grilled beef seasoned with teriyaki and paired cucumbers.", Price: 12.99, Category: "Lunch", Image: "./images/beef_bento.png"},
  {Id: 3, Name: "Donnie's Baby Brother Bento", Description: "A mix of his Leon and Remi's bento. Half Crispy fried pork katsu and half grilled beef.", Price: 15.99, Category: "Lunch", Image: "./images/baby_bento.png"},
  {Id: 4, Name: "Shrimp Yakisoba Platter", Description: "Grilled garlic shrimp served over egg noodles with teriyaki seasoning.", Price: 13.99, Category: "Lunch", Image: "./images/shrimp_yakisoba.jpg"},
  {Id: 5, Name: "Tomato Tofu Bowl", Description: "Succulent soft tofu simmered together with sweet tomatoes. Garnished with chives.", Price: 11.99, Category: "Lunch", Image: "./images/tomato_tofu.jpg"},
  {Id: 6, Name: "Chicken Teriyaki Bento", Description: "Grilled chicken thighs seasoned in sweet teriyaki sauce.", Price: 12.99, Category: "Lunch", Image: "./images/chicken_teriyaki.jpg"},
  //Breakfast
  {Id: 7, Name: "Three Brothers Breakfast Bento", Description: "Comfort Food at its finest. SPAM, a fried egg and portuguese sausage over a bed a rice.", Price: 11.99, Category: "Breakfast", Image: "./images/breakfast_bento.png"},
  {Id: 8, Name: "Bento Burrito", Description: "Bento on the go! Options of pork katsu or beef with rice and fried carrots, rolled into a seaweed wrapped burrito", Price: 10.99, Category: "Breakfast", Image: "./images/bento_burrito.png"},
  //Dinner
  {Id: 9, Name: "Steak Special Platter", Description: "Grilled wagyu and shiitake mushrooms paired with a bowl of rice. Includes miso soup and fried tempura.", Price: 19.99, Category: "Dinner", Image: "./images/wagyu_steak.png"},
  {Id: 10, Name: "Big Butterfish Platter", Description: "Miso marinated black cod grilled to buttery perfection. Served with a bowl of flavorful multigrain rice, miso soup and fried tempura", Price: 21.99, Category: "Dinner", Image: "./images/butterfish.jpg"},
  {Id: 11, Name: "Avocado Toast", Description: "The perfect light breakfast. Avocados with truffle oil, served over a slice of locally made artisan multigrain bread.", Price: 21.99, Category: "Breakfast", Image: "./images/avocado_toast.jpeg"},
  {Id: 12, Name: "Eggplant Steak Platter", Description: "Thick slices of eggplants, seasoned and grilled. Served with a bowl of rice.", Price: 21.99, Category: "Dinner", Image: "./images/eggplant.jpg"}
];
//So there is no DOM conflicts.
document.addEventListener("DOMContentLoaded", () => {
  initPage();
});

function initPage() {
  //MENU PAGE
  console.log("Init running");
  if (document.getElementById("cardsContainerLunch")){
    renderMenu(MENU_ITEMS);
    console.log("Menu detected");
  }
  //CART PAGE
  if(document.getElementById("cart_container")){
    displayCart();
    console.log("Cart detected");
  }
  //RESERVATION PAGE
  if (document.getElementById("reservation-form")){
    setupReservationForm();
  }

}
//-----------------------------------------------Reservation Items-----------------------------------------------------//

const alertPlaceholder = document.getElementById("alert-placeholder");
const appendAlert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')
  alertPlaceholder.append(wrapper)
}


function setupReservationForm() {
  const form = document.getElementById("reservation-form");
  if(form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let reserveName = document.getElementById("name");
      //cant be longer than 20 characters.
      reserveName.setAttribute("required", "required");
      if(reserveName.value.length > 20 || reserveName.value.length < 1){
        //need a warning of something
        appendAlert("Please enter a name. Cannot be over 20 letters.", "danger");
      }
      let reserveEmail = document.getElementById("email");
      reserveEmail.setAttribute("required", "required");
      if(!reserveEmail.value.includes("@")|| !reserveEmail.value.includes(".")){
        appendAlert("Please enter a valid email address.", "danger");
      }
      let reserveDate = document.getElementById("date");
      const today = new Date().toISOString().split("T")[0];
      reserveDate.required = true;
      reserveDate.min = today;
      if(reserveDate.value < today){
        appendAlert("Please select a future date.", "danger");
      }
      let reserveTime = document.getElementById("time");
      reserveTime.setAttribute("required", "required");
      if(reserveTime.value < new Date().toISOString().split("T")[1].split(":")[0]){
        appendAlert("Please select a future time.", "danger");
      }
      let reserveSeating = document.querySelector('input[name="seating"]:checked');
      if (!reserveSeating) {
        appendAlert("Please select a seating option.", "danger");
      }

      let reserveDietary = document.getElementById("dietary").value;
      let reserveOptIn = document.getElementById("opt_in").checked;
      let reservePartSize = document.getElementById("size");
      reservePartSize.setAttribute("required", "required");
      if(!reservePartSize.value){
        appendAlert("Please select a party size.", "danger");
      }

      let newReservation = {
        Name: reserveName.value,
        Email: reserveEmail.value,
        Date: reserveDate.value,
        Time: reserveTime.value,
        Seating: reserveSeating?.value,
        Dietary: reserveDietary,
        OptIn: reserveOptIn,
        PartSize: reservePartSize.value
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      console.log(JSON.stringify(newReservation));
      appendAlert(reserveName.value + " your reservation for "+ reservePartSize.value + " at " + reserveTime.value + " on " + reserveDate.value.toString() + " has been submitted! We will see you soon!", "success");
    })

  }

}
// P1. Add Category Filter
function filterByCategory(category) {
  if (category === "All") {
    renderMenu(MENU_ITEMS);
  } else {
    const filtered = MENU_ITEMS.filter(item => item.Category === category);
    renderMenu(filtered);
  }
}

//changed Menu to cards instead of a table.
function renderMenu(data) {
  if (!cardsContainerLunch || !cardsContainerBreakfast || !cardsContainerDinner) return;
  cardsContainerLunch.innerHTML = "";
  cardsContainerBreakfast.innerHTML = "";
  cardsContainerDinner.innerHTML = "";

  data.forEach((menu) => {
    const content = `
      <div class="card item">
        <div class="card-header">
          <img src="${menu.Image}" class="cardImage card">
        </div>
        <div class="card-body">
          <h5>${menu.Name}</h5>
          <p>${menu.Description}</p>
          <p>${money.format(menu.Price)}</p>



<!--P2. Add Cart Functionality-->
        <div class="d-flex align-items-center card bottom-wrap ">
          <div class="justify-content-center">
             <button style="width: 150px" onclick="addToCart(${menu.Id}, this)" class="btn btn-primary card align-items-center"> Add to Cart </button>
          </div>
          <div class="justify-content-center input-group quantity-selector me-3" style="width: 100px;">
            <button class="btn btn-outline-secondary " type="button" onclick="changeQuantity(this, -1)">
                <i class="bi bi-dash"></i> - </button>
            <input type="text" class="form-control text-center" value="1" min="1" id="productQuantity" aria-label="Product quantity">
            <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(this, 1)">+
                <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (menu.Category === "Lunch") {
      cardsContainerLunch.innerHTML += content;
    } else if (menu.Category === "Breakfast") {
      cardsContainerBreakfast.innerHTML += content;
    } else if (menu.Category === "Dinner") {
      cardsContainerDinner.innerHTML += content;
    }
  });
  // hide if not used
  lunchSection.style.display =
    cardsContainerLunch.innerHTML.trim() === "" ? "none" : "block";

  breakfastSection.style.display =
    cardsContainerBreakfast.innerHTML.trim() === "" ? "none" : "block";

  dinnerSection.style.display =
    cardsContainerDinner.innerHTML.trim() === "" ? "none" : "block";

  console.log("Lunch:", cardsContainerLunch);

}
function changeQuantity(button, delta) {
  // Find the input field relative to the clicked button
  const input = button.closest('.card-body').querySelector('input');
  let currentValue = parseInt(input.value);

  // Ensure value is a number and apply the change
  if (!isNaN(currentValue)) {
    let newValue = currentValue + delta;
    if (newValue >= 1) {
      input.value = newValue;
    }
  }
}
//array to hold cart items or check if there is already one.
let cart = JSON.parse(localStorage.getItem('userCart')) || [];
function addToCart(productId, button) {
  const product = MENU_ITEMS.find(item => item.Id === productId);

  const input = button.closest('.card-body').querySelector('input');
  const quantity = Number(input.value);

  if (quantity > 0) {
    const existingItem = cart.find(item => item.Id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        Id: product.Id,
        name: product.Name,
        price: product.Price,
        quantity: quantity

      });
    }

    localStorage.setItem('userCart', JSON.stringify(cart));
  }
}
// P3. Create cart page
function displayCart() {

  const cart = JSON.parse(localStorage.getItem('userCart')) || [];
  const container = document.getElementById('cart_container');
  const totalElement = document.getElementById('cart_total');
  if (!container || !totalElement) return;
  // 2. Clear current content in case of refresh
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalElement.innerHTML = '';
    return;
  }

  let grandTotal = 0;
  //Loop through cart items and create HTML strings
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;

    grandTotal += itemTotal;
    console.log("ITEM:", item);
    const itemHtml = `
            <div class="_item">
                <span>${item.name}</span> -
                <span>$${item.price.toFixed(2)}</span> x
                <span>${item.quantity}</span> =
                <span>$${itemTotal.toFixed(2)}</span>
                <button class="remove" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    container.insertAdjacentHTML('beforeend', itemHtml);
    console.log("HTML NOW:", container.innerHTML);
    const clearBtn = document.getElementById("clear-cart-btn");
    const submitBtn = document.getElementById("submit-cart-btn");
    if (clearBtn) {
      clearBtn.disabled = cart.length === 0;
    }
  });

  // Display the grand total
    const calculatedTex = grandTotal*tax;
    const finalPrice = grandTotal + tax;
    totalElement.innerHTML = `
<h3>Subtotal: $${grandTotal.toFixed(2)}</h3>
<h3>Taxes: $${calculatedTex.toFixed(2)} </h3>
<h2>Grand Total: $${finalPrice.toFixed(2)}</h2>`;
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('userCart')) || [];

  // Remove the item at the specific index
  cart.splice(index, 1);

  // Save the updated array back to localStorage
  localStorage.setItem('userCart', JSON.stringify(cart));

  // Refresh the display
  displayCart();

}

// P3. Submit and Cancel Buttons
function showCustomConfirm(message) {
  const modal = document.getElementById('confirmModal');
  const messageEl = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  messageEl.textContent = message;
  modal.showModal(); // Opens the dialog as a modal

  return new Promise((resolve) => {
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modal.close();
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

async function clearCart() {
  const isConfirmed = await showCustomConfirm("Are you sure you want to clear your cart?");
  await showCustomConfirm("Thank you!");
  if (isConfirmed) {
    localStorage.removeItem('userCart');
    cart = [];
    displayCart();

    window.location.href = "menu.html";
  }
}

async function submitOrder() {
  const isConfirmed = await showCustomConfirm("Thank you! Your order will be completed shortly!");

  if (isConfirmed) {
    localStorage.removeItem('userCart');
    cart = [];
    displayCart();
  }
}
