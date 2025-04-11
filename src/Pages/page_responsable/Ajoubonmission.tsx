import React, { useState, useEffect } from "react";
import { Form, Button, Card, Table, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { bon_Mission, DetailFrais, User } from "@/Components/types";
import Select, { StylesConfig } from "react-select";

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

const AjoutBonMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  // Options pour les listes déroulantes
  const villeOptions = [
    "Abidjan",
    "Yamoussoukro",
    "Bouaké",
    "San-Pédro",
    "Korhogo",
    "Daloa",
    "Man",
    "Gagnoa",
    "Abengourou",
    "Divo",
  ].map((ville) => ({ value: ville, label: ville }));

  const rubriqueOptions = [
    "Carburant",
    "Frais de repas",
    "Frais de transport",
    "Frais d'hôtel",
  ].map((rub) => ({ value: rub, label: rub }));

  const currentUser = localStorage.getItem("username") || "";

  const [formData, setFormData] = useState<Omit<bon_Mission, "id">>({
    date_ordre: "",
    numero_ordre: "",
    username_ordre: "",
    destinatoin_ordre: "",
    objet_ordre_mission: "",
    date_depart_ordre: "",
    date_retour_ordre: "",
    date_bon: new Date().toISOString().split("T")[0],
    numero_bon: "",
    username_bon: currentUser,
    beneficiaire_bon: "",
    Ville: "",
    statut: "brouillon",
    frais_mission: [],
    Total_frais_mission: 0,
  });

  const [fraisMission, setFraisMission] = useState<DetailFrais[]>([
    { rubrique: "", quantité: 1, prix_unitaire: 0, montant: 0 },
  ]);

  // Fonction pour formater les nombres avec séparateurs de milliers
  const formatNumberInput = (value: string): string => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Fonction pour convertir la valeur formatée en nombre
  const parseNumberInput = (value: string): number => {
    return parseFloat(value.replace(/\s/g, "")) || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les utilisateurs
        const usersResponse = await fetch("http://localhost:3000/users");
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Récupérer les données de mission
        const missionResponse = await fetch(
          `http://localhost:3000/mission/${id}`
        );
        const missionData = await missionResponse.json();

        // Générer le numéro de bon
        const bonResponse = await fetch("http://localhost:3000/bon_mission");
        const bonsData = await bonResponse.json();
        const lastReference =
          bonsData[bonsData.length - 1]?.numero_bon ||
          `N°BM${new Date().getFullYear()}000`;
        const lastNumber = parseInt(lastReference.slice(-3));
        const newNumber = String(lastNumber + 1).padStart(3, "0");
        const newReference = `N°BM${new Date().getFullYear()}${newNumber}`;

        // Trouver l'utilisateur connecté
        const currentUserData = usersData.find(
          (u: User) => u.username === currentUser
        );
        const fullName = currentUserData
          ? `${currentUserData.nom} ${currentUserData.prenoms}`
          : currentUser;

        setFormData((prev) => ({
          ...prev,
          date_ordre: missionData.date,
          numero_ordre: missionData.numero_ordre,
          username_ordre: missionData.username_ordre,
          destinatoin_ordre: missionData.destinatoin,
          objet_ordre_mission: missionData.objet_mission,
          date_depart_ordre: missionData.date_depart,
          date_retour_ordre: missionData.date_retour,
          numero_bon: newReference,
          beneficiaire_bon: fullName, // On utilise directement fullName ici
        }));
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, [id, currentUser]);

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getFullName = (username: string): string => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === "beneficiaire_bon") {
      setFormData((prev) => ({ ...prev, beneficiaire_bon: value }));
      return;
    }

    if (index !== undefined) {
      const updatedFrais = [...fraisMission];

      if (name === "quantité" || name === "prix_unitaire") {
        const numericValue = parseNumberInput(value);
        updatedFrais[index] = {
          ...updatedFrais[index],
          [name]: numericValue,
          montant:
            name === "quantité"
              ? numericValue * updatedFrais[index].prix_unitaire
              : updatedFrais[index].quantité * numericValue,
        };
      } else {
        updatedFrais[index] = {
          ...updatedFrais[index],
          [name]: value,
        };
      }

      setFraisMission(updatedFrais);

      // Calcul du total
      const total = updatedFrais.reduce((acc, frais) => acc + frais.montant, 0);
      setFormData((prev) => ({
        ...prev,
        Total_frais_mission: total,
        frais_mission: updatedFrais,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (
    selectedOption: OptionType | null,
    field: string,
    index?: number
  ) => {
    if (index !== undefined) {
      const updatedFrais = [...fraisMission];
      updatedFrais[index] = {
        ...updatedFrais[index],
        rubrique: selectedOption?.value || "",
      };
      setFraisMission(updatedFrais);
      setFormData((prev) => ({ ...prev, frais_mission: updatedFrais }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: selectedOption?.value || "",
      }));
    }
  };

  const handleAddFrais = () => {
    setFraisMission([
      ...fraisMission,
      { rubrique: "", quantité: 1, prix_unitaire: 0, montant: 0 },
    ]);
  };

  const handleRemoveFrais = (index: number) => {
    if (fraisMission.length > 1) {
      const updatedFrais = fraisMission.filter((_, i) => i !== index);
      setFraisMission(updatedFrais);

      const total = updatedFrais.reduce((acc, frais) => acc + frais.montant, 0);
      setFormData((prev) => ({
        ...prev,
        Total_frais_mission: total,
        frais_mission: updatedFrais,
      }));
    } else {
      toast.error("Vous devez avoir au moins un frais de mission.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.Ville) {
      toast.error("Veuillez sélectionner une ville.");
      return;
    }

    const hasInvalidFrais = fraisMission.some(
      (frais) =>
        !frais.rubrique || frais.quantité <= 0 || frais.prix_unitaire <= 0
    );

    if (hasInvalidFrais) {
      toast.error("Veuillez remplir correctement tous les frais de mission.");
      return;
    }

    try {
      // 1. Création du bon de mission
      const bonResponse = await fetch("http://localhost:3000/bon_mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!bonResponse.ok)
        throw new Error("Échec de la création du bon de mission");

      // 2. Mise à jour du statut de l'ordre de mission
      const missionResponse = await fetch(
        `http://localhost:3000/mission/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: "convertit" }),
        }
      );

      if (!missionResponse.ok)
        throw new Error("Échec de la mise à jour de l'ordre de mission");

      toast.success("Bon de mission créé et ordre mis à jour avec succès !");
      setTimeout(() => navigate("/List-ordre-mission"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  // Calcul du total des prix unitaires
  const totalPrixUnitaire = fraisMission.reduce(
    (acc, frais) => acc + frais.prix_unitaire,
    0
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">Créer un bon de mission</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Section Référence Ordre de mission */}
            <legend className="fw-bold" style={{ color: "#232754" }}>
              Référence Ordre de mission
            </legend>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="date_ordre">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date_ordre"
                  value={formData.date_ordre}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="numero_ordre">
                <Form.Label>Référence</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_ordre"
                  value={formData.numero_ordre}
                  readOnly
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="username_ordre">
                <Form.Label>Donne ordre à</Form.Label>
                <Form.Control
                  type="text"
                  name="username_ordre"
                  value={getFullName(formData.username_ordre)}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="destinatoin_ordre">
                <Form.Label>De se rendre à</Form.Label>
                <Form.Control
                  type="text"
                  name="destinatoin_ordre"
                  value={formData.destinatoin_ordre}
                  readOnly
                />
              </Form.Group>
            </Row>

            {/* Section Détail */}
            <legend className="fw-bold" style={{ color: "#232754" }}>
              Détail
            </legend>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="objet_ordre_mission">
                <Form.Label>Objet de la mission</Form.Label>
                <Form.Control
                  type="texte"
                  name="objet_ordre_mission"
                  value={formData.objet_ordre_mission}
                  readOnly
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="date_depart_ordre">
                <Form.Label>Date départ</Form.Label>
                <Form.Control
                  type="date"
                  name="date_depart_ordre"
                  value={formData.date_depart_ordre}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="date_retour_ordre">
                <Form.Label>Date retour</Form.Label>
                <Form.Control
                  type="date"
                  name="date_retour_ordre"
                  value={formData.date_retour_ordre}
                  readOnly
                />
              </Form.Group>
            </Row>

            {/* Section Information Bon de mission */}
            <legend className="fw-bold" style={{ color: "#232754" }}>
              Information Bon de mission
            </legend>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="date_bon">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date_bon"
                  value={formData.date_bon}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="numero_bon">
                <Form.Label>Référence</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_bon"
                  value={formData.numero_bon}
                  readOnly
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="beneficiaire_bon">
                <Form.Label>
                  Bénéficiaire<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="beneficiaire_bon"
                  value={formData.beneficiaire_bon}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="Ville">
                <Form.Label>
                  Ville<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Select
                  options={villeOptions}
                  value={villeOptions.find(
                    (opt) => opt.value === formData.Ville
                  )}
                  onChange={(selected) => handleSelectChange(selected, "Ville")}
                  styles={customStyles}
                  placeholder="Sélectionnez une ville"
                  isSearchable
                  required
                />
              </Form.Group>
            </Row>

            {/* Section Frais de mission */}
            <legend className="fw-bold" style={{ color: "#232754" }}>
              Frais de mission
            </legend>

            <div className="table-responsive">
              <div className="d-flex justify-content-end mb-3">
                <Button variant="outline-primary" onClick={handleAddFrais}>
                  <FaPlus className="me-2" />
                  Ajouter une ligne
                </Button>
              </div>

              <Table bordered hover>
                <thead>
                  <tr>
                    <th style={{ width: "60%" }} className="text-center">
                      Rubrique*
                    </th>
                    <th className="text-center">
                      Quantité<strong style={{ color: "#b76ba3" }}>*</strong>
                    </th>
                    <th className="text-center">
                      Prix unitaire (FCFA)
                      <strong style={{ color: "#b76ba3" }}>*</strong>
                    </th>
                    <th className="text-center">Montant (FCFA)</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fraisMission.map((frais, index) => (
                    <tr key={index}>
                      <td>
                        <Select
                          options={rubriqueOptions}
                          value={rubriqueOptions.find(
                            (opt) => opt.value === frais.rubrique
                          )}
                          onChange={(selected) =>
                            handleSelectChange(selected, "rubrique", index)
                          }
                          styles={customStyles}
                          placeholder="Sélectionnez une rubrique"
                          isSearchable
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="quantité"
                          value={formatNumberInput(frais.quantité.toString())}
                          onChange={(e) => handleInputChange(e, index)}
                          className="text-end"
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="prix_unitaire"
                          value={formatNumberInput(
                            frais.prix_unitaire.toString()
                          )}
                          onChange={(e) => handleInputChange(e, index)}
                          className="text-end"
                          required
                        />
                      </td>
                      <td className="text-end">
                        <Form.Control
                          type="text"
                          name="total"
                          value={frais.montant.toLocaleString("fr-FR")}
                          className="text-end"
                          required
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveFrais(index)}
                          disabled={fraisMission.length <= 1}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan={2}>Total</td>

                    <td className="text-end">
                      {totalPrixUnitaire.toLocaleString("fr-FR")}
                    </td>
                    <td className="text-end">
                      {formData.Total_frais_mission.toLocaleString("fr-FR")}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end gap-3 button-container mt-4">
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
              <Button
                className="btn btn-info btn-custom"
                onClick={() => navigate(-1)}
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

export default AjoutBonMission;
