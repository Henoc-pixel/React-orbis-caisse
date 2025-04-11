import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select, { StylesConfig } from "react-select";
import {
  Retour_Fonds,
  bon_Mission,
  Bon_Caisse,
  Caisse,
  Journée,
  User,
  Journal_Caisse,
} from "@/Components/types";

type OptionType = { value: string; label: string };

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
    throw error;
  }
};

const createJournalEntryForRetourFonds = async (
  formData: Omit<Retour_Fonds, "id">,
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
          new RegExp(`N°JC${caisseCode}${year}(\\d{3})`)
        );
        if (match && match[1]) {
          const num = parseInt(match[1]);
          if (num > lastNumber) lastNumber = num;
        }
      }
    });

    const nextNumber = String(lastNumber + 1).padStart(3, "0");
    const numero_pièce = `N°JC${caisseCode}${year}${nextNumber}`;

    const journalEntry = {
      date: formData.date_retour,
      numero_pièce,
      nature_opération: formData.type_depense,
      libellé: "Retour de fonds",
      entrée: formData.montant_retourné,
      sortie: 0,
      solde: parseFloat(caisse.solde) + formData.montant_retourné,
      username_caissier: formData.username_retour,
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
    throw error;
  }
};

const AjoutRetourFond: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Retour_Fonds, "id">>({
    date_retour: new Date().toISOString().split("T")[0],
    reference_retour: "",
    type_depense: "",
    reference_depense: "",
    username_retour: localStorage.getItem("username") || "",
    montant_sortie: 0,
    montant_retourné: 0,
    statut: "validée",
  });
  const [userCaisse, setUserCaisse] = useState<Caisse | null>(null);
  const [journee, setJournee] = useState<Journée | null>(null);
  const [caisseStatus, setCaisseStatus] = useState<string>("fermer");
  const [showModal, setShowModal] = useState(false);
  const [dateOuverture, setDateOuverture] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [showOpenCaisseModal, setShowOpenCaisseModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [retoursExistants, setRetoursExistants] = useState<Retour_Fonds[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const typeDepenseOptions = [
    { value: "bon_mission", label: "Bon de mission" },
    { value: "bon_caisse", label: "Bon de caisse" },
  ];

  const [referenceOptions, setReferenceOptions] = useState<OptionType[]>([]);
  const [bonsMission, setBonsMission] = useState<bon_Mission[]>([]);
  const [bonsCaisse, setBonsCaisse] = useState<Bon_Caisse[]>([]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.type_depense) {
      errors.type_depense = "Le type de dépense est requis";
    }

    if (!formData.reference_depense) {
      errors.reference_depense = "La référence de dépense est requise";
    }

    if (formData.montant_retourné <= 0) {
      errors.montant_retourné = "Le montant doit être supérieur à 0";
    } else if (formData.montant_retourné > formData.montant_sortie) {
      errors.montant_retourné = "Ne peut pas dépasser le montant sorti";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        if (!response.ok)
          throw new Error("Erreur de récupération de l'utilisateur");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
        toast.error("Erreur lors du chargement des données utilisateur");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [
          caissesResponse,
          journeeResponse,
          retoursResponse,
          missionsResponse,
          caissesResponse2,
        ] = await Promise.all([
          fetch("http://localhost:3000/caisse"),
          fetch("http://localhost:3000/journée"),
          fetch("http://localhost:3000/retour_fonds"),
          fetch("http://localhost:3000/bon_mission"),
          fetch("http://localhost:3000/bon_caisse"),
        ]);

        if (!caissesResponse.ok) throw new Error("Erreur caisses");
        if (!journeeResponse.ok) throw new Error("Erreur journée");
        if (!retoursResponse.ok) throw new Error("Erreur retours");
        if (!missionsResponse.ok) throw new Error("Erreur missions");
        if (!caissesResponse2.ok) throw new Error("Erreur bons caisse");

        const [
          caissesData,
          journeeData,
          retoursData,
          missionsData,
          caissesData2,
        ] = await Promise.all([
          caissesResponse.json(),
          journeeResponse.json(),
          retoursResponse.json(),
          missionsResponse.json(),
          caissesResponse2.json(),
        ]);

        const userCaisse = caissesData.find(
          (c: Caisse) => c.username_caissier === user.username
        );
        setUserCaisse(userCaisse || null);

        const activeJournee = journeeData.find(
          (j: Journée) =>
            j.active === "oui" && j.caissier_username === user?.username
        );
        setJournee(activeJournee || null);
        setCaisseStatus(activeJournee ? "ouvert" : "fermer");

        setRetoursExistants(retoursData);
        setBonsMission(
          missionsData.filter((m: bon_Mission) => m.statut === "convertit")
        );
        setBonsCaisse(
          caissesData2.filter((c: Bon_Caisse) => c.statut === "convertit")
        );

        const lastNumber =
          retoursData.length > 0
            ? parseInt(
                retoursData[retoursData.length - 1].reference_retour.slice(-3)
              ) || 0
            : 0;
        const newNumber = String(lastNumber + 1).padStart(3, "0");
        const newReference = `N°RF${new Date().getFullYear()}${newNumber}`;

        setFormData((prev) => ({ ...prev, reference_retour: newReference }));
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!userCaisse) return;

    if (formData.type_depense === "bon_mission") {
      const filteredMissions = bonsMission.filter((mission) => {
        const hasNoRetour = !retoursExistants.some(
          (retour) => retour.reference_depense === mission.numero_bon
        );
        const matchesCaisse = mission.caisse_décaissé === userCaisse.intitulé;
        return hasNoRetour && matchesCaisse;
      });

      setReferenceOptions(
        filteredMissions.map((m) => ({
          value: m.numero_bon,
          label: `${m.numero_bon} (${formatNumber(
            m.Total_frais_mission
          )} FCFA)`,
        }))
      );
    } else if (formData.type_depense === "bon_caisse") {
      const filteredCaisses = bonsCaisse.filter((caisse) => {
        const hasNoRetour = !retoursExistants.some(
          (retour) => retour.reference_depense === caisse.reference_bon_caisse
        );
        const matchesCaisse = caisse.caisse_décaissé === userCaisse.intitulé;
        return hasNoRetour && matchesCaisse;
      });

      setReferenceOptions(
        filteredCaisses.map((c) => ({
          value: c.reference_bon_caisse,
          label: `${c.reference_bon_caisse} (${formatNumber(
            parseFloat(c.montant_besoin)
          )} FCFA)`,
        }))
      );
    } else {
      setReferenceOptions([]);
    }

    setFormData((prev) => ({
      ...prev,
      reference_depense: "",
      montant_sortie: 0,
      montant_retourné: 0,
    }));
  }, [
    formData.type_depense,
    bonsMission,
    bonsCaisse,
    retoursExistants,
    userCaisse,
  ]);

  const handleReferenceChange = (selectedOption: OptionType | null) => {
    if (!selectedOption) return;

    let montant = 0;

    if (formData.type_depense === "bon_mission") {
      const mission = bonsMission.find(
        (m) => m.numero_bon === selectedOption.value
      );
      montant = mission ? mission.Total_frais_mission : 0;
    } else if (formData.type_depense === "bon_caisse") {
      const caisse = bonsCaisse.find(
        (c) => c.reference_bon_caisse === selectedOption.value
      );
      montant = caisse ? parseFloat(caisse.montant_besoin) : 0;
    }

    setFormData((prev) => ({
      ...prev,
      reference_depense: selectedOption.value,
      montant_sortie: montant,
      montant_retourné: 0,
    }));
  };

  const handleMontantRetourChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value.replace(/\s/g, "")) || 0;

    if (value > formData.montant_sortie) {
      toast.error(
        "Le montant à retourner ne peut pas dépasser le montant sorti"
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      montant_retourné: value,
    }));
  };

  const handleOpenCaisse = async () => {
    try {
      if (!userCaisse) {
        toast.error("Aucune caisse trouvée pour l'utilisateur connecté.");
        return;
      }

      setLoading(true);

      // Ouvrir la caisse
      const response = await fetch(
        `http://localhost:3000/caisse/${userCaisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userCaisse, statut: "ouvert" }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ouverture de la caisse.");
      }

      // Créer une nouvelle journée
      const newJournee = {
        date_ouverture: dateOuverture,
        date_fermeture: "",
        active: "oui",
        debit: "0",
        credit: "0",
        solde: userCaisse.solde,
        caissier_username: userCaisse.username_caissier,
        last_solde: userCaisse.solde,
        caisse_intitulé: userCaisse.intitulé,
      };

      const journeeResponse = await fetch("http://localhost:3000/journée", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJournee),
      });

      if (!journeeResponse.ok) {
        throw new Error("Erreur lors de la création de la journée.");
      }

      // Ajouter l'entrée dans le journal de caisse
      await createJournalEntryForCaisseOuverture(userCaisse, dateOuverture);

      const journeeData = await journeeResponse.json();
      setJournee(journeeData);
      setCaisseStatus("ouvert");
      setShowOpenCaisseModal(false);
      toast.success("Caisse ouverte avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la caisse :", error);
      toast.error("Erreur lors de l'ouverture de la caisse.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dejaRetourne = retoursExistants.some(
      (retour) => retour.reference_depense === formData.reference_depense
    );

    if (dejaRetourne) {
      toast.error(
        "Un retour de fonds a déjà été effectué pour cette référence"
      );
      return;
    }

    setShowModal(true);
  };

  const confirmSubmit = async () => {
    if (!userCaisse) {
      toast.error("Caisse utilisateur non trouvée");
      return;
    }

    try {
      setLoading(true);

      // 1. Enregistrer le retour de fonds
      const response = await fetch("http://localhost:3000/retour_fonds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'enregistrement du retour de fonds");

      // 2. Mettre à jour le solde de la caisse
      const newSolde = parseFloat(userCaisse.solde) + formData.montant_retourné;

      const updateCaisseResponse = await fetch(
        `http://localhost:3000/caisse/${userCaisse.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userCaisse, solde: newSolde.toString() }),
        }
      );

      if (!updateCaisseResponse.ok)
        throw new Error("Erreur lors de la mise à jour de la caisse");

      // 3. Mettre à jour la journée si elle existe
      if (journee) {
        const newDebit = parseFloat(journee.debit) + formData.montant_retourné;
        const newSoldeJournee =
          parseFloat(journee.solde) + formData.montant_retourné;

        const updateJourneeResponse = await fetch(
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

        if (!updateJourneeResponse.ok)
          throw new Error("Erreur lors de la mise à jour de la journée");
      }

      // 4. Ajouter l'entrée dans le journal de caisse
      await createJournalEntryForRetourFonds(formData, userCaisse);

      toast.success("Retour de fonds enregistré avec succès !");
      setTimeout(() => navigate("/List-retour-fonds"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  if (loading || !userCaisse) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
            <Button variant="success" onClick={handleOpenCaisse}>
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
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">Créer un retour de fond</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Information du retour de fond</legend>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="date">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date_retour}
                    readOnly
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="reference">
                  <Form.Label>Référence</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.reference_retour}
                    readOnly
                  />
                </Form.Group>
              </Row>
            </fieldset>

            <fieldset>
              <legend>Détail</legend>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="type_depense">
                  <Form.Label>
                    Type dépense<strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <Select
                    options={typeDepenseOptions}
                    value={typeDepenseOptions.find(
                      (opt) => opt.value === formData.type_depense
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        type_depense: selected?.value || "",
                      }))
                    }
                    styles={customStyles}
                    placeholder="Sélectionnez un type"
                    isSearchable
                    required
                  />
                  {validationErrors.type_depense && (
                    <Form.Text className="text-danger">
                      {validationErrors.type_depense}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group as={Col} controlId="reference_depense">
                  <Form.Label>
                    Référence de la dépense
                    <strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <Select
                    options={referenceOptions}
                    value={referenceOptions.find(
                      (opt) => opt.value === formData.reference_depense
                    )}
                    onChange={handleReferenceChange}
                    styles={customStyles}
                    placeholder="Sélectionnez une référence"
                    isSearchable
                    required
                    isDisabled={!formData.type_depense}
                  />
                  {validationErrors.reference_depense && (
                    <Form.Text className="text-danger">
                      {validationErrors.reference_depense}
                    </Form.Text>
                  )}
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="montant_sortie">
                  <Form.Label>Montant sortie</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={formatNumber(formData.montant_sortie)}
                      readOnly
                    />
                    <InputGroup.Text>F.CFA</InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group as={Col} controlId="montant_retourne">
                  <Form.Label>
                    Montant à retourner
                    <strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={
                        formData.montant_retourné
                          ? formatNumber(formData.montant_retourné)
                          : ""
                      }
                      onChange={handleMontantRetourChange}
                      required
                    />
                    <InputGroup.Text>F.CFA</InputGroup.Text>
                  </InputGroup>
                  {validationErrors.montant_retourné && (
                    <Form.Text className="text-danger">
                      {validationErrors.montant_retourné}
                    </Form.Text>
                  )}
                </Form.Group>
              </Row>
            </fieldset>

            <div className="d-flex justify-content-end gap-3 button-container mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FaCheck className="me-2" /> Enregistrer
                  </>
                )}
              </Button>
              <Button
                variant="info"
                onClick={() => navigate("/Dashboard")}
                disabled={loading}
              >
                <FaHome className="me-2" />
                Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <FaExclamationTriangle className="me-2" />
            Vous êtes sur le point d'enregistrer ce retour de fonds. Cette
            action est irréversible.
          </div>
          <div className="mt-3">
            <strong>Référence:</strong> {formData.reference_retour}
            <br />
            <strong>Type dépense:</strong>{" "}
            {formData.type_depense === "bon_mission"
              ? "Bon de mission"
              : "Bon de caisse"}
            <br />
            <strong>Référence dépense:</strong> {formData.reference_depense}
            <br />
            <strong>Montant sortie:</strong>{" "}
            {formatNumber(formData.montant_sortie)} FCFA
            <br />
            <strong>Montant à retourner:</strong>{" "}
            {formatNumber(formData.montant_retourné)} FCFA
            <br />
            <strong>Caisse concernée:</strong> {userCaisse.intitulé}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button variant="success" onClick={confirmSubmit} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Confirmer"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AjoutRetourFond;
