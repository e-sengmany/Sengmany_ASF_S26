import {Monster, SuperMonster} from "./models/monsterTypes"

const monster1: SuperMonster = {
  firstName: "Dracula",
  age: 1000,
  type: "Undead",
  moreInfo: "Drinks human blood",
  powerLevel: 10000
};

const monster2: Monster = {
  firstName: "Blobbo",
  age: 3,
  type: "Blob",
  moreInfo: "absprb everything in sight"
}

const monster3: Monster = {
  firstName: "Alice",
  lastName: "Smith",
  age: 28,
  type: "Human",
  moreInfo: "Monster Researcher"
}

const monster4: SuperMonster = {
  firstName: "Alucard",
  age: 200,
  type: "Human",
  moreInfo: "Human with vampire blood.",
  powerLevel: 9999
}
console.log(monster1);
console.log(monster2);
console.log(monster3);
console.log(monster4);
