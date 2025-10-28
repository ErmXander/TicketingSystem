const SERVER_URL = 'http://localhost:3001/api/';
const SERVER2_URL = 'http://localhost:3002/api/';


// Utility to parse responses from the server
function parseJson(response) {
    return new Promise((resolve, reject) => {
        response.then((response) => {
          if (response.ok) {
           response.json()
                .then( json => resolve(json) )
                .catch( err => reject({ error: "Unable to parse the response"}))  
          } else {
            response.json()
                .then(obj => 
                    reject(obj)
                ).catch(err => 
                    reject({ error: "Unable to parse the response"})
                )
          }
        }).catch(err => 
            reject({ error: "Connection error" })
        );
    });
  }


/**** Authentication ****/

// Perform the login with the given credentials
const logIn = async (credentials) => {
    return parseJson(fetch(SERVER_URL + 'sessions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify(credentials)
    }));
}

// Check if the user already has an active session
const getUserInfo = async () => {
    return parseJson(fetch(SERVER_URL + 'sessions/current', {credentials: 'include'}));
}

// Perform the logout
const logOut = async() => {
    return parseJson(fetch(SERVER_URL + 'sessions/current', {
        method: 'DELETE',
        credentials: 'include'
      }));
}


/**** Tokens ****/
const getToken = async() => {
  return parseJson(fetch(SERVER_URL + 'token', {credentials: 'include'}));
}

// Get the estimation from Server2
const getEstimation = async(token, tickets) => {
  return parseJson(fetch(SERVER2_URL + 'estimations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({tickets: tickets})
  }));
}


/**** Tickets ****/

// Get the list of tickets
const getTickets = async () => {
  return parseJson(fetch(SERVER_URL + 'tickets/'));
}

// Add a ticket
const addTicket = async (ticket) => {
  return parseJson(fetch(SERVER_URL + 'tickets/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ticket) 
  }));
}

// Close a ticket
const closeTicket = async (ticket) => {
  return parseJson(fetch(SERVER_URL + 'tickets/' + ticket.id + '/close/', {
    method: 'PUT',
    credentials: 'include'
  }));
}

// Open a ticket
const openTicket = async (ticket) => {
  return parseJson(fetch(SERVER_URL + 'tickets/' + ticket.id + '/open/', {
    method: 'PUT',
    credentials: 'include'
  }));
}

// Change category
const changeTicketCategory = async (ticket, category) => {
  return parseJson(fetch(SERVER_URL + 'tickets/' + ticket.id + '/category/', {
    method: 'PUT',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({category: category})
  }));
}


/****  Comments ****/

// Get the list of comments to a ticket
const getComments = async (ticket) => {
  return parseJson(fetch(SERVER_URL + 'tickets/' + ticket.id + '/comments/', {credentials: 'include'}));
}

// Add a comment to a ticket
const addComment = async (ticket, text) => {
  return parseJson(fetch(SERVER_URL + 'tickets/' + ticket.id + '/comments/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({text: text}) 
  }));  
}

const API = { logIn, getUserInfo, logOut, 
  getToken, getEstimation, 
  getTickets, addTicket, closeTicket, openTicket, changeTicketCategory, 
  getComments, addComment };
export default API;
