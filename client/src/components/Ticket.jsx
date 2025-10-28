import API from '../API.js';

import dayjs from 'dayjs';

import { useState, useEffect } from 'react';
import { Alert, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { CommentList, Comment, CommentForm } from './Comment.jsx';
import { NewButton } from './TicketForm.jsx';


/* Header of the ticket, visible to all (with differences based on the type of user);
   it allows authenticated users to expand the ticket */
const TicketHeader = (props) => {
    const {ticket} = props;
    
    return(
        <Card.Header>
            <Row>
                <Col xs={6}>
                    <Row><Col xs={12}><h4><b>{ticket.title}</b></h4></Col></Row>
                    <Row>
                        <Col xs={12}>
                            <i>by <b>{ticket.owner}</b> - {dayjs(ticket.date).format("DD/MM/YYYY HH:mm:ss")}</i>
                        </Col>
                    </Row>
                </Col>
                <Col xs={3}>
                    <Row>
                        <Col xs={12}> <b>state: </b> 
                            <span className={ticket.state==="open" ? "text-success" : "text-danger"}>
                                {ticket.state}
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <b>category: </b> {ticket.category}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}> 
                            {   
                                props.user && props.user.admin===1 && ticket.state==="open" &&
                                <><b>closed in: </b> {props.estimation ? props.estimation : "N/A"} </>
                            }
                        </Col>
                    </Row>
                </Col>
                <Col xs={3}>
                    <Row className="my-2">
                        <Col xs={3}/>
                        <Col xs={4} className="mx-2">
                            {
                                props.user && (ticket.state==='open' && (props.user.id===ticket.ownerId || props.user.admin)) ?
                                <Button variant="danger" disabled={props.waiting}
                                    onClick={() => props.closeTicket(ticket)}>Close</Button> :
                                props.user && props.user.admin===1 && ticket.state==='closed' &&
                                <Button variant="success" disabled={props.waiting}
                                    onClick={() => props.openTicket(ticket)}>Open</Button>
                            }
                        </Col>
                        <Col xs={1}>
                            {   
                                props.user &&  (props.expanded ?
                                <Button variant="primary" disabled={props.waiting}
                                    onClick={props.hide}><i className="bi bi-eye-slash"/></Button> :
                                <Button variant="primary" disabled={props.waiting}
                                    onClick={props.show}><i className="bi bi-eye"/></Button>)
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card.Header>
    );
}

// Small form to change the ticket category; placed inside the expanded ticket
const CategorySelector = (props) => {
    const [category, setCategory] = useState(props.ticket.category);

    return (
        <Row>
            <Col xs={2} className="mx-2">
                <Form.Label htmlFor="categorySelector"><b>category: </b></Form.Label>
            </Col>
            <Col xs={6} className="mx-0">
                <Form.Select id="categoryStelector" size="sm" 
                    value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>inquiry</option>
                    <option>maintenance</option>
                    <option>new feature</option>
                    <option>administrative</option>
                    <option>payment</option>
                </Form.Select>
            </Col>
            <Col xs={3} className="px-0">
                <Button variant="success" size="sm" onClick={()=>props.changeCategory(props.ticket, category)}
                    disabled={category===props.ticket.category || props.waiting}>Change</Button>
            </Col>
        </Row>
    );
}

/* The expanded ticket displaying all comments, 
   a category selector (for admins), and a form to post a comment (for open tickets) */
const TicketBody = (props) => {
    const {comments} = props;

    return (
        <Card.Body>
            <Row>
                {   
                    props.user && props.user.admin===1 && !props.ticket.pending &&
                    <>
                        <Col xs={3}/>
                        <Col xs={6} className="mt-1 mb-4">
                            <CategorySelector ticket={props.ticket} changeCategory={props.changeCategory}
                                waiting={props.waiting}
                            />
                        </Col>
                    </>
                }
            </Row>
            {
                props.errorMessage ? 
                <Alert variant="danger" onClose={()=>props.setError('')} dismissible>
                    {props.errorMessage}
                </Alert> : false 
            }
            <CommentList comments={comments} ticket={props.ticket}/>
            {
                props.commentErrorMessage ? 
                    <Row className="pt-3 pb-1">
                        <Col xs={2}/>
                        <Col xs={8}>
                            <Alert variant="danger" onClose={()=>props.setCommentError('')} dismissible>
                                {props.commentErrorMessage}
                            </Alert> 
                        </Col>
                    </Row> : false
            }
            {
                !props.ticket.pending && props.ticket.state==='open' &&
                <CommentForm addComment={props.addComment} ticket={props.ticket}
                    loading={props.loading} 
                    setError={props.setCommentError}
                />
            }
        </Card.Body>
    );
}

const Ticket = (props) => {
    const {ticket} = props;

    // When expanded the comments of the tickets are fetched
    const [expanded, setExpanded] = useState(false);
    const [commentList, setCommentList] = useState([]);

    /* Set to true when a new comment is added;
       prevents the insertion of a new comment as long as it's true */
    const [loading, setLoading] = useState(false);

    // Comment-level error message
    const [errorMessage, setErrorMessage] = useState('');
    // CommentForm-level error message
    const [commentErrorMessage, setCommentErrorMessage] = useState('');

    
    /* Fetch the comments of the ticket when it gets expanded; 
       also follows a modification of tickets (as long as the ticket is expanded) */
    useEffect(() => {
        const getComments = async () => {
            try {
                const comments = await API.getComments({id: ticket.ticketId});
                setCommentList(comments);
            }
            catch (err) {
                setError(err.error);
            }
        }
        if (props.dirtyTicket && expanded) {
            getComments();
        }
    }, [props.dirtyTicket]);


    /**** Error Handling functions ****/
    const setError = (error) => {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(""), 10000);
    }
    const setCommentError = (error) => {
        setCommentErrorMessage(error);
        setTimeout(() => setCommentErrorMessage(""), 10000);
    }


    // Expands the ticket and sets it as modified
    const show = () => {
        setExpanded(true);
        props.setDirtyTicket(true);
    }

    // Compresses the ticket and "flushes" its comment list
    const hide = () => {
        setExpanded(false);
        setCommentList([]);
    }


    /* Adds a new comment and flags the tickets as modified 
       triggering a re-fetching of the tickets and the comments of expanded ones */
    const addComment = async (ticket, text) => {
        setLoading(true);
        try {
            await API.addComment({id: ticket.ticketId}, text);
        }
        catch (err) {
            setCommentError(err.error);
        }
        props.setDirtyTicket(true);
        setLoading(false);
    }

    return (
        <>
            <Card bg={ticket.pending ? "warning" : "info"} border={ticket.pending ? "dark" : "primary"} 
                text={ticket.pending ? "dark" : "white"} className="my-1 p-0">
                <TicketHeader ticket={props.ticket} estimation={props.estimation}
                    closeTicket={props.closeTicket} openTicket={props.openTicket}
                    expanded={expanded} show={show} hide={hide}
                    user={props.user} waiting={props.waiting}
                />
                {
                    props.user && expanded &&
                    <TicketBody comments={commentList} ticket={ticket} changeCategory={props.changeCategory}
                        user={props.user} addComment={addComment} loading={loading} waiting={props.waiting}
                        errorMessage={errorMessage} setError={setError}
                        commentErrorMessage={commentErrorMessage} setCommentError={setCommentError}
                    />
                }
            </Card>
        </>
    );
}


