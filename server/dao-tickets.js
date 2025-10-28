'use strict';

const dayjs = require('dayjs');
const sqlite = require('sqlite3');
const db = new sqlite.Database('./ticketing_db.db', (err) => {
  if (err) throw err;
});


/****Blocks****/

exports.listComments = (ticketId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT c.id, name, text, timestamp
            FROM comments c INNER JOIN users u ON c.author = u.id
            WHERE c.ticket = ?
            ORDER BY timestamp ASC`;
        db.all(sql, [ticketId], (err, rows) => {
            if (err) {
                reject(err);
            }
            const blocks = rows.map((e) => ({
                id: e.id, author: e.name, text: e.text, timestamp: e.timestamp
            }));
            resolve(blocks);
        });
    });
};

exports.addComment = (user, ticketId, comment) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM tickets WHERE id = ? AND state = 'open'`;
        db.get(sql, [ticketId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row == undefined) {
                resolve({error: 'Cannot add comments to this ticket'});
            }
            else {
                sql = `INSERT INTO comments (ticket, text, author, timestamp)
                    VALUES (?, ?, ?, ?)`;
                db.run(sql, [ticketId, comment.text, user.id, dayjs().format("YYYY-MM-DDTHH:mm:ss")], function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(this.lastID);
                });
            }
        });
    });
};

/****Tickets****/

exports.listTickets = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT t.id, owner, name, title, state, category, timestamp
            FROM tickets t INNER JOIN users u ON u.id = t.owner
            ORDER BY timestamp DESC`;
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err); 
            }
            const tickets = rows.map((e)=>({
                ticketId: e.id, ownerId: e.owner, owner: e.name, 
                title: e.title, state: e.state, category: e.category, 
                date: e.timestamp}));
            resolve(tickets);
        });
    });
};

exports.addTicket = (user, ticket) => {
    return new Promise((resolve, reject) => {
        const timestamp = dayjs().format("YYYY-MM-DDTHH:mm:ss");
        let sql = `INSERT INTO tickets (owner, title, state, category, timestamp)
            VALUES (?, ?, 'open', ?, ?)`;
        db.run(sql, [user.id, ticket.title, ticket.category, timestamp], function (err) {
            if (err) {
                reject(err);
            }
            else {
                const newTicketId = this.lastID;
                sql = `INSERT INTO comments (ticket, text, author, timestamp)
                    VALUES (?, ?, ?, ?)`;
                db.run(sql, [newTicketId, ticket.text, user.id, timestamp], function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(this.lastID);
                });                
            }
        });
    });
};

exports.closeTicket = (user, ticketID) => {
    return new Promise((resolve, reject) => {
        if (user.admin === 1) {
            const sql = `UPDATE tickets SET state = 'closed' WHERE id = ?`;
            db.run(sql, [ticketID], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes !== 1) {
                    resolve({error: 'Ticket not found'});
                }
                else {
                    resolve(this.changes);
                }
            });
        }
        else {
            let sql = `UPDATE tickets SET state = 'closed' WHERE id = ? AND owner = ?`;
            db.run(sql, [ticketID, user.id], function (err) {
                if (err) {
                    reject(err);
                }
                else if (this.changes !== 1) {
                    sql = `SELECT * FROM tickets WHERE id = ?`;
                    db.get(sql, [ticketID], (err, row) => {
                        if (err) {
                            reject(err);
                        }
                        else if (row == undefined) {
                            resolve({error: 'Ticket not found'});
                        }
                        else {
                            resolve({error: 'Unauthorized'});
                        }
                    });
                }
                else {
                    resolve(this.changes);
                }
            });
        }
    });
};

exports.openTicket = (ticketID) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tickets SET state = 'open' WHERE id = ?`;
        db.run(sql, [ticketID], function (err) {
            if (err) {
                reject(err);
            }
            else if (this.changes !== 1) {
                resolve({error: 'Ticket not found'});
            }
            else {
                resolve(this.changes);
            }
        });
    });
};

exports.changeTicketCategory = (ticketID, newCategory) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tickets SET category = ? WHERE id = ?`;
        db.run(sql, [newCategory, ticketID], function (err) {
            if (err) {
                reject(err);
            }
            else if (this.changes !== 1) {
                resolve({error: 'Ticket not found'});
            }
            else {
                resolve(this.changes);
            }
        });
    });
};