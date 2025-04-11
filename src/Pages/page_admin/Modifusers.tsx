import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import Select, { StylesConfig } from "react-select"; // Import correct de StylesConfig
import { FaHome, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User } from "@/Components/types";

// Définir un type pour les options du Select
type OptionType = { value: string; label: string };

// Liste des services disponibles
const services: OptionType[] = [
  { value: "Service Comptabilité", label: "Service Comptabilité" },
  { value: "Service Secrétariat", label: "Service Secrétariat" },
  { value: "Service Informatique", label: "Service Informatique" },
  { value: "Direction", label: "Direction" },
];

// Liste des rôles disponibles
const roles: OptionType[] = [
  { value: "USER", label: "Créer/Modifier Fiche de besoin" },
  {
    value: "MANAGER",
    label: "Créer/convertir Reçu de caisse et Bon de caisse",
  },
  { value: "MANAGER1", label: "Approuver Fiche de besoin" },
  { value: "RESPONSABLE", label: "Valider Fiche de besoin" },
  { value: "IMPRESSION", label: "Imprimer Document" },
];

// Styles personnalisés pour le composant Select
const customStyles: StylesConfig<OptionType, false> = {
  control: (base, { isFocused }) => ({
    ...base, // Conserver les styles de base
    boxShadow: "none", // Supprimer l'ombre
    borderColor: isFocused ? "#232754" : base.borderColor, // Changer la couleur de la bordure au focus
    "&:hover": {
      borderColor: "#232754", // Changer la couleur de la bordure au survol
    },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base, // Conserver les styles de base
    backgroundColor: isSelected
      ? "#232754" // Couleur de fond si l'option est sélectionnée
      : isFocused
      ? "#f0f0f0" // Couleur de fond si l'option est survolée
      : "white", // Couleur de fond par défaut
    color: isSelected ? "white" : "black", // Couleur du texte
    "&:hover": {
      backgroundColor: "#232754", // Couleur de fond au survol
      color: "white", // Couleur du texte au survol
    },
  }),
  menu: (base) => ({
    ...base, // Conserver les styles de base
    maxHeight: 200, // Hauteur maximale du menu déroulant
    overflowY: "auto", // Ajouter un défilement si le menu est trop long
  }),
  menuList: (base) => ({
    ...base, // Conserver les styles de base
    padding: 0, // Supprimer les espacements inutiles
  }),
};

// Composant principal pour la modification d'un utilisateur
const Readuser: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Récupération de l'ID de l'utilisateur depuis l'URL
  const navigate = useNavigate(); // Hook pour la navigation
  const [users, setUsers] = useState<User | null>(null); // État pour les données de l'utilisateur
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe

  // Récupération des données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${id}`);
        if (!response.ok) throw new Error("Erreur de récupération des données");
        const data = await response.json();
        setUsers(data);
      } catch {
        toast.error("Erreur lors du chargement des données"); // Notification d'erreur
      }
    };
    fetchUser();
  }, [id]);

  // Gestion de la mise à jour de l'utilisateur
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(users),
      });
      toast.success("Utilisateur mis à jour avec succès !"); // Notification de succès
      setTimeout(() => navigate("/List-User"), 2000); // Redirection vers le tableau de bord
    } catch {
      toast.error("Une erreur est survenue."); // Notification d'erreur
    }
  };

  if (!users) return <p>Chargement...</p>; // Affichage d'un message de chargement si les données ne sont pas encore chargées

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />{" "}
      {/* Conteneur pour les notifications toast */}
      <Card className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Modifier l'utilisateur</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleUpdate}>
            <fieldset>
              <legend>Informations de l'utilisateur</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom*</Form.Label>
                    <Form.Control
                      type="text"
                      value={users.nom}
                      onChange={(e) =>
                        setUsers({ ...users, nom: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénoms*</Form.Label>
                    <Form.Control
                      type="text"
                      value={users.prenoms}
                      onChange={(e) =>
                        setUsers({ ...users, prenoms: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Service*</Form.Label>
                    <Select<OptionType>
                      styles={customStyles}
                      options={services}
                      value={services.find((s) => s.value === users.service)}
                      onChange={(selected) =>
                        setUsers({ ...users, service: selected?.value || "" })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Fonction*</Form.Label>
                    <Form.Control
                      type="text"
                      value={users.fonction}
                      onChange={(e) =>
                        setUsers({ ...users, fonction: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Coordonnées de l'utilisateur</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={users.telephone}
                      onChange={(e) =>
                        setUsers({ ...users, telephone: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={users.email}
                      onChange={(e) =>
                        setUsers({ ...users, email: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Compte utilisateur</legend>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={users.telephone}
                      onChange={(e) =>
                        setUsers({ ...users, telephone: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Rôle*</Form.Label>
                    <Select<OptionType>
                      styles={customStyles}
                      options={roles}
                      value={roles.find((s) => s.value === users.role)}
                      onChange={(selected) =>
                        setUsers({ ...users, role: selected?.value || "" })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Mot de passe*</Form.Label>
                    <div className="d-flex align-items-center position-relative">
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={users.password}
                          onChange={(e) =>
                            setUsers({ ...users, password: e.target.value })
                          }
                        />
                        <InputGroup.Text
                          className="text-end"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FaEyeSlash size={24} />
                          ) : (
                            <FaEye size={24} />
                          )}
                        </InputGroup.Text>
                      </InputGroup>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <hr />
            <div className="d-flex justify-content-end gap-3 button-container">
              <Button variant="primary" type="submit">
                Mettre à jour
              </Button>
              <Button
                className="btn btn-info"
                onClick={() => navigate("/Dashboard")}
              >
                <FaHome size={24} /> Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default Readuser;
