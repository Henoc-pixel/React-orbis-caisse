import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import "@/assets/css/connexion.css"

const Connexion: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`http://localhost:3000/users`);
      const users = await response.json();

      const user = users.find(
        (user: { id: number; username: string; password: string }) =>
          user.username === username && user.password === password
      );

      if (user) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", user.id.toString());
        localStorage.setItem("username", username);
        navigate("/Dashboard");
      } else {
        setErrorMessage("Nom d'utilisateur ou mot de passe incorrect.");
      }
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="connexion-container">
      {/* Bandeau supérieur */}
      <div className="header-banner">
        <h1>ORBIS CAISSE</h1>
      </div>
      <div className="form-container">
        <Card className="login-card">
          <Card.Body>
            <h2 className="text-center mb-4">Connexion</h2>
            <Form onSubmit={handleLogin}>
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
                Se connecter
              </Button>
            </Form>
            
            <div className="text-center mt-3">
              
              <Link to="">Mot de passe oublié ?</Link>
            </div>
            
            <div className="text-center mt-5 copyright">
              Copyright © 2025 Designed by <Link to={"https://www.offset-consulting.com/"}>Offset-Consulting.</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Connexion;