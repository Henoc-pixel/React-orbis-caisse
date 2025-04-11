import React, { useState, useEffect } from "react";
import { Form, Button, Card, Table, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { Mission, AgentsMission, User } from "@/Components/types";

const AjoutOrdreMission: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentsMission[]>([
    { numero: 1, nom_prenoms: "", fonction: "", service: "" },
  ]);

  const currentDate = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<
    Omit<Mission, "id" | "agents"> & { agents: AgentsMission[] }
  >({
    date: currentDate,
    numero_ordre: "",
    gerant: "OFFSET CONSULTING",
    username: "",
    username_ordre: "",
    destinatoin: "",
    type_operation: "638 - Autres charges externes",
    nature_operation: "638400 - Missions",
    objet_mission: "",
    date_depart: "",
    date_retour: "",
    statut: "brouillon",
    agents: agents,
  });

  useEffect(() => {
    const initializeFormData = async () => {
      const storedUsername = localStorage.getItem("username");
      const userId = localStorage.getItem("userId");

      // Récupérer les infos utilisateur
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3000/users/${userId}`);
          if (!response.ok)
            throw new Error("Erreur de récupération utilisateur");

          const userData: User = await response.json();
          const fullName = `${userData.nom} ${userData.prenoms}`.trim();

          setFormData((prev) => ({
            ...prev,
            username: storedUsername || "",
            username_ordre: fullName,
          }));
        } catch (error) {
          console.error("Erreur:", error);
          toast.error("Erreur de chargement des données utilisateur");
          setFormData((prev) => ({ ...prev, username: storedUsername || "" }));
        }
      }

      // Générer le numéro d'ordre
      try {
        const response = await fetch("http://localhost:3000/mission");
        if (!response.ok) throw new Error("Erreur de génération numéro");

        const missions: Mission[] = await response.json();
        const lastOrder =
          missions[missions.length - 1]?.numero_ordre ||
          `N°OM${new Date().getFullYear()}000`;
        const lastNumber = parseInt(lastOrder.slice(-3));
        const newNumber = String(lastNumber + 1).padStart(3, "0");
        const newOrder = `N°OM${new Date().getFullYear()}${newNumber}`;

        setFormData((prev) => ({ ...prev, numero_ordre: newOrder }));
      } catch (error) {
        console.error("Erreur:", error);
        const fallbackNumber = `N°OM${new Date().getFullYear()}001`;
        setFormData((prev) => ({ ...prev, numero_ordre: fallbackNumber }));
        toast.error("Erreur de génération du numéro d'ordre");
      }
    };

    initializeFormData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const updatedAgents = [...agents];
      updatedAgents[index] = { ...updatedAgents[index], [name]: value };
      setAgents(updatedAgents);
      setFormData((prev) => ({ ...prev, agents: updatedAgents }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAgent = () => {
    setAgents([
      ...agents,
      {
        numero: agents.length + 1,
        nom_prenoms: "",
        fonction: "",
        service: "",
      },
    ]);
  };

  const handleRemoveAgent = (index: number) => {
    if (agents.length <= 1) {
      toast.error("Vous devez avoir au moins un agent");
      return;
    }

    const updatedAgents = agents
      .filter((_, i) => i !== index)
      .map((agent, idx) => ({ ...agent, numero: idx + 1 }));

    setAgents(updatedAgents);
    setFormData((prev) => ({ ...prev, agents: updatedAgents }));
  };

  const validateForm = (): boolean => {
    // Validation des champs principaux
    if (
      !formData.objet_mission ||
      !formData.destinatoin ||
      !formData.date_depart ||
      !formData.date_retour
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    // Validation des dates
    if (new Date(formData.date_retour) < new Date(formData.date_depart)) {
      toast.error("La date de retour doit être après la date de départ");
      return false;
    }

    // Validation des agents
    const invalidAgent = agents.some(
      (agent) => !agent.nom_prenoms || !agent.fonction || !agent.service
    );

    if (invalidAgent) {
      toast.error("Veuillez remplir tous les champs pour chaque agent");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:3000/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur d'enregistrement");

      toast.success("Ordre de mission créé avec succès !");
      setTimeout(() => navigate("/List-ordre-mission"), 2000);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">Créer un ordre de mission</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <legend
              className="float-none w-auto px-3 fw-bold"
              style={{ color: "#232754" }}
            >
              Information Ordre de mission
            </legend>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="date">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="numero_ordre">
                <Form.Label>Numéro d'ordre</Form.Label>
                <Form.Control
                  type="text"
                  name="numero_ordre"
                  value={formData.numero_ordre}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="gerant">
                <Form.Label>Gérant</Form.Label>
                <Form.Control
                  type="text"
                  name="gerant"
                  value={formData.gerant}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="username_ordre">
                <Form.Label>
                  Donne ordre à<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username_ordre"
                  value={formData.username_ordre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="type_operation">
                <Form.Label>Type de l'opération</Form.Label>
                <Form.Control
                  type="text"
                  name="type_operation"
                  value={formData.type_operation}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>

              <Form.Group as={Col} controlId="nature_operation">
                <Form.Label>Nature de l'opération</Form.Label>
                <Form.Control
                  type="text"
                  name="nature_operation"
                  value={formData.nature_operation}
                  onChange={handleInputChange}
                  readOnly
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="objet_mission">
                <Form.Label>
                  Objet de la mission
                  <strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="objet_mission"
                  value={formData.objet_mission}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} controlId="destinatoin">
                <Form.Label>
                  De se rendre à<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="destinatoin"
                  value={formData.destinatoin}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="date_depart">
                <Form.Label>
                  Date départ<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date_depart"
                  value={formData.date_depart}
                  onChange={handleInputChange}
                  required
                  min={currentDate}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="date_retour">
                <Form.Label>
                  Date retour<strong style={{ color: "#b76ba3" }}>*</strong>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date_retour"
                  value={formData.date_retour}
                  onChange={handleInputChange}
                  required
                  min={formData.date_depart || currentDate}
                />
              </Form.Group>
            </Row>

            <legend
              className="float-none w-auto px-3 fw-bold"
              style={{ color: "#232754" }}
            >
              <h6>Agent(s)/Prestataire(s) concerné(s)</h6>
            </legend>

            <div className="table-responsive">
              <div className="d-flex justify-content-end mb-3">
                <Button variant="outline-primary" onClick={handleAddAgent}>
                  <FaPlus className="me-2" /> Nouvelle ligne
                </Button>
              </div>

              <Table bordered hover>
                <thead>
                  <tr>
                    <th style={{ width: "10%" }} className="text-center">
                      N°
                    </th>
                    <th className="text-center">
                      Nom et prénoms
                      <strong style={{ color: "#b76ba3" }}>*</strong>
                    </th>
                    <th className="text-center">
                      Fonction<strong style={{ color: "#b76ba3" }}>*</strong>
                    </th>
                    <th className="text-center">
                      Service<strong style={{ color: "#b76ba3" }}>*</strong>
                    </th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <Form.Control
                          type="text"
                          name="numero"
                          value={agent.numero}
                          readOnly
                          className="text-center"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="nom_prenoms"
                          value={agent.nom_prenoms}
                          onChange={(e) => handleInputChange(e, index)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="fonction"
                          value={agent.fonction}
                          onChange={(e) => handleInputChange(e, index)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name="service"
                          value={agent.service}
                          onChange={(e) => handleInputChange(e, index)}
                          required
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveAgent(index)}
                          disabled={agents.length <= 1}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end gap-3 button-container mt-4">
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
              <Button
                variant="outline-secondary"
                className="btn btn-info btn-custom"
                onClick={() => navigate("/Dashboard")}
              >
                <FaHome className="me-2" /> Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default AjoutOrdreMission;
