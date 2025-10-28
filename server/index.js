'use strict';

const express = require('express');
const morgan = require('morgan');
const { check, validationResult, } = require('express-validator');

const cors = require('cors');
const corsOptions = {
  origin: ['http://127.0.0.1:5173','http://localhost:5173'],
  credentials: true
};

const userDao = require('./dao-users');
const ticketDao = require('./dao-tickets');

// Passport initialization 
const passport = require('passport');
const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(async function(username, password, done) {
  const user = await userDao.getUser(username, password);
  if (!user)
    return done(null, false, 'Wrong username or password');
  return done(null, user);
}))
passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    })
});

const session = require('express-session');
const sessionOptions = {
  secret: "ad8054c9unguessablesecret2642dbdd",
  resave: false,
  saveUninitialized: false,
};

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = "7bd77a2d85430884b62a3670e3a2a36859b983d9f59dd8c7e08d5f456fbfe16e"; 
const jwtExpiration = 300;

// init express
const app = new express();
const port = 3001;

// Set up middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req,res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Unauthorized'});
}


/**** User and Authentication APIs ****/

// POST /api/sessions
// Perform the login and create a session
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        return res.status(401).json({ error: info});
      }
      req.login(user, (err) => {
        if (err)
          return next(err);
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// Check logged status of the user
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.end();
});

// DELETE /api/session/current
// Perform the logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});


/**** Token API ****/

// GET /api/token
// Get a token from the server
app.get('/api/token', isLoggedIn, (req, res) => {
  const payloadToSign = { user: req.user.id, admin: req.user.admin };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: jwtExpiration});

  res.json({token: jwtToken});
});


// Utilities
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return msg;
};


/**** Ticket APIs ****/

// GET /api/tickets
// Get the list of tickets
app.get('/api/tickets', (req, res) => {
  ticketDao.listTickets()
    .then(tickets => res.json(tickets))
    .catch(err => res.status(500).json({error: 'Database error'}));
});

// POST /api/tickets
// Create a new ticket [AUTHENTICATED ONLY]
app.post('/api/tickets', isLoggedIn,
  [
    check('title').not().isEmpty().withMessage('Title cannot be empty'),
    check('category').isIn(['inquiry','maintenance', 'new feature', 'administrative', 'payment']).withMessage('Invalid category'),
    check('text').not().isEmpty().withMessage('Text cannot be empty')
  ], (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    
    const ticket = {
      title: req.body.title,
      category: req.body.category,
      text: req.body.text
    };
    ticketDao.addTicket(req.user, ticket)
      .then(result => res.json(result))
      .catch(err => res.status(500).json({error: 'Database error'}));
  }
);

// PUT /api/tickets/:id/close
// Close a ticket [AUTHENTICATED ONLY]
app.put('/api/tickets/:id/close', isLoggedIn, 
  [check('id').isInt({min: 1}).withMessage('Invalid ticket ID')], (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    ticketDao.closeTicket(req.user, req.params.id)
      .then(result => {
        if (result.error === 'Ticket not found') {
          res.status(404).json(result);
        }
        else if (result.error === 'Unauthorized') {
          res.status(401).json(result);
        }
        else {
          res.json(result);
        }
      }).catch(err => {
        res.status(500).json({error: 'Database error: ' + err});
      });
});

// PUT /api/tickets/:id/open
// (Re)Open a ticket [ADMIN ONLY]
app.put('/api/tickets/:id/open', isLoggedIn, 
  [check('id').isInt({min: 1}).withMessage('Invalid ticket ID')], (req, res) => {
    if (!req.user.admin) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    ticketDao.openTicket(req.params.id)
      .then(result => {
        if (result.error) {
          res.status(404).json(result);
        }
        else {
          res.json(result);
        }
      }).catch(err => {
        res.status(500).json({error: 'Database error: ' + err});
      });
});

// PUT /api/tickets/:id/category
// Change the category of a ticket [ADMIN ONLY]
app.put('/api/tickets/:id/category', isLoggedIn, 
  [
    check('id').isInt({min: 1}).withMessage('Invalid ticket ID'),
    check('category').isIn(['inquiry','maintenance', 'new feature', 'administrative', 'payment']).withMessage('Invalid category')
  ],(req, res) => {
    if (!req.user.admin) {
      return res.status(401).json({error: 'Unauthorized'});
    }
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    ticketDao.changeTicketCategory(req.params.id, req.body.category)
      .then(result => {
        if (result.error) {
          res.status(404).json(result);
        }
        else {
          res.json(result);
        }
      }).catch(err => {
        res.status(500).json({error: 'Database error'});
      });
});


/**** Comments APIs ****/

// GET /api/tickets/:id/comments
// Get the comments of a ticket [AUTHENTICATED ONLY]
app.get('/api/tickets/:id/comments', isLoggedIn,
  [check('id').isInt({min: 1}).withMessage('Invalid ticket ID')], (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    ticketDao.listComments(req.params.id)
      .then(comments => res.json(comments))
      .catch(err => res.status(500).json({error: 'Database error: ' + err}));
  }
);

// POST /api/tickets/:id/comments
// Add a comment to a ticket [AUTHENTICATED]
app.post('/api/tickets/:id/comments', isLoggedIn,
  [
    check('id').isInt({min: 1}).withMessage('Invalid ticket ID'),
    check('text').not().isEmpty().withMessage('Text cannot be empty')
  ], (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()[0]});
    }
    
    const comment = {text: req.body.text};
    ticketDao.addComment(req.user, req.params.id, comment)
      .then(result => {
        if (result.error) {
          res.status(400).json(result);
        }
        else {
          res.json(result);
        }
      }).catch(err => res.status(500).json({error: 'Database error'}));
  }
);


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
