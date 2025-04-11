import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaHome, FaCheck } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Bon_Approvisionnement,
  Reçu_Caisse,
  Caisse,
  Journée,
  Journal_Caisse,
} from "@/Components/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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

const createJournalEntryForRecuCaisse = async (
  recuData: Reçu_Caisse,
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
      nature_opération: recuData.objet_bon,
      libellé: "",
      entrée: parseFloat(recuData.montant),
      sortie: 0,
      solde: parseFloat(caisse.solde) + parseFloat(recuData.montant),
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

const Ajoutreçucaisse: React.FC = () => {
  // ... (le reste du code existant reste inchangé jusqu'à la fonction handleValidation)
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState<string>("");
  const [referenceState, setReferenceState] = useState<string>("");
  const [objet, setObjet] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [bonApprovisionnement, setBonApprovisionnement] =
    useState<Bon_Approvisionnement | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [caisseStatus, setCaisseStatus] = useState<string>("fermer");
  const [showOpenCaisseModal, setShowOpenCaisseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [journee, setJournee] = useState<Journée | null>(null);
  const [dateOuverture, setDateOuverture] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);

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
    const fetchBonApprovisionnement = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/bon_approvisionnement/${id}`
        );
        const data: Bon_Approvisionnement = await response.json();
        setBonApprovisionnement(data);
        setDate(formatDate(data.date));
        setObjet(data.objet);
        setMontant(data.montant);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du bon d'approvisionnement :",
          error
        );
        toast.error("Erreur lors du chargement du bon d'approvisionnement");
      }
    };

    fetchBonApprovisionnement();
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

  useEffect(() => {
    const generateReference = async () => {
      try {
        const response = await fetch("http://localhost:3000/reçu_caisse");
        const data = await response.json();
        const lastRef =
          data.length > 0
            ? data[data.length - 1].reference_reçu
            : `N°RC${new Date().getFullYear()}000`;
        const nextNum = parseInt(lastRef.slice(-3)) + 1;
        setReferenceState(
          `N°RC${new Date().getFullYear()}${String(nextNum).padStart(3, "0")}`
        );
      } catch (error) {
        console.error("Erreur lors de la génération de la référence :", error);
      }
    };

    generateReference();
  }, []);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleValidation = async () => {
    if (!user || !bonApprovisionnement) return;

    try {
      setLoading(true);
      const caisse = caisses.find(
        (c) => c.username_caissier === bonApprovisionnement.beneficiaire
      );
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour le bénéficiaire.");
        return;
      }

      const montantNum = Number(montant.replace(/\D/g, ""));
      if (montantNum + Number(caisse.solde) > Number(caisse.plafond)) {
        toast.error("Le montant dépasse le plafond de la caisse.");
        return;
      }

      const recuData: Reçu_Caisse = {
        id: Date.now().toString(),
        date_bon: bonApprovisionnement.date,
        reference_bon: bonApprovisionnement.reference,
        beneficiaire: bonApprovisionnement.beneficiaire,
        objet_bon: bonApprovisionnement.objet,
        montant: montantNum.toString(),
        date_reçu: new Date().toISOString().split("T")[0],
        reference_reçu: referenceState,
        caisse_approvisionné: caisse.intitulé,
      };

      const recuResponse = await fetch("http://localhost:3000/reçu_caisse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recuData),
      });

      if (!recuResponse.ok)
        throw new Error("Erreur lors de la création du reçu de caisse");

      const bonResponse = await fetch(
        `http://localhost:3000/bon_approvisionnement/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bonApprovisionnement,
            statut: "convertit",
          }),
        }
      );

      if (!bonResponse.ok)
        throw new Error(
          "Erreur lors de la mise à jour du bon d'approvisionnement"
        );

      const newSolde = Number(caisse.solde) + montantNum;
      const caisseUpdateResponse = await fetch(
        `http://localhost:3000/caisse/${caisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...caisse, solde: newSolde.toString() }),
        }
      );

      if (!caisseUpdateResponse.ok)
        throw new Error("Erreur lors de la mise à jour de la caisse");

      if (journee) {
        const newDebit = Number(journee.debit) + montantNum;
        const newSoldeJournee = Number(journee.solde) + montantNum;

        const journeeUpdateResponse = await fetch(
          `http://localhost:3000/journée/${journee.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...journee,
              debit: newDebit.toString(),
              solde: newSoldeJournee.toString(),
            }),
          }
        );

        if (!journeeUpdateResponse.ok)
          throw new Error("Erreur lors de la mise à jour de la journée");
      }

      // Appel à la nouvelle fonction pour le journal
      await createJournalEntryForRecuCaisse(recuData, caisse);

      toast.success("Reçu de caisse créé avec succès !");
      setTimeout(() => navigate("/List-Bon-Appro"), 1500);
    } catch (error) {
      console.error("Erreur lors de l'encaissement :", error);
      toast.error("Erreur lors de l'encaissement");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  if (caisseStatus === "fermer") {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Card style={{ width: "40%" }} className="shadow">
          <Card.Header
            className="text-white"
            style={{ backgroundColor: "#232754" }}
          >
            <h6 className="mb-0">Ouverture de la caisse</h6>
          </Card.Header>
          <Card.Body>
            <Form.Group className="d-flex align-items-center gap-2 mb-0">
              <Form.Label>Date</Form.Label>
              <Form.Control
                className="mb-0 ml-3"
                type="datetime-local"
                value={dateOuverture}
                onChange={(e) => setDateOuverture(e.target.value)}
                required
              />
              <Button
                className="mb-0 ml-6"
                variant="primary"
                onClick={() => setShowOpenCaisseModal(true)}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Ouvrir"}
              </Button>
            </Form.Group>
          </Card.Body>
        </Card>

        <Modal
          show={showOpenCaisseModal}
          onHide={() => setShowOpenCaisseModal(false)}
        >
          <Modal.Header style={{ background: "#f7c46c" }} closeButton>
            <Modal.Title>Ouvrir la Caisse</Modal.Title>
          </Modal.Header>
          <Modal.Body>Êtes-vous sûr de vouloir ouvrir la caisse ?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={() => setShowOpenCaisseModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleOpenCaisse}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Ouvrir"}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Créer un reçu de caisse</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Référence Bon Approvisionnement</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      name="date"
                      type="text"
                      value={date}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                      name="référence"
                      type="text"
                      value={bonApprovisionnement?.reference}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Détail</legend>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Objet</Form.Label>
                    <Form.Control
                      name="objet"
                      type="text"
                      value={objet}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bénéficiaire</Form.Label>
                    <Form.Control
                      name="bénéficiaire"
                      type="text"
                      value={user ? `${user.nom} ${user.prenoms}` : ""}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Montant à encaisser (FCFA)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        name="montant"
                        type="text"
                        value={montant}
                        readOnly
                        required
                      />
                      <InputGroup.Text>F.CFA</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <fieldset>
              <legend>Information Reçu de caisse</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      name="date"
                      type="text"
                      value={formatDate(new Date().toISOString())}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                      name="référence"
                      type="text"
                      value={referenceState}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>
            <hr />
            <div className="d-flex justify-content-end gap-3 button-container">
              <Button variant="success" type="submit" disabled={loading}>
                <FaCheck size={20} /> Encaissement
              </Button>
              <Button
                className="btn btn-info"
                onClick={() => navigate("/Dashboard")}
                disabled={loading}
              >
                <FaHome size={24} /> Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Validation du reçu de caisse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir valider ce reçu de caisse ?
          <div className="mt-3">
            <strong>Référence:</strong> {referenceState}
            <br />
            <strong>Montant:</strong> {montant.toLocaleString()} FCFA
            <br />
            <strong>Bénéficiaire:</strong>{" "}
            {user ? `${user.nom} ${user.prenoms}` : ""}
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
            onClick={handleValidation}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Confirmer"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );

  // ... (le reste du code existant reste inchangé)
};

export default Ajoutreçucaisse;
