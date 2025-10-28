'use strict';

const express = require('express');
const morgan = require('morgan');
const { check, validationResult, } = require('express-validator');

const cors = require('cors');
const corsOptions = {
  origin: ['http://127.0.0.1:5173','http://localhost:5173'],
  credentials: true,
};

const { expressjwt: jwt } = require('express-jwt');
const jwtSecret = "7bd77a2d85430884b62a3670e3a2a36859b983d9f59dd8c7e08d5f456fbfe16e";

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.use(jwt({secret: jwtSecret, algorithms: ["HS256"]}));
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({error: "Unauthorized to get estimations"});
  }
  else {
    next();
  }
});
const port = 3002;

/**** Estimation API ****/
app.post('/api/estimations', 
  [
    check('tickets').isArray().withMessage('Must provide an array of tickets'),
    check('tickets.*.title').notEmpty().withMessage('Title cannot be empty'),
    check('tickets.*.id').isInt({min: 1}).optional(),
    check('tickets.*.category').isIn(['inquiry','maintenance', 'new feature', 'administrative', 'payment']).withMessage('Invalid category')
  ],(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0].msg});
    }

    const isAdmin = req.auth.admin;
    const tickets = req.body.tickets;
    const estimations = [];
    let totCharacters, estimatedHours;
    for (const t of tickets) {
      totCharacters = t.title.replace(/\s+/g,'').length + t.category.replace(/\s+/g,'').length;
      estimatedHours = totCharacters*10 + Math.floor(Math.random()*240) + 1;
      estimations.push({id: t.id, estimation: isAdmin ? estimatedHours+" hours" : Math.round(estimatedHours/24)+" days"});
    }

    res.json(estimations);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
