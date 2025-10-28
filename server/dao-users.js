'use strict';

const sqlite = require('sqlite3');
const db = new sqlite.Database('./ticketing_db.db', (err) => {
  if (err) throw err;
});
const crypto = require('crypto');

// Retrieve user information from an ID
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id=?';
      db.get(sql, [id], (err, row) => {
        if (err)
          reject(err);
        else if (row === undefined)
          resolve({ error: 'User not found.' });
        else {
          const user = { id: row.id, username: row.name, admin: row.admin }
          resolve(user);
        }
      });
    });
};

// Verify login credentials 
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE name=?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          resolve(false);
        }
        else {
          const user = { id: row.id, username: row.name, admin: row.admin };
          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { 
            if (err) 
                reject(err);
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
              resolve(false);
            else
              resolve(user);
          });
        }
      });
    });
};