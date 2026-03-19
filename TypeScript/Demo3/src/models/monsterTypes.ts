export interface Monster{
  firstName: string;
  lastName?: string; //question mark makes it optional.
  age: number;
  type: "Human"|"Blob"| "Undead";
  moreInfo: string;

}

export interface SuperMonster extends Monster{
  powerLevel: number;
}
