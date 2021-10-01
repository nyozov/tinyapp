const bcrypt = require('bcryptjs');

//this is used to generate userID and shortURL
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
 
  }
  return result;
};

//this finds matching email, there are chai tests for this
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

//this returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id,db) {
  let matchingID = {};
  for (let key in db) {
    if (db[key].userID === id) {
      matchingID[key] = db[key];
    }
  }
  return matchingID;
};

module.exports = {generateRandomString, findUserByEmail, authenticateUser, urlsForUser};