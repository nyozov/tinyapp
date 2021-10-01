const bcrypt = require('bcryptjs');

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
 
  }
  return result;
};

const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};

const authenticateUser = function(email, password, users) {
  // retrieve the user from the db
  const userFound = findUserByEmail(email, users);
  // compare the passwords
  // password match => log in
  if (userFound && bcrypt.compareSync(password, userFound.hashedPassword)) {
    return userFound;
  }
  return false;
};

const urlsForUser = function(id,db) {
  //returns the URLs where the userID is equal to the id of the currently logged-in user.
  let matchingID = {};
  for (let key in db) {
    if (db[key].userID === id) {
      matchingID[key] = db[key];

    }
  }
  return matchingID;
};

module.exports = {generateRandomString, findUserByEmail, authenticateUser, urlsForUser};