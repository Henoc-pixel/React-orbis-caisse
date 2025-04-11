import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { Form, Button, Card, Row, Col, Table } from "react-bootstrap";
import { BesoinFormData } from "@/Components/types";
import "@/assets/css/LireBesoin.css";
import Select, { StylesConfig } from "react-select";
import { natureOperations, typeOperations } from "@/Components/operations";

type SelectOption = { value: string; label: string };

const customStyles: StylesConfig<SelectOption, false> = {
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

const AddBesoinForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [filteredNatureOperations, setFilteredNatureOperations] = useState<
    SelectOption[]
  >([]);
  const [details, setDetails] = useState([
    { objet: "", quantite: 1, prixUnitaire: 0, montant: 0 },
  ]);
  const [userInfo, setUserInfo] = useState<{
    nom: string;
    prenoms: string;
    service: string;
  } | null>(null);
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUserInfo({
          nom: data.nom,
          prenoms: data.prenoms,
          service: data.service,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations de l'utilisateur :",
          error
        );
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      setFormData((prev) => ({
        ...prev,
        username_besoin: username,
      }));
    }
  }, [username]);

  useEffect(() => {
    const fetchLastReference = async () => {
      try {
        const response = await fetch("http://localhost:3000/besoin");
        const data = await response.json();
        const lastReference = data[data.length - 1]?.reference || "N°FB2024000";
        const lastNumber = parseInt(lastReference.slice(-3));
        const newReference = `N°FB${new Date().getFullYear()}${String(
          lastNumber + 1
        ).padStart(3, "0")}`;
        setReference(newReference);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la dernière référence :",
          error
        );
      }
    };

    fetchLastReference();
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const jour = String(today.getDate()).padStart(2, "0");
    const mois = String(today.getMonth() + 1).padStart(2, "0");
    const annee = today.getFullYear();
    return `${jour}/${mois}/${annee}`;
  };

  const formatDateForAPI = (date: string) => {
    if (!date) return "";
    const [jour, mois, annee] = date.split("/");
    return `${annee}-${mois}-${jour}`;
  };

  const [formData, setFormData] = useState<BesoinFormData>({
    date: getCurrentDate(),
    emetteur:
      userInfo?.service === "Service Informatique" ? "Otron Andre" : "M Wognin",
    destinataire: "Konan Gwladys",
    beneficiaire: username ? `${userInfo?.nom} ${userInfo?.prenoms}` : "",
    nature_operation: "",
    type_operation: "",
    username_besoin: username ? `${username}` : "",
    details: details,
    statut: "brouillon",
    reference: reference,
  });

  useEffect(() => {
    if (username && userInfo) {
      setFormData((prev) => ({
        ...prev,
        beneficiaire: `${userInfo.nom} ${userInfo.prenoms}`,
        emetteur:
          userInfo.service === "Service Informatique"
            ? "Otron Andre"
            : "Wognin",
      }));
    }
  }, [username, userInfo]);

  const formatNumberWithSeparator = (value: number): string => {
    return value.toLocaleString("fr-FR");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;

    // Supprimer les séparateurs de milliers et convertir en nombre
    const rawValue = value.replace(/\s/g, ""); // Supprimer les espaces (séparateurs de milliers)
    const numericValue = parseFloat(rawValue) || 0; // Convertir en nombre (ou 0 si la conversion échoue)

    // Empêcher les nombres négatifs
    if (
      (name === "quantite" || name === "prixUnitaire" || name === "montant") &&
      numericValue < 0
    ) {
      toast.error("Les valeurs négatives ne sont pas autorisées.");
      return;
    }

    if (index !== undefined && name in details[index]) {
      const updatedDetails = [...details];
      updatedDetails[index] = {
        ...updatedDetails[index],
        [name]:
          name === "quantite" || name === "prixUnitaire" ? numericValue : value,
      };
      updatedDetails[index].montant =
        updatedDetails[index].quantite * updatedDetails[index].prixUnitaire; // Calcul du montant
      setDetails(updatedDetails);
      setFormData((prev) => ({ ...prev, details: updatedDetails }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      { objet: "", quantite: 1, prixUnitaire: 0, montant: 0 },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    if (details.length > 1) {
      const updatedDetails = details.filter((_, i) => i !== index);
      setDetails(updatedDetails);
      setFormData((prev) => ({ ...prev, details: updatedDetails }));
    } else {
      toast.error("Vous ne pouvez pas supprimer la dernière ligne.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      date: formatDateForAPI(formData.date),
      details: details,
      reference: reference,
    };

    try {
      const response = await fetch("http://localhost:3000/besoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Échec de l'ajout du besoin.");
      }

      const result = await response.json();
      toast.success("Besoin ajouté avec succès. Redirection en cours...");
      setTimeout(() => navigate("/List-FDB"), 2000);
      console.log("Réponse API :", result);

      setFormData({
        date: getCurrentDate(),
        emetteur:
          userInfo?.service === "Service Informatique"
            ? "Otron Andre"
            : "Wognin",
        destinataire: "Konan Gwladys",
        beneficiaire: username ? `${userInfo?.nom} ${userInfo?.prenoms}` : "",
        nature_operation: "",
        type_operation: "",
        username_besoin: username ? `${username}` : "",
        statut: "brouillon",
        details: [{ objet: "", quantite: 1, prixUnitaire: 0, montant: 0 }],
        reference: reference,
      });
      setDetails([{ objet: "", quantite: 1, prixUnitaire: 0, montant: 0 }]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du besoin:", error);
      toast.error("Erreur lors de l'ajout du besoin.");
    }
  };

  const totalMontant = details.reduce((acc, detail) => acc + detail.montant, 0);

  const handleSelectChange = (
    selectedOption: SelectOption | null,
    field: string
  ) => {
    if (selectedOption && field === "type_operation") {
      const filtered = natureOperations
        .filter((nature) => {
          const correspondingType = typeOperations.find(
            (type) => type["Compte de centralisation"] === selectedOption.value
          );
          return (
            correspondingType &&
            nature["Numéro de compte"] === correspondingType["Numéro de compte"]
          );
        })
        .map((op) => ({
          value: op["Libellé"],
          label: op["Libellé"],
        }));
      setFilteredNatureOperations(filtered);
    }

    setFormData((prevData) => ({
      ...prevData,
      [field]: selectedOption ? selectedOption.value : "",
    }));
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div>
        <Card className="shadow">
          <Card.Header
            className="text-white"
            style={{ backgroundColor: "#232754" }}
          >
            <h6 className="mb-0">Créer une fiche de besoin</h6>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <legend
                className="float-none w-auto px-3 fw-bold"
                style={{ color: "#232754" }}
              >
                <h6>Information fiche de besoin</h6>
              </legend>

              <Row className="mb-3">
                <Form.Group as={Col}>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    readOnly
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Référence</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    readOnly
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col}>
                  <Form.Label>Émetteur</Form.Label>
                  <Form.Control
                    type="text"
                    name="emetteur"
                    value={formData.emetteur}
                    onChange={handleInputChange}
                    readOnly
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>
                    Bénéficiaire<strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="beneficiaire"
                    value={formData.beneficiaire}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col}>
                  <Form.Label>
                    Type d'opération
                    <strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <Select<SelectOption>
                    options={typeOperations.map((op) => ({
                      value: op["Compte de centralisation"],
                      label: op["Compte de centralisation"],
                    }))}
                    value={
                      formData.type_operation
                        ? {
                            value: formData.type_operation,
                            label: formData.type_operation,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, "type_operation")
                    }
                    placeholder="Sélectionner un type d'opération..."
                    isSearchable
                    styles={customStyles}
                    required
                  />
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Label>
                    Nature de l'opération
                    <strong style={{ color: "#b76ba3" }}>*</strong>
                  </Form.Label>
                  <Select<SelectOption>
                    options={filteredNatureOperations}
                    value={filteredNatureOperations.find(
                      (option) => option.value === formData.nature_operation
                    )}
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, "nature_operation")
                    }
                    placeholder="Sélectionner une nature d'opération..."
                    isSearchable
                    styles={customStyles}
                    required
                  />
                </Form.Group>
              </Row>

              <legend
                className="float-none w-auto px-3 fw-bold"
                style={{ color: "#232754" }}
              >
                <h6>Détails de l'Opération</h6>
              </legend>

              <div className="table-responsive custom-table">
                <div className="d-flex justify-content-end gap-3 button-container">
                  <Button
                    variant="outline-primary"
                    onClick={handleAddDetail}
                    className="mb-3"
                  >
                    <FaPlus /> Nouvelle ligne
                  </Button>
                </div>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "50%" }}>
                        Objet de dépense
                      </th>
                      <th className="text-center">Quantité</th>
                      <th className="text-center">Prix</th>
                      <th className="text-center">Montant (F.CFA)</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Control
                            type="text"
                            name="objet"
                            value={detail.objet}
                            onChange={(e) => handleInputChange(e, index)}
                            required
                          />
                        </td>
                        <td className="text-end">
                          <Form.Control
                            type="text"
                            className="text-end"
                            name="quantite"
                            value={formatNumberWithSeparator(detail.quantite)}
                            onChange={(e) => handleInputChange(e, index)}
                            required
                          />
                        </td>
                        <td className="text-end">
                          <Form.Control
                            type="text"
                            className="text-end"
                            name="prixUnitaire"
                            value={formatNumberWithSeparator(
                              detail.prixUnitaire
                            )}
                            onChange={(e) => handleInputChange(e, index)}
                            required
                          />
                        </td>
                        <td className="text-end">
                          <Form.Control
                            className="text-end"
                            type="text"
                            name="montant"
                            value={formatNumberWithSeparator(detail.montant)}
                            readOnly
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveDetail(index)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3}>
                        <strong>Total</strong>
                      </td>
                      <td className="text-end" colSpan={2}>
                        <Form.Control
                          type="text"
                          className="text-end"
                          name="totalMontant"
                          value={formatNumberWithSeparator(totalMontant)}
                          readOnly
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-end gap-3 button-container">
                <Button
                  type="submit"
                  variant="primary"
                  className="ms-auto d-flex"
                >
                  Enregistrer
                </Button>
                <Button
                  className="btn btn-info btn-custom"
                  onClick={() => navigate("/Dashboard")}
                >
                  <FaHome size={24} /> Retour
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default AddBesoinForm;
