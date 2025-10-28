import { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const LoginForm = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { username, password };
    
        if (!username) {
            setErrorMessage('Username must be inserted');
        } else if (!password) {
            setErrorMessage('Password must be inserted');
        } else {
            props.handleLogin(credentials)
                .then( () => navigate( "/" ) )
                .catch((err) => { 
                    setErrorMessage(err.error); 
            });
        }
    };

    return (
        <Row>
            <Col xs={4}></Col>
            <Col xs={4}>
                <h1 className="pt-5 pb-4 text-primary">Login</h1>
    
                <Form onSubmit={handleSubmit}>
                {errorMessage && <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" value={username} className="border-2 border-info"
                            placeholder="M.Rossi"onChange={(e) => setUsername(e.target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={password} placeholder="password" className="border-2 border-info"
                            onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>
                    <Button className="mt-3" type="submit">Confirm</Button>
                    <Button className="mt-3 mx-2" onClick={()=>navigate("/")}>Cancel</Button>
                </Form>
            </Col>
            <Col xs={4}></Col>
        </Row>
    )
}

const LoginButton = (props) => {
    const navigate = useNavigate();
    return (
        <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
    )
}

const LogoutButton = (props) => {
    return (
      <Button variant="outline-light" onClick={props.handleLogout}>Logout</Button>
    )
}


export { LoginForm, LoginButton, LogoutButton }
