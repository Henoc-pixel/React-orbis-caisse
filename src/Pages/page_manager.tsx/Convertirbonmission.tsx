import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaHome, FaCheck } from "react-icons/fa";
import {
  bon_Mission,
  User,
  Caisse,
  Journée,
  Journal_Caisse,
} from "@/Components/types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};
const createJournalEntryForCaisseOuverture = async (
  caisse: Caisse,
  dateOuverture: string
) => {
  try {
    const journalEntry = {
      date: new Date().toISOString().split("T")[0],
      numero_pièce: "",
      nature_opération: `Solde de la ${caisse.intitulé} au ${new Date(
        dateOuverture
      ).toLocaleDateString("fr-FR")}`,
      libellé: "",
      entrée: 0,
      sortie: 0,
      solde: parseFloat(caisse.solde),
      username_caissier: caisse.username_caissier,
      caisse_intitulé: caisse.intitulé,
    };

    const response = await fetch("http://localhost:3000/journal_caisse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(journalEntry),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'entrée du journal");
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée du journal:", error);
  }
};
const createJournalEntryForBonMission = async (
  bonData: bon_Mission,
  caisse: Caisse
) => {
  try {
    const journalResponse = await fetch("http://localhost:3000/journal_caisse");
    const journalEntries: Journal_Caisse[] = await journalResponse.json();

    const caisseCode = caisse.code;
    const year = new Date().getFullYear();

    const caisseEntries = journalEntries.filter(
      (entry) => entry.caisse_intitulé === caisse.intitulé
    );

    let lastNumber = 0;
    caisseEntries.forEach((entry) => {
      if (entry.numero_pièce) {
        const match = entry.numero_pièce.match(
          new RegExp(`N°J${caisseCode}${year}(\\d{3})`)
        );
        if (match && match[1]) {
          const num = parseInt(match[1]);
          if (num > lastNumber) lastNumber = num;
        }
      }
    });

    const nextNumber = String(lastNumber + 1).padStart(3, "0");
    const numero_pièce = `N°J${caisseCode}${year}${nextNumber}`;

    const journalEntry = {
      date: new Date().toISOString().split("T")[0],
      numero_pièce,
      nature_opération: "638400 - Missions",
      libellé: bonData.objet_ordre_mission,
      entrée: 0,
      sortie: bonData.Total_frais_mission,
      solde: parseFloat(caisse.solde) - bonData.Total_frais_mission,
      username_caissier: caisse.username_caissier,
      caisse_intitulé: caisse.intitulé,
    };

    const response = await fetch("http://localhost:3000/journal_caisse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(journalEntry),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'entrée du journal");
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée du journal:", error);
    toast.error("Erreur lors de l'enregistrement dans le journal de caisse");
  }
};

const Convertirmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<bon_Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [journee, setJournee] = useState<Journée | null>(null);
  const [caisseStatus, setCaisseStatus] = useState<string>("fermer");
  const [showOpenCaisseModal, setShowOpenCaisseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dateOuverture, setDateOuverture] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
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
    const fetchMission = async () => {
      try {
        const response = await fetch(`http://localhost:3000/bon_mission/${id}`);
        if (!response.ok)
          throw new Error("Erreur lors du chargement de la mission");
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
        setCaisseStatus(activeJournee ? "ouvert" : "fermer");
      } catch (error) {
        console.error("Erreur lors du chargement de la journée.", error);
        toast.error("Erreur lors du chargement de la journée");
      }
    };

    if (user) {
      fetchJournee();
    }
  }, [user]);

  const handleOpenCaisse = async () => {
    try {
      setLoading(true);
      const caisse = caisses.find(
        (c) => c.username_caissier === user?.username
      );
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      // Ouvrir la caisse
      const caisseResponse = await fetch(
        `http://localhost:3000/caisse/${caisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...caisse, statut: "ouvert" }),
        }
      );

      if (!caisseResponse.ok)
        throw new Error("Erreur lors de l'ouverture de la caisse");

      // Créer une nouvelle journée
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

      if (!journeeResponse.ok)
        throw new Error("Erreur lors de la création de la journée");
      await createJournalEntryForCaisseOuverture(caisse, dateOuverture);

      const createdJournee = await journeeResponse.json();
      setJournee(createdJournee);
      setCaisseStatus("ouvert");
      setShowOpenCaisseModal(false);
      toast.success("Caisse ouverte avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la caisse :", error);
      toast.error("Erreur lors de l'ouverture de la caisse");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertir = async () => {
    if (!mission) {
      toast.error("Aucune mission à convertir");
      return;
    }

    if (caisseStatus === "fermer") {
      setShowOpenCaisseModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmConvertir = async () => {
    if (!mission) return;

    try {
      setLoading(true);
      const caisse = caisses.find(
        (c) => c.username_caissier === user?.username
      );
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      const totalMontant = mission.Total_frais_mission;
      if (totalMontant > Number(caisse.solde)) {
        toast.error("Le montant du bon dépasse le solde de la caisse.");
        return;
      }

      // Mettre à jour le bon de mission avec le champ caisse_décaissé
      const updateResponse = await fetch(
        `http://localhost:3000/bon_mission/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            statut: "convertit",
            caisse_décaissé: caisse.intitulé, // Ajout du nouveau champ
          }),
        }
      );

      if (!updateResponse.ok)
        throw new Error("Échec de la mise à jour du bon de mission");

      // Mettre à jour la caisse
      const newSolde = Number(caisse.solde) - totalMontant;
      const updateCaisseResponse = await fetch(
        `http://localhost:3000/caisse/${caisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...caisse, solde: newSolde.toString() }),
        }
      );

      if (!updateCaisseResponse.ok)
        throw new Error("Échec de la mise à jour de la caisse");

      // Mettre à jour la journée si elle existe
      if (journee) {
        const newCredit = Number(journee.credit) + totalMontant;
        const newSoldeJournee = Number(journee.solde) - totalMontant;

        const updateJourneeResponse = await fetch(
          `http://localhost:3000/journée/${journee.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...journee,
              credit: newCredit.toString(),
              solde: newSoldeJournee.toString(),
            }),
          }
        );

        if (!updateJourneeResponse.ok)
          throw new Error("Échec de la mise à jour de la journée");
      }
      await createJournalEntryForBonMission(mission, caisse);

      toast.success(
        "Bon de mission convertie avec succès ! et caisse décaissé"
      );
      setTimeout(() => navigate("/List-bonmission-attente"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la conversion");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (loading && !mission) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Alert variant="danger">Mission non trouvée</Alert>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4">
            Bon de mission {mission.numero_bon}
          </Card.Title>
          <hr />

          <fieldset>
            <h6 style={{ color: "#232754" }}>Detail de l'ordre de mission</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Numéro d'odre</th>
                  <th className="text-center align-middle">Donne ordre à</th>
                  <th className="text-center align-middle">De se rendre à</th>
                  <th className="text-center align-middle">
                    Objet de la mission
                  </th>
                  <th className="text-center align-middle">Date départ</th>
                  <th className="text-center align-middle">Date retour</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_ordre)}
                  </td>
                  <td className="align-middle">{mission.numero_ordre}</td>
                  <td className="align-middle">{mission.username_ordre}</td>
                  <td className="align-middle">{mission.destinatoin_ordre}</td>
                  <td className="align-middle">
                    {mission.objet_ordre_mission}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_depart_ordre)}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_retour_ordre)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <fieldset>
            <h6 style={{ color: "#232754" }}>Information Bon de mission</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Référence</th>
                  <th className="text-center align-middle">Bénéficiare</th>
                  <th className="text-center align-middle">Ville</th>
                  <th className="text-center align-middle">Montant (F.CFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_bon)}
                  </td>
                  <td className="align-middle">{mission.numero_bon}</td>
                  <td className="align-middle">{mission.beneficiaire_bon}</td>
                  <td className="align-middle">{mission.Ville}</td>
                  <td className="align-middle text-end">
                    {mission.Total_frais_mission.toLocaleString("fr-FR")}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <div className="d-flex justify-content-end gap-3 button-container mt-4">
            {mission.statut !== "convertit" && (
              <Button
                variant="success"
                onClick={handleConvertir}
                disabled={loading}
              >
                <FaCheck size={20} />
                {loading ? "Chargement..." : "Décaissement"}
              </Button>
            )}
            <Button
              className="btn btn-info"
              onClick={() => navigate("/Dashboard")}
              disabled={loading}
            >
              <FaHome className="me-2" /> Retour
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showOpenCaisseModal}
        onHide={() => setShowOpenCaisseModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ouvrir la Caisse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOpenCaisseModal(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenCaisse}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Ouvrir"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation de conversion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir convertir ce bon de mission ?
          <div className="mt-3">
            <strong>Référence:</strong> {mission.numero_bon}
            <br />
            <strong>Montant:</strong>{" "}
            {mission.Total_frais_mission.toLocaleString()} FCFA
            <br />
            <strong>Bénéficiaire:</strong> {mission.beneficiaire_bon}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={confirmConvertir}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Confirmer"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Convertirmission;
