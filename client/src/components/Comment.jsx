import dayjs from 'dayjs';
import validator from 'validator';

import { useState } from 'react';
import { Row, Col, Card, Button, Form} from 'react-bootstrap';


const Comment = (props) => {
    const {comment, ticket} = props;

    return (
        <Card border={props.isDescription && "primary"} className={props.isDescription ? "border-3 mb-3" : "mb-2"}>
            <Card.Header className="py-0">
                <Row>
                    <Col xs={4}>
                        {
                            ((ticket && comment.author===ticket.owner) || props.isDescription) ? 
                            <i className="bi bi-person text-primary"/> : <i className="bi bi-person"/>
                        } 
                        <i className="mx-1">
                            {
                                ((ticket && comment.author===ticket.owner) || props.isDescription)   ? 
                                <span className="text-primary">{comment.author}</span> : comment.author
                            }
                        </i>
                    </Col>
                    <Col xs={4}/>
                    <Col xs={4} className="pl-2">
                        <i>{comment.timestamp && dayjs(comment.timestamp).format("DD/MM/YYYY HH:mm:ss")}</i>
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <Card.Text style={{whiteSpace: "pre-wrap"}}>
                    {comment.text}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}

const CommentForm = (props) => {
    const [text, setText] = useState('');


    // Validates the comment to be added and, if ok, it tries to add it.
    const handleSubmit = (event) => {
        event.preventDefault();
        if(validator.isEmpty(text)) {
            props.setError("Comment cannot be empty")
        }
        else {
            props.addComment(props.ticket, text)
                .then(() => setText(''));
        }
    }

    return (
        <>
            <Row className="pt-3 pb-1">
                <Col xs={2}/>
                <Col xs={8}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2" controlId="commentTextarea">
                            <Form.Label><b>New comment:</b></Form.Label>
                            <Form.Control as="textarea" readOnly={props.loading} rows={3} 
                                value={text} onChange={(e)=>setText(e.target.value)}/>
                        </Form.Group>
                        <Button variant="success" type="submit" disabled={text.length===0 || props.loading}>
                            {props.loading ? "Loading": "Comment"}
                        </Button>             
                    </Form>
                </Col>
            </Row>
        </>
    );
}

const CommentList = (props) => {
    const {comments} = props;

    return (
        <Row className="pt-2">
            <Col xs={2}/>
            <Col xs={8}>
                {comments.map((e,index) => <Comment key={e.id} isDescription={index===0} 
                    comment={e} ticket={props.ticket}
                />)}
            </Col>
        </Row>        
    )
}

export { Comment, CommentList, CommentForm };