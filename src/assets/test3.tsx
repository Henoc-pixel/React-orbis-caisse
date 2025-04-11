import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Caisse, User, Journée } from "@/Components/types";

const Fermer_journée: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [journee, setJournee] = useState<Journée | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOpenCaisseModal, setShowOpenCaisseModal] = useState(false);
  const [dateOuverture, setDateOuverture] = useState<string>(
    new Date().toISOString().slice(0, 16)
  ); // Format datetime-local

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
      }
    };

    fetchJournee();
  }, [user]);

  const handleFermerCaisse = async () => {
    try {
      const caisse = caisses.find(
        (c) => c.username_caissier === user?.username
      );
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/caisse/${caisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...caisse, statut: "fermer" }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la fermeture de la caisse.");
      }

      if (journee) {
        const updateJourneeResponse = await fetch(
          `http://localhost:3000/journée/${journee.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...journee,
              date_fermeture: new Date().toISOString().slice(0, 16),
              active: "non",
            }),
          }
        );

        if (!updateJourneeResponse.ok) {
          throw new Error("Erreur lors de la mise à jour de la journée.");
        }
      }

      toast.success("Caisse fermée avec succès.");
      navigate("/Add-Bon-Appro");
    } catch (error) {
      console.error("Erreur lors de la fermeture de la caisse :", error);
      toast.error("Erreur lors de la fermeture de la caisse.");
    }
  };

  const handleOpenCaisse = async () => {
    try {
      const caisse = caisses.find(
        (c) => c.username_caissier === user?.username
      );
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/caisse/${caisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...caisse, statut: "ouvert" }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ouverture de la caisse.");
      }

      const newJournee = {
        date_ouverture: dateOuverture,
        date_fermeture: "",
        active: "oui",
        debit: "0",
        credit: "0",
        solde: caisse.solde,
        caissier_username: caisse.username_caissier,
        last_solde: caisse.solde,
        caisse_intitulé: caisse.intitulé,
      };

      const journeeResponse = await fetch("http://localhost:3000/journée", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJournee),
      });

      if (!journeeResponse.ok) {
        throw new Error("Erreur lors de la création de la journée.");
      }

      setShowOpenCaisseModal(false);
      toast.success("Caisse ouverte avec succès.");
      navigate("/Dashboard");
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la caisse :", error);
      toast.error("Erreur lors de l'ouverture de la caisse.");
    }
  };

  const caisse = caisses.find((c) => c.username_caissier === user?.username);

  if (caisse?.statut === "ouvert") {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Card style={{ width: "700px" }} className="shadow">
          <Card.Header
            className="text-white"
            style={{ backgroundColor: "#232754" }}
          >
            <h6 className="mb-0">Fermer la Caisse</h6>
          </Card.Header>
          <Card.Body>
            {journee && (
              <>
                <h6>
                  Journée du {new Date(journee.date_ouverture).toLocaleString()}
                </h6>
                <Form.Group>
                  <Form.Label>Solde de la journée</Form.Label>
                  <Form.Control type="text" value={journee.solde} readOnly />
                </Form.Group>
              </>
            )}
            <p>Êtes-vous sûr de vouloir fermer la caisse ?</p>
            <Button
              variant="primary"
              onClick={() => setShowConfirmationModal(true)}
            >
              Fermer la Caisse
            </Button>
          </Card.Body>
        </Card>

        <Modal
          show={showConfirmationModal}
          onHide={() => setShowConfirmationModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmation de fermeture</Modal.Title>
          </Modal.Header>
          <Modal.Body>Êtes-vous sûr de vouloir fermer la caisse ?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmationModal(false)}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={handleFermerCaisse}>
              Confirmer
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card style={{ width: "700px" }} className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Caisse Fermée</h6>
        </Card.Header>
        <Card.Body>
          <p>
            La caisse est actuellement fermée. Veuillez l'ouvrir pour effectuer
            des opérations.
          </p>
          <Form.Group>
            <Form.Label>Date et heure d'ouverture</Form.Label>
            <Form.Control
              type="datetime-local"
              value={dateOuverture}
              onChange={(e) => setDateOuverture(e.target.value)}
              required
            />
          </Form.Group>
          <p></p>
          <Button
            variant="primary"
            onClick={() => setShowOpenCaisseModal(true)}
          >
            Ouvrir la Caisse
          </Button>
        </Card.Body>
      </Card>

      <Modal
        show={showOpenCaisseModal}
        onHide={() => setShowOpenCaisseModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ouvrir la Caisse</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir ouvrir la caisse ?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOpenCaisseModal(false)}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={handleOpenCaisse}>
            Ouvrir
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Fermer_journée;
