import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form} from 'react-bootstrap';
import { LoginButton, LogoutButton } from './Authentication';
import { useNavigate } from 'react-router-dom';

const TicketNavbar = (props) => {

    const navigate = useNavigate();

    return (
        <Navbar bg="info" variant="dark" className="justify-content-between navbar-padding">
            <Navbar.Brand className="mx-2 fs-4">
                <i className="bi bi-ticket-detailed mx-2" />
                Ticket Management
            </Navbar.Brand>
            <Nav>
                <Navbar.Text className={props.user && props.user.admin ? "text-danger mx-2 fs-5" : "text-white mx-2 fs-5"}>
                    <b>{props.user && props.user.username}</b>
                </Navbar.Text>
                <Form className="mx-3 mt-1">
                    {
                        props.isLoggedIn ? 
                            <LogoutButton handleLogout={()=>{props.handleLogout(); navigate("/");}} /> : 
                            <LoginButton/>
                    }
                </Form>
            </Nav>
        </Navbar>
    );

}

export {TicketNavbar};