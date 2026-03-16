//-----------------------------------------------Menu Items-----------------------------------------------------//
//B3. Price Formatting
const money = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});

//B1. Menu Data
const MENU_ITEMS = [
  {Id: 1, Name: "Leon's Big Brother Bento", Description: "Crispy fried pork katsu made with japanese pank crumbs.", Price: 13.99, Category: "Lunch"},
  {Id: 2, Name: "Remi's Flaming Hot Bento", Description: "Savory grilled beef seasoned with teriyaki and paired cucumbers.", Price: 12.99, Category: "Lunch"},
  {Id: 3, Name: "Donnie's Baby Brother Bento", Description: "A mix of his Leon and Remi's bento. Half Crispy fried pork katsu and half grilled beef.", Price: 15.99, Category: "Lunch"},
  {Id: 4, Name: "Shrimp Yakisoba Bento", Description: "Grilled garlic shrimp served over egg noodles with teriyaki seasoning.", Price: 13.99, Category: "Lunch"},
  {Id: 5, Name: "Tomato Tofu Bento", Description: "Succulent soft tofu simmered together with sweet tomatoes. Garnished with chives.", Price: 11.99, Category: "Lunch"},
  {Id: 6, Name: "Chicken Teriyaki Bento", Description: "Grilled chicken thighs seasoned in sweet teriyaki sauce.", Price: 12.99, Category: "Lunch"},
  //Breakfast
  {Id: 7, Name: "Three Brothers Breakfast Bento", Description: "Comfort Food at its finest. SPAM, a fried egg and portuguese sausage over a bed a rice.", Price: 11.99, Category: "Breakfast"},
  {Id: 8, Name: "Bento Burrito", Description: "Bento on the go! Options of pork katsu or beef with rice and fried carrots, rolled into a seaweed wrapped burrito", Price: 10.99, Category: "Breakfast"},
  //Dinner
  {Id: 9, Name: "Steak Special Platter", Description: "Grilled wagyu and shiitake mushrooms paired with a bowl of rice. Includes miso soup and fried tempura.", Price: 19.99, Category: "Dinner"},
  {Id: 10, Name: "Big Butterfish Platter  ", Description: "Miso narinated black cod grilled to buttery perfection. Served with a bowl of flavorful purple rice, miso soup and fried tempura", Price: 21.99, Category: "Dinner"}
]

//B2. DOM Rendering
function createTable(){
  const table = document.createElement("table");

  //Make headers
  const headerRow = document.createElement("tr");
  Object.keys(MENU_ITEMS[0]).forEach(key => {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  //Make rows
  MENU_ITEMS.forEach(item => {
    const row = document.createElement("tr");
    Object.entries(item).forEach(([key,value]) => {
      const td = document.createElement("td");
      if(key === "Price"){
        td.textContent = money.format(value)
      }
      else{
        td.textContent = value;
      }
      row.appendChild(td);
    });
    table.appendChild(row);
  });
  const menuElement = document.getElementById("menu");
  if(menuElement){
    document.getElementById("menu").appendChild(table);
  }
  console.log(document.getElementById("menu"));
}
createTable();

//-----------------------------------------------Reservation Items-----------------------------------------------------//
//C3. uses appendAlert to create new div with html that has bootstrap class based on message type (danger - success)
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

const form = document.getElementById("reservation-form");

// create variables from user input on webpage
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


    //C4.  turn that data in to an object
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

    //C2. validate form
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // C4. console log the object.
    console.log(JSON.stringify(newReservation));
    appendAlert(reserveName.value + " your reservation for "+ reservePartSize.value + " at " + reserveTime.value + " on " + reserveDate.value.toString() + " has been submitted! We will see you soon!", "success");
  })

}
