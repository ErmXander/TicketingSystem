import { Alert, Row, Col, Button, Form, Tooltip, OverlayTrigger} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import validator from 'validator';

import { ConfirmationTicket } from './Ticket';


// Ticket submission form
const TicketForm = (props) => {

    const validCategories = ["inquiry", "maintenance", "new feature", "administrative", "payment"];

    const navigate = useNavigate();
    const location = useLocation();

    // Ticket fields
    const [title, setTitle] = useState(location.state && location.state.title ? location.state.title : '');
    const [category, setCategory] = useState(location.state && location.state.category ? location.state.category : 'inquiry');
    const [text, setText] = useState(location.state && location.state.text ? location.state.text : '');

    const [errorMessage, setErrorMessage] = useState('');

    // Error handling
    const setError = (error) => {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(""), 10000);
    }


    /* Validates the fields;
       if ok it navigates to the confirmation page passing the fields as state */
    const handleSubmit = (event) => {
        event.preventDefault();
        if (validator.isEmpty(title)) {
            setError("Title cannot be empty");
        }
        else if (!validator.isIn(category, validCategories)){
            setError("Invalid category");
        }
        else if (validator.isEmpty(text)) {
            setError("Text cannot be empty");
        }
        else {
            navigate("confirm",{state:{title: title, category: category, text: text}});
        }
    }

    
    return (
        <Row>
            <Col xs={3}/>
            <Col xs={6}>
                <h2 className="pt-4 pb-2 text-primary"><b>NEW TICKET</b></h2>
    
                <Form onSubmit={handleSubmit}>
                    {errorMessage && <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert>}
                    <Row className="mb-2">
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" value={title} className="border-2 border-info"
                                    onChange={(e) => setTitle(e.target.value)}
                            />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Select className="border-2 border-info"
                                    value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option>inquiry</option>
                                    <option>maintenance</option>
                                    <option>new feature</option>
                                    <option>administrative</option>
                                    <option>payment</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={4} className="border-2 border-info"
                                value={text} onChange={(e) => setText(e.target.value)}/>
                        </Form.Group>
                    </Row>
                    <Button className="mt-3" 
                        onClick={()=>{navigate("/"); props.setDirty(true);}}>Cancel</Button>
                    <Button className="mt-3 mx-2" type="submit" disabled={!title || !text}>Open</Button>
                </Form>
            </Col>
            <Col xs={3}/>
        </Row>
    )
}


// Confirmation page following the submission of a ticket; relies on ConfirmationTicket
const ConfirmationPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [errorMessage, setErrorMessage] = useState("");

    const ticket = {
        title: location.state.title,
        category: location.state.category,
        text: location.state.text
    };


    // The insertion of the ticket was confirmed; ticket is added
    const handleConfirm = () => {
        props.addTicket({
            title: location.state.title,
            category: location.state.category,
            text: location.state.text})
            .then(() => navigate("/", {state: null}))
            .catch(err => {
                setErrorMessage(err.error);
                setTimeout(() => setErrorMessage(""), 10000);
        });
    }

    return (
        <Row>
            <Col xs={2}/>         
            <Col xs={8}>
                <h2 className="pt-4 pb-2 text-primary"><b>CONFIRM ?</b></h2>
                {errorMessage && <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert>}
                <ConfirmationTicket 
                    ticket={ticket} getEstimation={props.getEstimation}
                    user={props.user} token={props.token}
                />
                <Button className="mt-3" variant="danger" 
                    onClick={()=>navigate("/new",
                        {state:{title: location.state.title, 
                        category:location.state.category,
                        text: location.state.text}}
                    )}>
                    Return
                </Button>
                <Button className="mt-3 mx-2" type="submit" 
                    onClick={handleConfirm}>
                    Confirm
                </Button>
            </Col>
            <Col xs={2}/>
        </Row>
        
    );
}



const NewButton = (props) => {
    const navigate = useNavigate();

    return (
        <OverlayTrigger overlay={<Tooltip>Open a ticket</Tooltip>} placement="left">
            <Button variant="primary" size="lg" onClick={()=>navigate("/new")}>
                <i className="bi bi-ticket-detailed-fill"></i>
            </Button>
        </OverlayTrigger>
    );
}


export { TicketForm, ConfirmationPage, NewButton };




