import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import API from './API.js';

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

import { Container, Row, Col } from 'react-bootstrap';
import { TicketNavbar } from './components/TicketNavbar.jsx';
import { LoginForm } from './components/Authentication.jsx';
import { TicketList } from './components/Ticket.jsx';
import { ConfirmationPage, TicketForm } from './components/TicketForm.jsx';


const Layout = (props) => {
  return (
    <>
      <TicketNavbar user={props.user} isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout}/>
      <Outlet/>
    </>
  );
}

const PageNotFound = (props) => {
  return (
    <Row>
      <Col xs={4}/>
      <Col xs={4}>
        <p>
          Nothing to see here. Go back to <Link to={"/"}>somewhere meaningful</Link>.
        </p>
      </Col>
    </Row>
  )
}


function App() {

  // Authentication-related states
  const [user, setUser] = useState(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(undefined);

  // Tickets with their estimations
  const [ticketList, setTicketList] = useState([]);
  const [estimations, setEstimations] = useState([]);

  /* Set when a ticket is modified;
     triggers a re-fetching of the tickets (and comments of expanded tickets) */
  const [dirty, setDirty] = useState(false);
  /* Set when a ticket is open, closed, or its category is modified;
     disabled the ticket controls and prevents the insertion of new comments while true*/
  const [loading, setLoading] = useState(false);

  // Ticket-level error message
  const [errorMessage, setErrorMessage] = useState('');


  /**** useEffect's****/

  // Check if user is already logged in and get its info
  useEffect(()=> {
    const checkAuth = async() => {
      try {
        const user = await API.getUserInfo();
        setIsLoggedIn(true);
        setUser(user);
        const token = await API.getToken();
        setToken(token.token);
      } catch(err) {
      }
      setDirty(true);
    };
    checkAuth();
  }, []);

  /* Retrieve the list of tickets and get estimations for open ones (admins only);
     triggered when a ticket is modified */
  useEffect(()=>{
    const getTickets = async() => {
      try {
        const tickets = await API.getTickets();
        setTicketList(tickets);
      } catch(err) {
        setError(err.error);
      }
      setDirty(false);
      setLoading(false);
    };
    const getEstimations = async() => {
      await getMultipleEstimations(ticketList);
    };

    if (dirty) {
      getTickets();
    }
    if (!dirty && user && user.admin && token) {
      getEstimations();
    }
  }, [dirty]);


  // Error handling
  const setError = (error) => {
    if (error.error !== "Unauthorized to get estimations") {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(""), 7500);
    }
  }

  /**** Authentication functions ****/

  // Refresh token
  const renewToken = async () => {
    try {
      const token = await API.getToken();
      setToken(token.token);
      setDirty(true);
    } catch (err){
    }
  }

  // Perform the login
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setIsLoggedIn(true);
      const token = await API.getToken();
      setToken(token.token);
    } catch (err) {
      throw err;
    }
    setDirty(true);
  };

  // Perform the logout; "flush" all the states
  const handleLogout = async () => {
    try {
      await API.logOut();
    } catch(err) {
      console.log(err);
    }
    setUser(undefined);
    setIsLoggedIn(false);
    setEstimations([]);
    setTicketList([]);
    setToken(undefined);
    setDirty(true);
  };


  /**** Ticket Functions ****/

  // Close ticket
  const closeTicket = async (ticket) => {
    try {
      setLoading(true);
      setTicketList(ticketList => ticketList.map(e => e.ticketId===ticket.ticketId ? {...e, state: 'closed', pending:true} : {...e}));
      await API.closeTicket({id: ticket.ticketId});
    } catch(err) {
      setError(err.error);
    }
    setLoading(false);
    setDirty(true);
  }

  // Open ticket
  const openTicket = async (ticket) => {
    try {
      setLoading(true);
      setTicketList(ticketList => ticketList.map(e => e.ticketId===ticket.ticketId ? {...e, state: 'open', pending:true} : {...e}));
      await API.openTicket({id: ticket.ticketId});
    } catch(err) {
      setError(err.error);
    }
    setLoading(true);
    setDirty(true);
  }
  
  // Change category
  const changeCategory = async (ticket, category) => {
    const validCategories = ["inquiry", "maintenance", "new feature", "administrative", "payment"];
    if (ticket.category !== category && validCategories.includes(category)) {
      try {
        setLoading(true);
        setTicketList(ticketList => ticketList.map(e => e.ticketId===ticket.ticketId ? {...e, category: category, pending:true} : {...e}));
        await API.changeTicketCategory({id: ticket.ticketId}, category);
      } catch(err) {
        setError(err.error);
      }
      setLoading(false);
      setDirty(true);
    }
    else {
      setError("Invalid category");
    }
  }

  // Create a ticket
  const addTicket = async(ticket) => {
    try {
      await API.addTicket(ticket);
    } catch(err) {
      throw err;
    }
    setDirty(true);
  }

  // Get estimation for a single ticket (used in the confirmation page)
  const getEstimation = async(ticket) => {
    try {
      const estimation = await API.getEstimation(token,[ticket]);
      return estimation[0].estimation;
    } catch(err) {
      if (err.error==="Unauthorized to get estimations") {
        // Token is expired: renew it to get the estimation
        renewToken()
      }
      else {
        throw err;
      }
    }
  }

  // Get estimations for all (open) tickets
  const getMultipleEstimations = async(tickets) => {
    API.getEstimation(token, tickets.filter(e => e.state === 'open').map(e => ({id: e.ticketId, title: e.title, category: e.category})))
      .then(estimations => setEstimations(estimations))
      .catch(err => {
        if (err.error === 'Unauthorized to get estimations') {
          // Token is expired: renew it to get the estimations
          renewToken();
        }
      });
  }


  return (
    <>
      <BrowserRouter>
        <Container fluid className='px-0'>
          <Routes>
            <Route path="/" element={<Layout user={user} isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>}>
              <Route index element={ <TicketList 
                tickets={ticketList} estimations={estimations}
                closeTicket={closeTicket} openTicket={openTicket} changeCategory={changeCategory}
                getEstimations={getMultipleEstimations} 
                user={user} isLoggedIn={isLoggedIn} 
                token={token} 
                dirty={dirty} setDirty={setDirty} loading={loading}
                errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>}                  
              />
              <Route path="new" element={<TicketForm 
                user={user}
                setDirty={setDirty} 
                />}                  
              />
              <Route path="new/confirm" element={<ConfirmationPage 
                user={user} token={token} 
                addTicket={addTicket} getEstimation={getEstimation}/>}                  
              />
            </Route>
            <Route path='/login' element={<LoginForm handleLogin={handleLogin} handleLogout={handleLogout}/>}/>
            <Route path="*" element={<PageNotFound/>}/>
          </Routes>
        </Container>
      </BrowserRouter>
    </>
  )
}

export default App
