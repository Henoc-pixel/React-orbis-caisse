import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { FaBars, FaUser } from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";
import { LuMapPin, LuUserPen } from "react-icons/lu";
import { AiOutlineFieldTime } from "react-icons/ai";
import { GiExitDoor } from "react-icons/gi";
import { Journée, User, Caisse } from "@/Components/types";
import { FaBell } from "react-icons/fa";
import { Notification } from "@/Components/types";

interface NavigationProps {
  onToggleSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [activeJournee, setActiveJournee] = useState<Journée | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Ajoutez cet état dans le composant Navigation
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationSocket, setNotificationSocket] =
    useState<WebSocket | null>(null);

  // Fonction pour formater la date et heure actuelle
  const getCurrentDateTime = useCallback((): string => {
    const date = new Date();
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  }, []);

  // Fonction pour récupérer les données initiales
  const fetchInitialData = useCallback(async () => {
    try {
      // Récupérer l'utilisateur
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const userResponse = await fetch(`http://localhost:3000/users/${userId}`);
      if (!userResponse.ok) throw new Error("Erreur réseau");
      const userData: User = await userResponse.json();
      setUser(userData);

      // Récupérer les caisses
      const caisseResponse = await fetch("http://localhost:3000/caisse");
      if (!caisseResponse.ok) throw new Error("Erreur réseau");
      const caissesData: Caisse[] = await caisseResponse.json();
      setCaisses(caissesData);

      // Si l'utilisateur est un manager, récupérer la journée active
      if (userData.role === "MANAGER" || userData.role === "MANAGER1") {
        const journeeResponse = await fetch("http://localhost:3000/journée");
        if (!journeeResponse.ok) throw new Error("Erreur réseau");

        const journeesData: Journée[] = await journeeResponse.json();
        const activeJournee = journeesData.find(
          (j) => j.active === "oui" && j.caissier_username === userData.username
        );

        if (activeJournee) {
          // Vérifier que la caisse correspondante est ouverte
          const caisse = caissesData.find(
            (c) =>
              c.intitulé === activeJournee.caisse_intitulé &&
              c.statut === "ouvert"
          );

          if (caisse) {
            setActiveJournee(activeJournee);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour vérifier l'état de la journée (utilisée pour le polling)
  const checkJourneeStatus = useCallback(async () => {
    if (!user || !(user.role === "MANAGER" || user.role === "MANAGER1")) return;

    try {
      const [journeeResponse, caisseResponse] = await Promise.all([
        fetch("http://localhost:3000/journée"),
        fetch("http://localhost:3000/caisse"),
      ]);

      if (!journeeResponse.ok || !caisseResponse.ok) {
        throw new Error("Erreur réseau");
      }

      const [journeesData, caissesData]: [Journée[], Caisse[]] =
        await Promise.all([journeeResponse.json(), caisseResponse.json()]);

      const activeJournee = journeesData.find(
        (j) => j.active === "oui" && j.caissier_username === user.username
      );

      if (activeJournee) {
        // Vérifier que la caisse correspondante est ouverte
        const caisse = caissesData.find(
          (c) =>
            c.intitulé === activeJournee.caisse_intitulé &&
            c.statut === "ouvert"
        );

        setActiveJournee(caisse ? activeJournee : null);
      } else {
        setActiveJournee(null);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la journée:", error);
    }
  }, [user]);

  // Initialisation et gestion du polling
  useEffect(() => {
    // Mise à jour de l'heure en temps réel
    const timeInterval = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    // Chargement des données initiales
    fetchInitialData();

    // Nettoyage des intervalles
    return () => {
      clearInterval(timeInterval);
    };
  }, [fetchInitialData, getCurrentDateTime]);

  // Gestion du polling pour les managers
  useEffect(() => {
    let journeeInterval: NodeJS.Timeout;

    if (user && (user.role === "MANAGER" || user.role === "MANAGER1")) {
      // Vérification immédiate
      checkJourneeStatus();

      // Mise en place du polling toutes les 1 secondes
      journeeInterval = setInterval(() => {
        checkJourneeStatus();
      }, 1000);
    }

    return () => {
      if (journeeInterval) clearInterval(journeeInterval);
    };
  }, [user, checkJourneeStatus]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  };
  // Ajoutez cette fonction pour charger les notifications
  const fetchNotifications = useCallback(async () => {
    if (!user || !["RESPONSABLE", "MANAGER", "MANAGER1"].includes(user.role))
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/notifications?userId=${user.id}&read=false`
      );
      if (!response.ok) throw new Error("Erreur réseau");
      const data: Notification[] = await response.json();

      // Filtrer selon le rôle
      const filtered = data.filter(
        (notif) => notif.roleTarget === user.role || notif.userId === user.id
      );

      setNotifications(filtered);
      setUnreadCount(filtered.length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  }, [user]);
  // Ajoutez cet effet pour charger les notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Polling toutes les 30 secondes pour les nouvelles notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);
  // Initialisation et gestion du polling
  useEffect(() => {
    // Mise à jour de l'heure en temps réel
    const timeInterval = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    // Chargement des données initiales
    fetchInitialData();

    // Initialiser la connexion WebSocket pour les notifications en temps réel
    const ws = new WebSocket("ws://localhost:3000/notifications");
    ws.onopen = () => {
      console.log("Connecté au serveur WebSocket des notifications");
      setNotificationSocket(ws);
    };
    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      if (
        newNotification.userId === user?.id ||
        newNotification.roleTarget === user?.role
      ) {
        setNotifications((prev) => [newNotification, ...prev]);
        if (!newNotification.read) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };
    ws.onerror = (error) => {
      console.error("Erreur WebSocket:", error);
    };
    ws.onclose = () => {
      console.log("Déconnecté du serveur WebSocket des notifications");
    };

    // Nettoyage des intervalles et WebSocket
    return () => {
      clearInterval(timeInterval);
      if (ws) ws.close();
    };
  }, [fetchInitialData, getCurrentDateTime, user]);

  // Ajoutez cette fonction pour marquer une notification comme lue
  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
    }
  };
  // Ajoutez cette fonction pour formater la date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    }

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
            // Remplacez le Dropdown existant par celui-ci
            <Dropdown align="end">
              <div className="d-flex align-items-center">
                {/* Ajoutez la cloche de notifications si l'utilisateur est concerné */}
                {["RESPONSABLE", "MANAGER", "MANAGER1"].includes(user.role) && (
                  <Dropdown
                    align="end"
                    show={showNotifications}
                    onToggle={setShowNotifications}
                  >
                    <Dropdown.Toggle
                      variant="link"
                      className="text-white position-relative me-3"
                      style={{ border: "none", background: "transparent" }}
                    >
                      <FaBell size={20} />
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {unreadCount}
                        </span>
                      )}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      style={{
                        width: "350px",
                        maxHeight: "400px",
                        overflowY: "auto",
                        left: "-250px",
                      }}
                    >
                      <Dropdown.Header>
                        Notifications ({unreadCount} non lues)
                      </Dropdown.Header>
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Dropdown.Item
                            key={notif.id}
                            as={Link}
                            to={notif.link}
                            onClick={() => markAsRead(notif.id)}
                            className={!notif.read ? "fw-bold" : ""}
                          >
                            <div className="d-flex flex-column">
                              <span>{notif.message}</span>
                              {notif.reference && (
                                <small className="text-muted">
                                  Réf: {notif.reference}
                                </small>
                              )}
                              <small className="text-muted">
                                {formatNotificationDate(notif.date)}
                              </small>
                            </div>
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>
                          Aucune notification
                        </Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/Notifications">
                        Voir toutes les notifications
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}

                {/* Menu utilisateur existant */}
                <Dropdown.Toggle
                  variant="link"
                  className="text-white d-flex align-items-center"
                >
                  <FaUser size={24} className="me-2" />
                  <span>Bonjour, {user.username}</span>
                </Dropdown.Toggle>
              </div>

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
