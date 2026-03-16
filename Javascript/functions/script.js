function stuff(){
  console.log("stuff")
}
stuff()

function stuff2(age){
  return age + 10;
}

let result = stuff2(10)
console.log(result)

function stuff3(age, name, winner){
  return `${name} is ${age} years old and won${winner? "":"not"} the lottery!`
}

console.log(stuff3(20, "Jake", true))


let nameOfFunction = (name, age, winner) => {
  return `${name} is ${age} years old and won${winner? "":"not"} the lottery!`
}
console.log(nameOfFunction("Jake", 20, true))


//example of an anonymous function
// (function(){
//   console.log("I am a function")
// }())
//
// function doggy(){
//   return "woof"
// }
// doggy()
// let kittyCat = function(stuff, things){
//   return "meow"
// }
// kittyCat()

let squared = function(num) {
  return num * num
}
console.log(squared(5))

let square = (num) =>{
  return num*num
}
console.log(square(6))

let squares = num => num * num
console.log(squares(7))


let square4 = num => {
  num = num + num
  return num}

console.log(square4(8))

let canYouDrink = (age) => age >= 21 ? "Congrats!" : "No alcohol for you"
console.log(canYouDrink(21))
console.log(canYouDrink())
