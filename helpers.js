const emailChecker = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      console.log("the return is:", database[user])
      return database[user];
    } 
  return false;
  }
};

module.exports = { emailChecker };