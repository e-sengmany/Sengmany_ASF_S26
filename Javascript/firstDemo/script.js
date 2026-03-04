// console.log("My first javascript file ");

// var name = "Sengmany";
// let age = 35;
// const VERB = 'jump'

// var name = "Sengmany";
// {
//   name = "Eric"
// }
//
// console.log(name);
// displayed Sengmany because var is global.

// let name = "Sengmany";
// {
//   let name = "Eric"
// }
// console.log(name);
// since we used let in the inner braces it only exists in the inner braces

// let num = 12
// let isMarried = true
// console.log(typeof num)
// console.log(typeof isMarried)

//The following is a browser only method
// let answer = prompt("What is your name?");
// console.log("Hello" + answer);

//This  opens a prompt box for user input.

// let answer = prompt("how old are you?");
// //answer = Number(answer)
// answer = parseInt(answer)
// if(isNaN(answer)) {
//   answer = 0
//   console.log("you are not a number")
// }
// else {
//   console.log("you are " + answer + " years old")
// }
// console.log(typeof answer);
// console.log(Number("blah"))
//
// let count = 1
// count++ // post increment, same as count = count + 1
// ++count //pre increment, same as
// count += count // same as count = count + count
//

// let result = prompt("What is your favorite food?")
// //let sentence = "i love " + result
//
// let age = 22
// let sentence = `I love ${result} and I am ${age > 21 ? "old enough to drink": "not old enough to drink"}`
// console.log(sentence)
// //
// if(age > 21){
//   console.log("You are old enough to drink")
// }
// else{
//   console.log("You are not old enough to drink")
// }

//ternary operators
//age > 21 ? console.log("You are old enough to drink") : console.log("You are not old enough to drink")
//does exactly the same thing as the above if else statement

// DATES
const d = new Date()
console.log(d)
let day = d.getDay()
console.log(day)
let daysofWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
console.log(daysofWeek[day])
console.log(`Today is ${daysofWeek[day]}`)
let hh = d.getHours()
let mm = d.getMinutes()
let ss = d.getSeconds()
console.log(hh + ":" + mm + ":" + ss)
console.log(`The time is ${d.getHours()%12}:${d.getMinutes()}:${d.getSeconds()}`)
