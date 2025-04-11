import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import "@/assets/css/connexion.css"

const Inscription: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3000/users');
      const users = await response.json();

      const userExists = users.some(
        (user: { username: string; email: string }) =>
          user.username === username || user.email === email
      );

      if (userExists) {
        setErrorMessage('Nom d\'utilisateur ou email déjà utilisé.');
        return;
      }

      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/');
    } catch {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="connexion-container">
      {/* Bandeau supérieur */}
      <div className="header-banner">
        <h1>ORBIS CAISSE</h1>
      </div>
      {/* Conteneur principal */}
      <div className="form-container">
        <Card className="login-card">
          <Card.Body>
            <h2 className="text-center mb-4">Inscription</h2>
            <Form onSubmit={handleSignUp}>
              <Form.Group className="mb-4">
                <Form.Label>Nom d'utilisateur</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}

              <Button
                type="submit"
                className="w-100 mb-4"
                style={{ backgroundColor: "#232754", color: "white" }}
              >
                S'inscrire
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span>Déjà un compte ? </span>
              <Link to="/">Connectez-vous</Link>
            </div>
            <div className="text-center mt-5 copyright">
              Copyright © 2025 Designed by{" "}
              <Link to={"https://www.offset-consulting.com/"}>Offset-Consulting.</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Inscription;