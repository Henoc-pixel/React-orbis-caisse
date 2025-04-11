import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select, { StylesConfig } from "react-select";
import { User, Bon_Approvisionnement } from "@/Components/types";

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

const ModifBonApprovisionnement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState<string>("");
  const [referenceState, setReferenceState] = useState<string>("");
  const [source, setSource] = useState<OptionType | null>(null);
  const [beneficiaire, setBeneficiaire] = useState<string>("");
  const [objet, setObjet] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [referenceSource, setReferenceSource] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  // Récupérer l'utilisateur connecté
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
      }
    };

    fetchUser();
  }, []);

  // Récupérer les données du bon d'approvisionnement à modifier
  useEffect(() => {
    const fetchBonApprovisionnement = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/bon_approvisionnement/${id}`
        );
        const data: Bon_Approvisionnement = await response.json();
        setDate(data.date);
        setReferenceState(data.reference);
        setSource(
          sources.find((s) => s.value === data.source_approvisionnement) || null
        );
        setBeneficiaire(data.beneficiaire);
        setObjet(data.objet);
        setMontant(data.montant);
        setReferenceSource(data.reference_source);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du bon d'approvisionnement :",
          error
        );
      }
    };

    fetchBonApprovisionnement();
  }, [id]);

  // Gestion des changements dans le champ montant (ajout des séparateurs de milliers)
  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = Number(value).toLocaleString();
    setMontant(formattedValue);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      date: new Date().toISOString().split("T")[0], // Date au format YYYY-MM-DD
      reference: referenceState,
      beneficiaire,
      objet,
      source_approvisionnement: source?.value,
      montant: montant.replace(/\D/g, ""),
      reference_source: referenceSource,
      statut: "en attente",
    };

    try {
      const response = await fetch(
        `http://localhost:3000/bon_approvisionnement/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la modification du bon d'approvisionnement."
        );
      }

      toast.success(
        "Bon d'approvisionnement modifié avec succès. Redirection en cours..."
      );
      setTimeout(() => navigate("/List-Bon-Appro"), 2000);
    } catch (error) {
      console.error(
        "Erreur lors de la modification du bon d'approvisionnement :",
        error
      );
      toast.error("Erreur lors de la modification du bon d'approvisionnement.");
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
          <h6 className="mb-0">Modifier un bon d'approvisionnement</h6>
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
                      value={referenceState}
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

export default ModifBonApprovisionnement;
