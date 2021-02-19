const { assert } = require('chai');

const { emailChecker } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailChecker', function() {
  it('should return a user with valid email', function() {
    const user = emailChecker("user@example.com", testUsers)
    const expectedOutput = testUsers.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('non-existant email returns false', function() {
    const user = emailChecker("nouser@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});