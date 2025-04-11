import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Table, Row, Col } from "react-bootstrap";
import { FaHome, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bon_Mission, User } from "@/Components/types";
import { useCallback } from "react";

const Ajout_BonMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<bon_Mission | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
      }
    };

    fetchUser();
  }, []);

  // Récupérer les données de la mission
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await fetch(`http://localhost:3000/mission/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la mission");
        }
        const data = await response.json();
        setMission(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement de la mission");
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  // Récupérer tous les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getFullName = useCallback(
    (username: string): string => {
      const user = users.find((u) => u.username === username);
      return user ? `${user.nom} ${user.prenoms}` : username;
    },
    [users]
  ); // Dépendance sur 'users

  // Générer la référence automatique pour le bon de mission
  useEffect(() => {
    const generateReference = async () => {
      if (!mission) return;

      try {
        const response = await fetch("http://localhost:3000/bon_mission");
        const bons = await response.json();
        let newReference = "";

        if (bons.length > 0) {
          const lastReference = bons[bons.length - 1].numero_bon;
          const nextNumber = parseInt(lastReference.slice(-3)) + 1;
          newReference = `N°BM${new Date().getFullYear()}${String(
            nextNumber
          ).padStart(3, "0")}`;
        } else {
          newReference = `N°BM${new Date().getFullYear()}001`;
        }

        setMission((prev) => ({
          ...prev!,
          numero_bon: newReference,
          date_bon: new Date().toISOString().split("T")[0],
          username_bon: currentUser?.username || "",
          beneficiaire_bon: getFullName(mission.username_ordre),
        }));
      } catch (error) {
        console.error("Erreur lors de la génération de la référence :", error);
      }
    };

    if (mission) {
      generateReference();
    }
  }, [mission, currentUser, getFullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mission) return;

    try {
      // Créer le bon de mission
      const response = await fetch("http://localhost:3000/bon_mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mission),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du bon de mission");
      }

      // Mettre à jour le statut de la mission
      const updateResponse = await fetch(
        `http://localhost:3000/mission/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: "convertit" }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Erreur lors de la mise à jour de la mission");
      }

      toast.success("Bon de mission créé avec succès !");
      setTimeout(() => navigate("/List-bon-mission"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création du bon de mission");
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (!mission) return <div className="text-center">Mission non trouvée</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">Créer un bon de mission</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Référence Ordre de mission</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="text"
                      value={new Date(mission.date_ordre).toLocaleDateString(
                        "fr-FR"
                      )}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                      type="text"
                      value={mission.numero_ordre}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Donne ordre à</Form.Label>
                    <Form.Control
                      type="text"
                      value={getFullName(mission.username_ordre)}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                      type="text"
                      value={mission.destinatoin_ordre}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>

            <fieldset>
              <legend>Détails de la mission</legend>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Objet</Form.Label>
                    <Form.Control
                      type="text"
                      value={mission.objet_ordre_mission}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date départ</Form.Label>
                    <Form.Control
                      type="text"
                      value={new Date(
                        mission.date_depart_ordre
                      ).toLocaleDateString("fr-FR")}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date retour</Form.Label>
                    <Form.Control
                      type="text"
                      value={new Date(
                        mission.date_retour_ordre
                      ).toLocaleDateString("fr-FR")}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>

            <fieldset>
              <legend>Information Bon de mission</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="text"
                      value={new Date(mission.date_bon).toLocaleDateString(
                        "fr-FR"
                      )}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                      type="text"
                      value={mission.numero_bon}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bénéficiaire</Form.Label>
                    <Form.Control
                      type="text"
                      value={mission.beneficiaire_bon}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Ville</Form.Label>
                    <Form.Control type="text" value={mission.Ville} readOnly />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>

            <fieldset>
              <legend>Frais de mission</legend>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Rubrique</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {mission.frais_mission.map((frais, index) => (
                    <tr key={index}>
                      <td>{frais.rubrique}</td>
                      <td>{frais.quantité}</td>
                      <td>{frais.prix_unitaire.toLocaleString("fr-FR")}</td>
                      <td>{frais.montant.toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">
                      Total
                    </td>
                    <td className="fw-bold">
                      {mission.Total_frais_mission.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </fieldset>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button variant="primary" type="submit">
                <FaCheck className="me-2" />
                Valider
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                <FaHome className="me-2" />
                Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default Ajout_BonMission;
