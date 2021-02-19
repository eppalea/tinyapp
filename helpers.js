const emailChecker = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      console.log("the return is:", database[user])
      return database[user];
    } 
  return false;
  }
};


const urlsForUser = function(urlDatabase, id) {
  let userSpecificURLDatabase = {};
  console.log("the urlDatabase is: ", urlDatabase);
  for (const shortURL in urlDatabase) {
    // console.log("the shortURL is: ", shortURL);
    // console.log("the url db userid is: ", urlDatabase[shortURL].userID)
    // console.log("this is id: ", id);
    if (urlDatabase[shortURL].userID === id) {
      userSpecificURLDatabase[shortURL] = urlDatabase[shortURL];
      // console.log("the user specific db key is:" ,userSpecificURLDatabase[shortURL]);
    }
  }
  return userSpecificURLDatabase;
};

module.exports = { emailChecker, urlsForUser };