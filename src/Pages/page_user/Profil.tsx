import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { User } from "@/Components/types";
import Select, { OnChangeValue, StylesConfig, GroupBase } from "react-select";

// Définir un type pour les options du Select
interface ServiceOption {
  value: string;
  label: string;
}

// Liste des services disponibles
const services: ServiceOption[] = [
  { value: "Service Comptabilité", label: "Service Comptabilité" },
  { value: "Service Secrétariat", label: "Service Secrétariat" },
  { value: "Service Informatique", label: "Service Informatique" },
  { value: "Direction", label: "Direction" },
];

// Styles personnalisés pour le composant Select
const customStyles: StylesConfig<
  ServiceOption,
  false,
  GroupBase<ServiceOption>
> = {
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
const UserEditForm: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null); // État pour stocker les informations de l'utilisateur
  const [formData, setFormData] = useState<Omit<User, "id" | "password">>({
    username: "",
    nom: "",
    prenoms: "",
    telephone: "",
    service: "",
    email: "",
    fonction: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    againPassword: "",
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false); // État pour gérer le mode d'édition du mot de passe

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUser(data); // Mise à jour de l'état utilisateur
        setFormData({
          username: data.username,
          nom: data.nom,
          prenoms: data.prenoms,
          telephone: data.telephone,
          service: data.service,
          email: data.email,
          fonction: data.fonction,
          role: data.role,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
      }
    };

    fetchUser(); // Appel de la fonction pour récupérer les informations de l'utilisateur
  }, []);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    setFormData({ ...formData, [target.name]: target.value });
  };

  // Gestion des changements dans les champs du mot de passe
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Mise à jour des informations de l'utilisateur
  const handleUpdateUser = async () => {
    if (!user) return;

    try {
      const updatedUser = {
        ...formData,
        password: user.password, // On garde l'ancien mot de passe
      };

      await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      toast.success("Informations mises à jour avec succès.");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des informations.");
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    }
  };

  // Modification du mot de passe
  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordData.oldPassword !== user.password) {
      toast.error("L'ancien mot de passe est incorrect.");
      return;
    }
    if (passwordData.newPassword !== passwordData.againPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PATCH", // PATCH au lieu de PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      toast.success(
        "Mot de passe modifié avec succès. Redirection en cours..."
      );
      setTimeout(() => navigate("/"), 2000);
      setPasswordData({ oldPassword: "", newPassword: "", againPassword: "" });
    } catch (error) {
      toast.error("Erreur lors de la modification du mot de passe.");
      console.error("Erreur lors de la modification du mot de passe :", error);
    }
  };

  // Fonction pour gérer le changement de la sélection du service
  const handleSelectChange = (
    selectedOption: OnChangeValue<ServiceOption, false> // Utilisation du bon type ici
  ) => {
    if (selectedOption) {
      setFormData({ ...formData, service: selectedOption.value });
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

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
          <Form>
            <Form.Check
              type="switch"
              id="toggle-password-edit"
              label="Modifier le mot de passe"
              className="mb-3"
              onChange={() => setIsEditingPassword(!isEditingPassword)}
              checked={isEditingPassword}
            />

            {!isEditingPassword ? (
              <>
                <fieldset>
                  <legend style={{ color: "#232754" }}>
                    Modificateur de l'utilisateur
                  </legend>

                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nom*</Form.Label>
                        <Form.Control
                          name="nom"
                          type="text"
                          value={formData.nom}
                          onChange={handleChange}
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
                          value={formData.prenoms}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Service*</Form.Label>
                        <Select<ServiceOption>
                          styles={customStyles}
                          options={services}
                          value={
                            formData.service
                              ? {
                                  value: formData.service,
                                  label: formData.service,
                                }
                              : null
                          }
                          onChange={handleSelectChange} // Type correctement assigné ici
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Fonction*</Form.Label>
                        <Form.Control
                          name="fonction"
                          type="text"
                          value={formData.fonction}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </fieldset>
                <fieldset>
                  <legend style={{ color: "#232754" }}>
                    Coordonnées de l'utilisateur
                  </legend>

                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact*</Form.Label>
                        <Form.Control
                          name="telephone"
                          type="text"
                          value={formData.telephone}
                          onChange={handleChange}
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
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </fieldset>
                <fieldset>
                  <legend style={{ color: "#232754" }}>
                    Compte utilisateur
                  </legend>

                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Identifiant</Form.Label>
                        <Form.Control
                          name="username"
                          type="text"
                          value={formData.username}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </fieldset>
                <hr />

                <div className="d-flex justify-content-end gap-3 button-container">
                  <Button variant="primary" onClick={handleUpdateUser}>
                    Enregistrer
                  </Button>
                  <Button
                    className="btn btn-info btn-custom"
                    onClick={() => navigate("/Dashboard")}
                  >
                    <FaHome size={24} /> Retour
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Ancien mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Confirmer le mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="againPassword"
                        value={passwordData.againPassword}
                        onChange={handlePasswordChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <hr />

                <div className="d-flex justify-content-end gap-3 button-container">
                  <Button variant="primary" onClick={handleChangePassword}>
                    Modifier mot de passe
                  </Button>
                  <Button
                    className="btn btn-dark btn-custom"
                    onClick={() => navigate("/Dashboard")}
                  >
                    <FaHome size={24} /> Retour
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default UserEditForm;
