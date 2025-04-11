import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button } from "react-bootstrap";
import { FaHome, FaEdit, FaExchangeAlt } from "react-icons/fa";
import { Mission, User } from "@/Components/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LireOrdreMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Ajout pour stocker la liste des utilisateurs

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await fetch(`http://localhost:3000/mission/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la mission");
        }
        const data = await response.json();
        setMission(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
      }
    };

    // Nouvelle fonction pour charger tous les utilisateurs
    const fetchAllUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchMission();
    fetchUserRole();
    fetchAllUsers(); // Charger tous les utilisateurs
  }, [id]);

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getFullName = (username: string) => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username;
  };

  const handleConvertir = async () => {
    if (!mission) return;

    try {
      // Rediriger vers la page de création du bon de mission
      navigate(`/Add-bon-mission/${id}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la conversion");
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (!mission) return <div className="text-center">Mission non trouvée</div>;

  return (
    <Card className="shadow">
      <Card.Body>
        <Card.Title as="h3" className="mb-4 title-color">
          Ordre de mission {mission.numero_ordre}
        </Card.Title>
        <hr />
        <h6 style={{ color: "#232754" }}>Information Ordre de mission</h6>

        <fieldset>
          <Table bordered className="mb-4">
            <tbody>
              <tr>
                <td width="20%" className="fw-bold">
                  Date
                </td>
                <td>{new Date(mission.date).toLocaleDateString("fr-FR")}</td>
              </tr>
              <tr>
                <td className="fw-bold">Gérant</td>
                <td>{mission.gerant}</td>
              </tr>
              <tr>
                <td className="fw-bold">Donne ordre à</td>
                <td>{getFullName(mission.username_ordre)}</td>{" "}
                {/* Modification ici */}
              </tr>
              <tr>
                <td className="fw-bold">Type opération</td>
                <td>{mission.type_operation}</td>
              </tr>
              <tr>
                <td className="fw-bold">Nature opération</td>
                <td>{mission.nature_operation}</td>
              </tr>
              <tr>
                <td className="fw-bold">Objet mission</td>
                <td>{mission.objet_mission}</td>
              </tr>
              <tr>
                <td className="fw-bold">Destination</td>
                <td>{mission.destinatoin}</td>
              </tr>
              <tr>
                <td className="fw-bold">Date départ</td>
                <td>
                  {new Date(mission.date_depart).toLocaleDateString("fr-FR")}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Date retour</td>
                <td>
                  {new Date(mission.date_retour).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            </tbody>
          </Table>
        </fieldset>

        <fieldset>
          <h6 style={{ color: "#232754" }}>
            Agent(s)/Prestataire(s) concerné(s)
          </h6>
          <Table bordered hover>
            <thead className="">
              <tr>
                <th className="text-center">N°</th>
                <th className="text-center">Nom et prénoms</th>
                <th className="text-center">Fonction</th>
                <th className="text-center">Service</th>
              </tr>
            </thead>
            <tbody>
              {mission.agents.map((agent, index) => (
                <tr key={index}>
                  <td className="text-center">{agent.numero}</td>
                  <td>{agent.nom_prenoms}</td>
                  <td>{agent.fonction}</td>
                  <td>{agent.service}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </fieldset>

        <div className="d-flex justify-content-end gap-3 button-container">
          {mission.statut === "brouillon" && (
            <>
              <Button
                variant="warning"
                onClick={() => navigate(`/Edit-ordre-mission/${id}`)}
              >
                <FaEdit className="me-2" />
                Modifier
              </Button>
              {userRole && ["IMPRESSION", "RESPONSABLE"].includes(userRole) && (
                <Button variant="primary" onClick={handleConvertir}>
                  <FaExchangeAlt size={20} /> Convertir
                </Button>
              )}
            </>
          )}
          <Button
            className="btn btn-info btn-custom"
            onClick={() => navigate("/Dashboard")}
          >
            <FaHome size={24} /> Retour
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LireOrdreMission;