const TicketList = (props) => {
    const { tickets, estimations } = props;

    return (
    <>
        <Row className="my-3">
            <Col xs={2}/>
            <Col xs={8}>
                {props.errorMessage ? 
                    <Alert variant='danger' onClose={()=>props.setErrorMessage('')} dismissible>
                        {props.errorMessage}
                    </Alert> : false 
                }
                <Row className="my-2">
                    <Col xs={11}>
                        {   
                            tickets.length > 0 &&
                            <h1 className='text-primary'><b>TICKETS</b></h1>
                        }
                    </Col>
                    <Col xs={1}>
                        { props.user && <NewButton /> }
                    </Col>
                </Row>
                <Row className="my-2">
                    {tickets.map((e) => <Ticket key={e.ticketId} 
                        ticket={e} closeTicket={props.closeTicket} openTicket={props.openTicket}
                        estimation={!!estimations.find((t)=>t.id===e.ticketId) && 
                            estimations.find((t)=>t.id===e.ticketId).estimation}
                        dirtyTicket={props.dirty} setDirtyTicket={props.setDirty}
                        changeCategory={props.changeCategory} waiting={props.loading}
                        user={props.user}/>)}
                </Row>
            </Col>
        </Row>
    </>
    );
}


// Component acting as a read-only ticket for the confirmation page
const ConfirmationTicket = (props) => {
    const {ticket} = props;
    const [estimation,setEstimation] = useState("N/A");

    /* Fetch the estimation for the ticket to be confirmed; 
       token dependency since it could be expired and in need of refreshing */
    useEffect(()=>{
        props.getEstimation(ticket)
            .then(result => setEstimation(result));
    },[props.token])

    return (
        <Card bg="info" border="primary" text="white" className="my-1 p-0">
            <Card.Header>
                <Row>
                    <Col xs={6}>
                        <Row><Col xs={12}><h4><b>{ticket.title}</b></h4></Col></Row>
                        <Row><Col xs={12}><i>by <b>{props.user.username}</b></i></Col></Row>
                    </Col>
                    <Col xs={3}>
                        <Row><Col xs={12}><b>category: </b> {ticket.category}</Col></Row>
                        <Row><Col xs={12}><b>closed in: </b> {estimation}</Col></Row>
                    </Col>
                    <Col xs= {3}/>
                </Row>                
            </Card.Header>
            <Card.Body>
                <Comment isDescription={true} 
                    comment={{author: props.user.username, text: ticket.text}} />
        </Card.Body>
        </Card>
    );
}

export {TicketList, ConfirmationTicket};