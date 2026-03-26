

function isPalindrome(input){

  //if not a string
  if (typeof input !== "string") return 0;

  // if empty
  if (input.trim() === "") return 0;

  // Palindrome test

  //Clean input, change to lower case and remove anything besides letters
  const cleanedString = input.toLowerCase().replace(/[^a-z]/g,'');

  //Establish start and end
  let left = 0;
  let right = cleanedString.length-1;

  //check if the ends match, if at anytime they done return 0;
  while(left <= right){
    if (cleanedString[left] !== cleanedString[right]){
      console.log("Mismatch!");
      return 0;
    }
    left++;
    right--;
  }
  //word has successfully been iterated through and is a palindrome.
  return 1;
}

module.exports = isPalindrome;
