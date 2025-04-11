import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Button, Card, } from "react-bootstrap";
import Select, { StylesConfig } from "react-select"; // Import correct de StylesConfig
import { FaHome, } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Societe } from "@/Components/types";

// Définir un type pour les options du Select
type OptionType = { value: string; label: string };

// Liste des services disponibles
const Formejuridique: OptionType[] = [
  { value: "Société anonyme", label: "Société anonyme" },
  {
    value: "Société à responsabilité limitée",
    label: "Société à responsabilité limitée",
  },
  {
    value: "Société à responsabilité limitée unipersonnelle",
    label: "Société à responsabilité limitée unipersonnelle",
  },
  { value: "Entreprise individuelle", label: "Entreprise individuelle" },
  { value: "Société civile immobilière", label: "Société civile immobilière" },
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
const Readsociete: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Récupération de l'ID de l'utilisateur depuis l'URL
  const navigate = useNavigate(); // Hook pour la navigation
  const [societe, setSociete] = useState<Societe | null>(null); // État pour les données de la socité

  // Récupération des données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/societe/${id}`);
        if (!response.ok) throw new Error("Erreur de récupération des données");
        const data = await response.json();
        setSociete(data);
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
      await fetch(`http://localhost:3000/societe/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(societe),
      });
      toast.success("Société mis à jour avec succès !"); // Notification de succès
      setTimeout(() => navigate("/Societe"), 2000); // Redirection vers le tableau de bord
    } catch {
      toast.error("Une erreur est survenue."); // Notification d'erreur
    }
  };

  if (!societe) return <p>Chargement...</p>; // Affichage d'un message de chargement si les données ne sont pas encore chargées

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Conteneur pour les notifications toast */}
      <Card className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Modifier une société</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleUpdate}>
            <fieldset>
              <legend>Organisation de la société</legend>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={societe.date}
                      onChange={(e) =>
                        setSociete({ ...societe, date: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Raison sociale</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.raison_sociale}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          raison_sociale: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Forme juridique</Form.Label>
                    <Select<OptionType>
                      styles={customStyles}
                      options={Formejuridique}
                      value={Formejuridique.find(
                        (s) => s.value === societe.forme_juridique
                      )}
                      onChange={(selected) =>
                        setSociete({
                          ...societe,
                          forme_juridique: selected?.value || "",
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Activité</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.activite}
                      onChange={(e) =>
                        setSociete({ ...societe, activite: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Coordonnée géographique</legend>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Siège social</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.siege_sociale}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          siege_sociale: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Adresse postale</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.adresse_postale}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          adresse_postale: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Ville</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.ville}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          ville: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Pays</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.pays}
                      onChange={(e) =>
                        setSociete({ ...societe, pays: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Contact de la société</legend>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.telephone}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          telephone: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.email}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Site internet</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.site_web}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          site_web: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Immatriculation de la société</legend>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Code commerce</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.code_commercial}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          code_commercial: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Numéro compte contribuable</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.numero_compte_contribuable}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          numero_compte_contribuable: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Régime fiscal</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.regime_fiscale}
                      onChange={(e) =>
                        setSociete({
                          ...societe,
                          regime_fiscale: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Numéro télé déclarant</Form.Label>
                    <Form.Control
                      type="text"
                      value={societe.numero_tele_declarant}
                      onChange={(e) =>
                        setSociete({ ...societe, numero_tele_declarant: e.target.value })
                      }
                      required
                    />
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

export default Readsociete;
