import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select, { StylesConfig } from "react-select";
import { User, Caisse, Journée } from "@/Components/types";

type OptionType = { value: string; label: string };

const sources: OptionType[] = [
  { value: "Banque", label: "Banque" },
  { value: "Prêt", label: "Prêt" },
];

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, { isFocused }) => ({
    ...base,
    boxShadow: "none",
    borderColor: isFocused ? "#232754" : base.borderColor,
    "&:hover": {
      borderColor: "#232754",
    },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#232754" : isFocused ? "#f0f0f0" : "white",
    color: isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "#232754",
      color: "white",
    },
  }),
  menu: (base) => ({
    ...base,
    maxHeight: 200,
    overflowY: "auto",
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
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

const BonapprovisionnementAddForm: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [source, setSource] = useState<OptionType | null>(null);
  const [beneficiaire, setBeneficiaire] = useState<string>("");
  const [objet, setObjet] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [referenceSource, setReferenceSource] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [caisseStatus, setCaisseStatus] = useState<string>("fermer");
  const [dateOuverture, setDateOuverture] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [showOpenCaisseModal, setShowOpenCaisseModal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUser(data);
        setBeneficiaire(data.username);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
        toast.error("Erreur lors de la récupération de l'utilisateur.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const today = new Date();
    const jour = String(today.getDate()).padStart(2, "0");
    const mois = String(today.getMonth() + 1).padStart(2, "0");
    const annee = today.getFullYear();
    setDate(`${jour}/${mois}/${annee}`);
  }, []);

  useEffect(() => {
    const fetchLastReference = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/bon_approvisionnement"
        );
        const bons = await response.json();
        if (bons.length > 0) {
          const lastReference = bons[bons.length - 1].reference;
          const nextReferenceNumber = parseInt(lastReference.slice(-3)) + 1;
          setReference(
            `N°BA${new Date().getFullYear()}${String(
              nextReferenceNumber
            ).padStart(3, "0")}`
          );
        } else {
          setReference(`N°BA${new Date().getFullYear()}001`);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des bons d'approvisionnement :",
          error
        );
        toast.error("Erreur lors de la génération de la référence.");
      }
    };

    fetchLastReference();
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
        setCaisseStatus(activeJournee ? "ouvert" : "fermer");
      } catch (error) {
        console.error("Erreur lors du chargement de la journée.", error);
      }
    };

    if (user) {
      fetchJournee();
    }
  }, [user]);

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = Number(value).toLocaleString();
    setMontant(formattedValue);
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

      await createJournalEntryForCaisseOuverture(caisse, dateOuverture);

      setCaisseStatus("ouvert");
      setShowOpenCaisseModal(false);
      toast.success("Caisse ouverte avec succès !.");
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la caisse :", error);
      toast.error("Erreur lors de l'ouverture de la caisse.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!source) {
      toast.error("Veuillez sélectionner une source d'approvisionnement.");
      return;
    }

    const dataToSend = {
      date: new Date().toISOString().split("T")[0],
      reference,
      beneficiaire,
      objet,
      source_approvisionnement: source.value,
      montant: montant.replace(/\D/g, ""),
      reference_source: referenceSource,
      statut: "en attente",
    };

    try {
      const response = await fetch(
        "http://localhost:3000/bon_approvisionnement",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du bon d'approvisionnement.");
      }

      toast.success(
        "Bon d'approvisionnement ajouté avec succès. Redirection en cours..."
      );
      setTimeout(() => navigate("/List-Bon-Appro"), 2000);
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout du bon d'approvisionnement :",
        error
      );
      toast.error("Erreur lors de l'ajout du bon d'approvisionnement.");
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
              >
                Ouvrir
              </Button>
            </Form.Group>
            <p></p>
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
            <Button className="btn btn-success" onClick={handleOpenCaisse}>
              Ouvrir
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
          <h6 className="mb-0">Créer un bon d'approvisionnement</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Information bon d'approvisionnement</legend>
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
                      value={reference}
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
                    <Form.Label>
                      Objet<strong style={{ color: "#b76ba3" }}>*</strong>
                    </Form.Label>
                    <Form.Control
                      name="objet"
                      type="text"
                      value={objet}
                      onChange={(e) => setObjet(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </fieldset>

            <fieldset>
              <legend>Détail opération</legend>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Source d'approvisionnement
                      <strong style={{ color: "#b76ba3" }}>*</strong>
                    </Form.Label>
                    <Select<OptionType>
                      styles={customStyles}
                      options={sources}
                      value={source}
                      onChange={(selected) => setSource(selected)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Montant (FCFA)
                      <strong style={{ color: "#b76ba3" }}>*</strong>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        className="text-end"
                        name="montant"
                        type="text"
                        value={montant}
                        onChange={handleMontantChange}
                        required
                      />
                      <InputGroup.Text>F.CFA</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Source de la référence
                      <strong style={{ color: "#b76ba3" }}>*</strong>
                    </Form.Label>
                    <Form.Control
                      name="reference_source"
                      type="text"
                      value={referenceSource}
                      onChange={(e) => setReferenceSource(e.target.value)}
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

export default BonapprovisionnementAddForm;
