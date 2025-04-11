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
  Besoin,
  Bon_Caisse,
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

const createJournalEntryForBonCaisse = async (
  bonCaisseData: Bon_Caisse,
  caisse: Caisse,
  besoin: Besoin
) => {
  try {
    // Récupérer le dernier numéro de pièce pour cette caisse
    const journalResponse = await fetch("http://localhost:3000/journal_caisse");
    const journalEntries: Journal_Caisse[] = await journalResponse.json();

    const caisseCode = caisse.code; // Ex: "C001" ou "C002"
    const year = new Date().getFullYear();

    // Filtrer les entrées pour cette caisse
    const caisseEntries = journalEntries.filter(
      (entry) => entry.caisse_intitulé === caisse.intitulé
    );

    // Trouver le dernier numéro
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
      date: new Date().toISOString().split("T")[0], // Date du jour
      numero_pièce,
      nature_opération: besoin.nature_operation,
      libellé: besoin.details.map((d) => d.objet).join(", "), // Concatène tous les objets du besoin
      entrée: 0,
      sortie: parseFloat(bonCaisseData.montant_besoin),
      solde:
        parseFloat(caisse.solde) - parseFloat(bonCaisseData.montant_besoin),
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
    throw error; // Propage l'erreur pour la gérer dans handleValidation
  }
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

const Ajoutboncaisse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [date_besoin, setDate_besoin] = useState<string>("");
  const [reference_besoin, setReference_besoin] = useState<string>("");
  const [montant_besoin, setMontant_besoin] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [besoin, setBesoin] = useState<Besoin | null>(null);
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
    const fetchBesoin = async () => {
      try {
        const response = await fetch(`http://localhost:3000/besoin/${id}`);
        const data: Besoin = await response.json();
        setBesoin(data);
        setDate_besoin(formatDate(data.date));
        setReference_besoin(data.reference);
        const totalMontant = data.details.reduce(
          (acc, detail) => acc + detail.montant,
          0
        );
        setMontant_besoin(totalMontant.toLocaleString());
      } catch (error) {
        console.error("Erreur lors de la récupération du besoin :", error);
        toast.error("Erreur lors du chargement du besoin");
      }
    };

    fetchBesoin();
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
        const response = await fetch("http://localhost:3000/bon_caisse");
        const data = await response.json();
        const lastRef =
          data.length > 0
            ? data[data.length - 1].reference_bon_caisse
            : `N°BC${new Date().getFullYear()}000`;
        const nextNum = parseInt(lastRef.slice(-3)) + 1;
        setReference_besoin(
          `N°BC${new Date().getFullYear()}${String(nextNum).padStart(3, "0")}`
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
    if (!user || !besoin) return;

    try {
      setLoading(true);
      const caisse = caisses.find((c) => c.username_caissier === user.username);
      if (!caisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      const montantTotal = besoin.details.reduce(
        (acc, detail) => acc + detail.montant,
        0
      );
      if (montantTotal > Number(caisse.solde)) {
        toast.error("Le montant du besoin dépasse le solde de la caisse.");
        return;
      }

      // Créer le bon de caisse
      const bonCaisseData: Bon_Caisse = {
        id: Date.now().toString(),
        date_besoin: besoin.date,
        reference_besoin: besoin.reference,
        nature_operation_besoin: besoin.nature_operation,
        type_operation_besoin: besoin.type_operation,
        montant_besoin: montantTotal.toString(),
        date_bon_caisse: new Date().toISOString().split("T")[0],
        reference_bon_caisse: reference_besoin,
        beneficiaire: besoin.beneficiaire,
        caisse_décaissé: caisse.intitulé,
        statut: "convertit",
      };

      const bonResponse = await fetch("http://localhost:3000/bon_caisse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bonCaisseData),
      });

      if (!bonResponse.ok)
        throw new Error("Erreur lors de la création du bon de caisse");

      // Mettre à jour le besoin
      const besoinResponse = await fetch(`http://localhost:3000/besoin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...besoin, statut: "convertit" }),
      });

      if (!besoinResponse.ok)
        throw new Error("Erreur lors de la mise à jour du besoin");

      // Mettre à jour la caisse
      const newSolde = Number(caisse.solde) - montantTotal;
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

      // Mettre à jour la journée si elle existe
      if (journee) {
        const newCredit = Number(journee.credit) + montantTotal;
        const newSoldeJournee = Number(journee.solde) - montantTotal;

        const journeeUpdateResponse = await fetch(
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

        if (!journeeUpdateResponse.ok)
          throw new Error("Erreur lors de la mise à jour de la journée");
      }
      // Ajouter l'entrée dans le journal de caisse
      await createJournalEntryForBonCaisse(bonCaisseData, caisse, besoin);

      toast.success("Bon de caisse créé avec succès !");
      setTimeout(() => navigate("/List-bon-caisse"), 1500);
    } catch (error) {
      console.error("Erreur lors du décaissement :", error);
      toast.error("Erreur lors du décaissement");
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
          <h6 className="mb-0">Créer un bon de caisse</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Référence fiche de besoin</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      name="date"
                      type="text"
                      value={date_besoin}
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
                      value={besoin?.reference}
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
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Type d'Opération</Form.Label>
                    <Form.Control
                      name="type_operation"
                      type="text"
                      value={besoin?.type_operation}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Nature Opération</Form.Label>
                    <Form.Control
                      name="nature_operation"
                      type="text"
                      value={besoin?.nature_operation}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Montant à Payer (FCFA)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        name="montant"
                        type="text"
                        value={montant_besoin}
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
              <legend>Information bon de caisse</legend>
              <Row>
                <Col md={4}>
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
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Référence</Form.Label>
                    <Form.Control
                      name="référence"
                      type="text"
                      value={reference_besoin}
                      readOnly
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Bénéficiaire</Form.Label>
                    <Form.Control
                      name="bénéficiaire"
                      type="text"
                      value={besoin?.beneficiaire}
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
                <FaCheck className="me-2" /> Décaissement
              </Button>
              <Button
                className="btn btn-info"
                onClick={() => navigate("/Dashboard")}
                disabled={loading}
              >
                <FaHome className="me-2" /> Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Validation du bon de caisse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir valider ce bon de caisse ?
          <div className="mt-3">
            <strong>Référence:</strong> {reference_besoin}
            <br />
            <strong>Montant:</strong> {montant_besoin} FCFA
            <br />
            <strong>Bénéficiaire:</strong> {besoin?.beneficiaire}
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
};

export default Ajoutboncaisse;
