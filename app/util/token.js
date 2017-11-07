'use strict';

const jwt = require('jsonwebtoken');
const secret = require('../constants').TOKEN_SECRET;
const moment = require('moment');

export const createToken = (user) => {
    let now = moment().valueOf();
  let scopes;
  // Check if the user object passed in
  // has admin set to true, and if so, set
  // scopes to admin
  if (user.admin) {
    scopes = 'admin';
  }
  // Sign the JWT
  return jwt.sign(
    { id: user.id, scope: scopes, iat: now},
    secret,
    { algorithm: 'HS512'}
  );
};


export const decodeToken = (req, res) => {
    let payload = jwt.decode(req.query.token, secret);
    res(payload)
};

// module.exports = createToken;
