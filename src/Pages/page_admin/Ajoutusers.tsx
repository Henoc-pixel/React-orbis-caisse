import React, { useState, useEffect, FormEvent } from "react"; // Import des modules React nécessaires
import { useNavigate } from "react-router-dom"; // Import pour la navigation
import { Row, Col, Form, Button, Card } from "react-bootstrap"; // Import des composants Bootstrap
import Select, { StylesConfig } from "react-select"; // Import du composant Select pour les listes déroulantes
import { FaHome } from "react-icons/fa"; // Import de l'icône Home
import { ToastContainer, toast } from "react-toastify"; // Import pour les notifications toast
import "react-toastify/dist/ReactToastify.css"; // Import des styles CSS pour les notifications toast

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

// Composant principal pour l'ajout d'un utilisateur
const UserAddForm: React.FC = () => {
  const navigate = useNavigate(); // Hook pour la navigation
  const [nom, setNom] = useState(""); // État pour le nom de l'utilisateur
  const [prenoms, setPrenoms] = useState(""); // État pour les prénoms de l'utilisateur
  const [service, setService] = useState<OptionType | null>(null); // État pour le service sélectionné
  const [role, setRole] = useState<OptionType | null>(null); // État pour le rôle sélectionné
  const [fonction, setFonction] = useState(""); // État pour la fonction de l'utilisateur
  const [telephone, setTelephone] = useState(""); // État pour le téléphone de l'utilisateur
  const [email, setEmail] = useState(""); // État pour l'email de l'utilisateur
  const [password, setPassword] = useState<string>(""); // État pour le mot de passe de l'utilisateur
  const [username, setUsername] = useState(""); // État pour le nom d'utilisateur

  // Génération automatique du nom d'utilisateur basé sur le premier prénom
  useEffect(() => {
    if (prenoms) {
      const premierPrenom = prenoms.split(" ")[0].toLowerCase(); // Extraction du premier prénom
      setUsername(premierPrenom); // Mise à jour du nom d'utilisateur
    }
  }, [prenoms]);

  // Fonction pour générer un mot de passe aléatoire de 8 caractères
  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Génération d'un mot de passe aléatoire
  };

  // Initialisation du mot de passe lors du premier rendu
  useEffect(() => {
    const initialPassword = generateRandomPassword(); // Génération du mot de passe initial
    setPassword(initialPassword); // Mise à jour du mot de passe
  }, []);

  // Gestion de la soumission du formulaire
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page

    try {
      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          nom,
          prenoms,
          service: service?.value, // Utilisation de la valeur du service
          role: role?.value, // Utilisation de la valeur du rôle
          fonction,
          telephone,
        }),
      });

      toast.success("Compte créé avec succès !"); // Notification de succès
      setTimeout(() => navigate("/List-User"), 2000); // Redirection après 2 secondes
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer."); // Notification d'erreur
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />{" "}
      {/* Conteneur pour les notifications toast */}
      <Card className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">
            <i className="fa fa-pencil-alt"></i> Informations de l'utilisateur
          </h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSignUp}>
            <fieldset>
              <legend>Ajouter un utilisateur</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom*</Form.Label>
                    <Form.Control
                      name="nom"
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénoms*</Form.Label>
                    <Form.Control
                      name="prenoms"
                      type="text"
                      value={prenoms}
                      onChange={(e) => setPrenoms(e.target.value)}
                      required
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
                      value={service}
                      onChange={(selected) => setService(selected)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Fonction*</Form.Label>
                    <Form.Control
                      name="fonction"
                      type="text"
                      value={fonction}
                      onChange={(e) => setFonction(e.target.value)}
                      required
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
                    <Form.Label>Contact*</Form.Label>
                    <Form.Control
                      name="telephone"
                      type="text"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email*</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                    <Form.Label>Identifiant</Form.Label>
                    <Form.Control
                      name="username"
                      type="text"
                      value={username}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Rôle*</Form.Label>
                    <Select<OptionType>
                      styles={customStyles}
                      options={roles}
                      value={role}
                      onChange={(selected) => setRole(selected)}
                      menuPlacement="top"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <hr />
            <div className="d-flex justify-content-end gap-3 button-container">
              <Button variant="primary" type="submit">
                Enregistrer
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

export default UserAddForm;
