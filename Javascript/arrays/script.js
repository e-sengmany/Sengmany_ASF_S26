let animals = ["cat", "dog", "bird"];
// console.log(animals);

// Keno adopted a new cat
//4 ways to alter an array by adding/deleting the first element.

//1. Append, means to add an element to the end of the array.
animals.push("cat2");
// console.log(animals);
//1b. pop, means to remove the last element from the array.
//animals.pop();
let unlovedAnimals = animals.pop();
//console.log(animals);
//console.log(unlovedAnimals);
//2. Prepend, means to add an element to the beginning of the array.
//3. Splice, means to add/remove elements from the middle of the array.
//4. Shift, means to remove the first element from the array.
animals.unshift("cat2");
// console.log(animals);
animals.shift();
// console.log(animals);

//new array
let houses = ["doghouse", "scratching post", "cage"]
// animals.push(houses)
// console.log(animals);
//created an array inside of an array. So the last element of animals is an array called houses.

//spread operator, adds to the array not create an array inside of an array like push.
let newArray = [ ...animals, ...houses]
console.log(newArray);

// ITERATORS
//FOR EACH, takes a function and loops through the array.
//Needs predicate, which is 'data' in this array.
// newArray.forEach(function(data){
//   console.log(data +"s")
// })

//map, takes a function and loops through the array.
//Needs predicate, which is 'data' in this array.
//map returns a new array.
let colors = ["red", "green", "blue"]

let result = colors.map(function(data){
  //difference between above is that we have to return something.
  return data + "s"
})
console.log(result);
console.log(result.length);
for (let i = 0; i < result.length; i++) {
  console.log(result[i]);
}

console.log(result.slice(0,result.length))

//filter, takes a function and loops through the array.
//Needs predicate, which is 'data' in this array. Because it needs matching conditions
//filter returns a new array.
let words = ["cat","house","mouse"]
result = words.filter(function(kitty){
  //return kitty.length > 4
  return kitty.slice(1, kitty.length) === "ouse"
  //returns elements that contains "ouse"
})
console.log(result);
