import React, { useState, useEffect } from "react";
import { Form, Button, Card, Table, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaHome, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { Mission, AgentsMission } from "@/Components/types";

const ModifOrdreMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentsMission[]>([]);
  const [formData, setFormData] = useState<
    Omit<Mission, "id" | "agents"> & { agents: AgentsMission[] }
  >({
    date: "",
    numero_ordre: "",
    gerant: "",
    username: "",
    username_ordre: "",
    destinatoin: "",
    type_operation: "",
    nature_operation: "",
    objet_mission: "",
    date_depart: "",
    date_retour: "",
    statut: "",
    agents: [],
  });
  const [currentUsername, setCurrentUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setCurrentUsername(storedUsername);
    }

    const fetchMission = async () => {
      try {
        const response = await fetch(`http://localhost:3000/mission/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la mission");
        }
        const data: Mission = await response.json();
        setFormData({
          ...data,
          username: currentUsername || data.username,
        });
        setAgents(data.agents);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger la mission");
      }
    };

    fetchMission();
  }, [id, currentUsername]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const updatedAgents = [...agents];
      updatedAgents[index] = {
        ...updatedAgents[index],
        [name]: value,
      };
      setAgents(updatedAgents);
      setFormData((prev) => ({ ...prev, agents: updatedAgents }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAgent = () => {
    const newAgentNumber = agents.length + 1;
    setAgents([
      ...agents,
      {
        numero: newAgentNumber,
        nom_prenoms: "",
        fonction: "",
        service: "",
      },
    ]);
  };

  const handleRemoveAgent = (index: number) => {
    if (agents.length > 1) {
      const updatedAgents = agents
        .filter((_, i) => i !== index)
        .map((agent, idx) => ({
          ...agent,
          numero: idx + 1,
        }));
      setAgents(updatedAgents);
      setFormData((prev) => ({ ...prev, agents: updatedAgents }));
    } else {
      toast.error("Vous devez avoir au moins un agent.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.objet_mission ||
      !formData.destinatoin ||
      !formData.date_depart ||
      !formData.date_retour
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const hasEmptyAgentFields = agents.some(
      (agent) => !agent.nom_prenoms || !agent.fonction || !agent.service
    );

    if (hasEmptyAgentFields) {
      toast.error("Veuillez remplir tous les champs pour chaque agent.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/mission/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          agents: agents,
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la modification");
      }

      toast.success("Mission modifiée avec succès !");
      setTimeout(() => navigate("/List-ordre-mission"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la modification.");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">Modifier l'ordre de mission</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <legend className="float-none w-auto px-3 fw-bold text-primary">
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
                  required
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
                  required
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
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="nature_operation">
                <Form.Label>Nature de l'opération</Form.Label>
                <Form.Control
                  type="text"
                  name="nature_operation"
                  value={formData.nature_operation}
                  onChange={handleInputChange}
                  required
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
                />
              </Form.Group>
            </Row>

            <legend className="float-none w-auto px-3 fw-bold text-primary">
              Agent(s)/Prestataire(s) concerné(s)
            </legend>

            <div className="d-flex justify-content-end mb-3">
              <Button variant="outline-primary" onClick={handleAddAgent}>
                <FaPlus className="me-2" />
                Nouvelle ligne
              </Button>
            </div>

            <div className="table-responsive">
              <Table bordered hover className="mt-3">
                <thead className="">
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
                      <td className="text-center align-middle">
                        <Form.Control
                          type="text"
                          name="numero"
                          value={agent.numero}
                          readOnly
                          className="text-center"
                          required
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
                      <td className="text-center align-middle">
                        <Button
                          variant="danger"
                          size="sm"
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

            <div className="d-flex justify-content-end gap-3 button-container">
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
              <Button
                variant="outline-secondary"
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

export default ModifOrdreMission;
