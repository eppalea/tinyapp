const emailChecker = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    } 
  return false;
  }
};

module.exports = emailChecker();