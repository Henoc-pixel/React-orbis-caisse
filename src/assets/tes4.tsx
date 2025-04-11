import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { FaBars, FaUser } from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";
import { LuMapPin, LuUserPen } from "react-icons/lu";
import { AiOutlineFieldTime } from "react-icons/ai";
import { GiExitDoor } from "react-icons/gi";
import { Journée, User } from "@/Components/types";

interface NavigationProps {
  onToggleSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [activeJournee, setActiveJournee] = useState<Journée | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fonction pour formater la date et heure actuelle
  const getCurrentDateTime = useCallback((): string => {
    const date = new Date();
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  }, []);

  // Fonction pour récupérer la journée active
  const fetchActiveJournee = useCallback(async (username: string) => {
    try {
      const response = await fetch("http://localhost:3000/journée");
      if (!response.ok) throw new Error("Erreur réseau");

      const data: Journée[] = await response.json();
      const journee = data.find(
        (j) => j.active === "oui" && j.caissier_username === username
      );

      setActiveJournee(journee || null);
    } catch (error) {
      console.error("Erreur lors de la récupération de la journée:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les infos utilisateur
  const fetchUserData = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        if (!response.ok) throw new Error("Erreur réseau");

        const userData: User = await response.json();
        setUser(userData);

        // Si l'utilisateur est un manager, on récupère la journée active
        if (userData.role === "MANAGER" || userData.role === "MANAGER1") {
          fetchActiveJournee(userData.username);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
        setLoading(false);
      }
    },
    [fetchActiveJournee]
  );

  // Initialisation et gestion du polling
  useEffect(() => {
    // Mise à jour de l'heure en temps réel
    const timeInterval = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    // Récupération de l'utilisateur connecté
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserData(userId);
    } else {
      setLoading(false);
    }

    // Nettoyage des intervalles
    return () => {
      clearInterval(timeInterval);
    };
  }, [fetchUserData, getCurrentDateTime]);

  // Gestion du polling pour les managers
  useEffect(() => {
    let journeeInterval: NodeJS.Timeout;

    if (user && (user.role === "MANAGER" || user.role === "MANAGER1")) {
      // Vérification immédiate
      fetchActiveJournee(user.username);

      // Mise en place du polling toutes les 1 secondes
      journeeInterval = setInterval(() => {
        fetchActiveJournee(user.username);
      }, 1000);
    }

    return () => {
      if (journeeInterval) clearInterval(journeeInterval);
    };
  }, [user, fetchActiveJournee]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  };

  // Affichage des informations de caisse pour les managers
  const renderManagerCaisseInfo = () => {
    if (loading) return null;

    if (activeJournee) {
      return (
        <>
          <Nav.Item
            as={Link}
            to="/Close-caisse"
            style={{ color: "white", textDecoration: "none" }}
            className="m-2"
          >
            <AiOutlineFieldTime size={20} /> Ouverture:{" "}
            {new Date(activeJournee.date_ouverture).toLocaleString()}
          </Nav.Item>
          <Nav.Item className="m-2">{activeJournee.caisse_intitulé}</Nav.Item>
          <Nav.Item className="m-2">
            Solde: {parseInt(activeJournee.solde).toLocaleString()} FCFA
          </Nav.Item>
        </>
      );
    } else {
      return (
        <Nav.Item
          as={Link}
          to="/Add-Bon-Appro"
          style={{ color: "white", textDecoration: "none" }}
          className="m-2 "
        >
          <AiOutlineFieldTime size={20} /> Caisse fermée
        </Nav.Item>
      );
    }
  };

  // Affichage conditionnel en fonction du rôle
  const renderDateTimeOrCaisseInfo = () => {
    if (user && (user.role === "MANAGER" || user.role === "MANAGER1")) {
      return renderManagerCaisseInfo();
    }
    return (
      <Nav.Item className="m-2">
        <AiOutlineFieldTime size={20} /> {dateTime || getCurrentDateTime()}
      </Nav.Item>
    );
  };

  return (
    <Navbar
      expand="lg"
      variant="dark"
      className="shadow-sm fixed-top"
      style={{ backgroundColor: "#232754", borderBottom: "4px solid #fbf46a" }}
    >
      <Container fluid>
        <Button
          variant="outline-light"
          onClick={onToggleSidebar}
          className="me-2"
        >
          <FaBars />
        </Button>
        <Navbar.Brand as={Link} to="/List-FDB" className="ml-3">
          ORBIS CAISSE
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav" className="justify-content-between">
          <Nav className="text-white">
            <Nav.Item className="m-2 ml-5">
              <IoBusiness /> Offset consulting
            </Nav.Item>
            <Nav.Item className="m-2">
              <LuMapPin /> Abidjan, Cocody-Mermoz
            </Nav.Item>

            {renderDateTimeOrCaisseInfo()}
          </Nav>

          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-white d-flex align-items-center"
              >
                <FaUser size={24} className="me-2" />
                <span>Bonjour, {user.username}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/User">
                  <LuUserPen size={20} className="me-2" /> Profil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <GiExitDoor size={20} className="me-2" /> Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/" className="text-white">
                Connexion
              </Nav.Link>
              <Nav.Link as={Link} to="/inscription" className="text-white">
                Inscription
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
