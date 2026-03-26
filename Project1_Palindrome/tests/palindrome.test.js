const isPalindrome = require('../src/isPalindrome');

describe("Palindrome", () => {

    describe("Input verification", () =>{

      test('returns 0 for an empty string', () => {
        expect(isPalindrome(" ")).toBe(0);
      });
git
      test('handles non-string input gracefully', () => {
        expect(isPalindrome(123)).toBe(0);
        expect(isPalindrome(null)).toBe(0);
        expect(isPalindrome(undefined)).toBe(0);
        expect(isPalindrome({})).toBe(0);
      });

    });

  describe("Palindrome checks", () =>{

    test('Non-Palindrome', () => {
      expect(isPalindrome("apple")).toBe(0);
    });

    test('Palindrome', () => {
      expect(isPalindrome("Racecar")).toBe(1);
    });

    test('Multi word palindrome', () => {
      expect(isPalindrome("Madam I'm Adam.")).toBe(1);
    });


  });


});
