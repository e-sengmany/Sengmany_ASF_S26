let button = document.querySelector("button");
let img = document.getElementsByTagName
("img")[0]; //will return an array of imgs
img.setAttribute("src", "https://images.dog.ceo/breeds/husky/n02110185_5495.jpg");
button.addEventListener("click", () => {
    // console.log("Button clicked!");
  //Scaffolding

  let endpoint = "https://dog.ceo/api/breeds/image/random";
  fetch(endpoint) //AKA utilizing the endpoint, default is GET
    //we can put the URL into this but we want to break it up. So we can break up the url to get different outputs based on url
    //were error handling happens. Best to put it up front to help with troubleshooting.
    .catch(errors => {
      console.log(errors);
    })
    // .then(data => data.json()) essemtially this is equal to below
    .then(function(data){
      console.log(data);
      if (data.ok) {
        return data.json()
      }
      throw Error("Error fetching data")

    })
    .then(parsedData => {
      console.log(parsedData);
      img.setAttribute("src", parsedData.message);
      // img.src = parsedData.message;
    })


});
