import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Modal, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Caisse, User, Journée } from "@/Components/types";

const Fermerjournée: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [journee, setJournee] = useState<Journée | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
        toast.error("Erreur lors du chargement des informations utilisateur");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await fetch("http://localhost:3000/caisse");
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des caisses.");
        const data: Caisse[] = await response.json();
        setCaisses(data);
      } catch (error) {
        console.error("Erreur lors du chargement des caisses.", error);
        toast.error("Erreur lors du chargement des caisses");
      }
    };

    fetchCaisses();
  }, []);

  useEffect(() => {
    const fetchJournee = async () => {
      try {
        const response = await fetch("http://localhost:3000/journée");
        if (!response.ok)
          throw new Error("Erreur lors de la récupération de la journée.");
        const data: Journée[] = await response.json();
        const activeJournee = data.find(
          (j) => j.active === "oui" && j.caissier_username === user?.username
        );
        setJournee(activeJournee || null);
      } catch (error) {
        console.error("Erreur lors du chargement de la journée.", error);
        toast.error("Erreur lors du chargement de la journée");
      }
    };

    if (user) {
      fetchJournee();
    }
  }, [user]);

  const handleFermerCaisse = () => {
    setShowConfirmationModal(true);
  };

  const confirmFermeture = () => {
    setLoading(true);
    navigate("/Add-billetage");
  };

  const caisse = caisses.find((c) => c.username_caissier === user?.username);

  if (!user || !caisse) {
    return (
      <Card style={{ width: "700px" }} className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Erreur</h6>
        </Card.Header>
        <Card.Body>
          <p>Impossible de charger les informations de la caisse.</p>
        </Card.Body>
      </Card>
    );
  }

  if (caisse.statut === "fermer") {
    return (
      <Card style={{ width: "40%" }} className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Caisse Fermée</h6>
        </Card.Header>
        <Card.Body>
          <p>La caisse est déjà fermée. Aucune action nécessaire.</p>
          <Button variant="primary" onClick={() => navigate("/Dashboard")}>
            Retour au tableau de bord
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card style={{ width: "40%" }} className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Fermeture de caisse</h6>
        </Card.Header>
        <Card.Body>
          {journee && (
            <>
              <h6 className="border-bottom pb-2">
                Journée du {new Date(journee.date_ouverture).toLocaleString()}
              </h6>
              <Form.Group>
                <Form.Label>Solde theorique*</Form.Label>
                <Form.Control
                  style={{ width: "20%" }}
                  className="text-end"
                  type="text"
                  value={journee.solde}
                  readOnly
                />
              </Form.Group>
            </>
          )}
          <hr />

          <div className="mt-4">
            <div className="d-flex justify-content mt-4">
              <Button
                variant="primary"
                onClick={handleFermerCaisse}
                disabled={loading}
              >
                {loading ? "Chargement..." : "fermer la caisse"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
      >
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Vous êtes sur le point de fermer la caisse. Cette action nécessitera
            un billetage complet.
          </p>
          <p>Voulez-vous continuer ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowConfirmationModal(false)}
          >
            Annuler
          </Button>
          <Button variant="success" onClick={confirmFermeture}>
            Confirmer et procéder au billetage
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Fermerjournée;
