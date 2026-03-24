function wordCounter(input){
  if (input === "") return 0;
  if (typeof input !== "string") return 0;

  if (input.trim() === "") return 0;

  // return input.split(" ").length;
  const words = input.trim().split(/\s+/);
  return words.length;
}

module.exports = wordCounter;
