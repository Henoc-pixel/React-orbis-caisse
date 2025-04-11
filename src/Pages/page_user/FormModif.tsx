import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Form, Button, Card, Row, Col, Table } from "react-bootstrap";
import { BesoinFormData } from "@/Components/types";
import "@/assets/css/LireBesoin.css";
import Select, { StylesConfig } from "react-select";
import { natureOperations, typeOperations } from "@/Components/operations";
import { FaHome, FaPlus, FaTrash } from "react-icons/fa";

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

const ModifBesoin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BesoinFormData>({
    date: "",
    emetteur: "",
    destinataire: "Konan Gwladys",
    beneficiaire: "",
    nature_operation: "",
    type_operation: "",
    username_besoin: "",
    details: [{ objet: "", quantite: 1, prixUnitaire: 0, montant: 0 }],
    statut: "brouillon",
    reference: "",
  });

  const [filteredNatureOperations, setFilteredNatureOperations] = useState<
    SelectOption[]
  >([]);
  const [details, setDetails] = useState([
    { objet: "", quantite: 1, prixUnitaire: 0, montant: 0 },
  ]);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchBesoin = async () => {
      try {
        const response = await fetch(`http://localhost:3000/besoin/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du besoin.");
        }
        const data = await response.json();
        setFormData({
          date: formatDateForInput(data.date),
          emetteur: data.emetteur,
          destinataire: data.destinataire,
          beneficiaire: data.beneficiaire,
          nature_operation: data.nature_operation,
          type_operation: data.type_operation,
          username_besoin: data.username_besoin,
          details: data.details,
          statut: data.statut,
          reference: data.reference,
        });
        setDetails(data.details);

        const filtered = natureOperations
          .filter(
            (nature) => nature["Numéro de compte"] === data.type_operation
          )
          .map((op) => ({
            value: op["Libellé"],
            label: op["Libellé"],
          }));
        setFilteredNatureOperations(filtered);
      } catch (error) {
        console.error("Erreur lors du chargement du besoin:", error);
        toast.error("Erreur lors du chargement du besoin.");
      }
    };

    fetchBesoin();
  }, [id]);

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

    const rawValue = value.replace(/\s/g, "");
    const numericValue = parseFloat(rawValue) || 0;

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
        updatedDetails[index].quantite * updatedDetails[index].prixUnitaire;
      setDetails(updatedDetails);
      setFormData((prev) => ({ ...prev, details: updatedDetails }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

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
      details: details,
    };

    try {
      const response = await fetch(`http://localhost:3000/besoin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Échec de la modification du besoin.");
      }

      const result = await response.json();
      toast.success("Besoin modifié avec succès. Redirection en cours...");
      setTimeout(() => navigate("/List-FDB"), 2000);
      console.log("Réponse API :", result);
    } catch (error) {
      console.error("Erreur lors de la modification du besoin:", error);
      toast.error("Erreur lors de la modification du besoin.");
    }
  };

  const totalMontant = details.reduce((acc, detail) => acc + detail.montant, 0);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div>
        <Card className="shadow">
          <Card.Header
            className="text-white"
            style={{ backgroundColor: "#232754" }}
          >
            <h6 className="mb-0">Modifier la fiche de besoin</h6>
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
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    readOnly
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Référence</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    required
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
                    required
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
                  />
                </Form.Group>
              </Row>

              <legend
                className="float-none w-auto px-3 fw-bold"
                style={{ color: "#232754" }}
              >
                <h6>Détails de l'Opération</h6>
              </legend>

              <div className="d-flex justify-content-end gap-3 button-container">
                <Button
                  variant="outline-primary"
                  onClick={handleAddDetail}
                  className="mb-3"
                >
                  <FaPlus /> Nouvelle ligne
                </Button>
              </div>
              <div className="table-responsive custom-table">
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
                            type="text"
                            className="text-end"
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
                  style={{ backgroundColor: "#232754", color: "white" }}
                  className="ms-auto d-flex btn-dark"
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

export default ModifBesoin;
