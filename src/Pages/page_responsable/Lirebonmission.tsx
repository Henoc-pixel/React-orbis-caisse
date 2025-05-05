import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Container, Modal } from "react-bootstrap";
import { FaHome, FaEdit, FaPaperPlane, FaCheck } from "react-icons/fa";
import { bon_Mission, User } from "@/Components/types";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LireBonMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bonMission, setBonMission] = useState<bon_Mission | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
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
    fetchUserRole();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bonResponse, usersResponse] = await Promise.all([
          fetch(`http://localhost:3000/bon_mission/${id}`),
          fetch("http://localhost:3000/users"),
        ]);

        const bonData = await bonResponse.json();
        const usersData = await usersResponse.json();

        setBonMission(bonData);
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement du bon de mission");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fonction pour créer une notification
  const createNotification = async (
    roleTarget: string,
    message: string,
    link: string,
    reference?: string
  ) => {
    try {
      // Trouver l'ID du manager
      const usersResponse = await fetch("http://localhost:3000/users");
      const users: User[] = await usersResponse.json();
      const targetUser = users.find((u) => u.role === roleTarget);

      if (!targetUser) {
        console.error(`Aucun utilisateur avec le rôle ${roleTarget} trouvé`);
        return;
      }

      const response = await fetch("http://localhost:3000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          roleTarget,
          message,
          link,
          date: new Date().toISOString(),
          read: false,
          reference,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la notification");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
    }
  };

  const getFullName = (username: string): string => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const handleEnvoyer = async () => {
    setShowSendModal(false);
    if (!bonMission || !userRole) return;

    const newStatut = "en attente";

    try {
      await fetch(`http://localhost:3000/bon_mission/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });

      setBonMission((prev) => (prev ? { ...prev, statut: newStatut } : prev));

      // Envoyer une notification au MANAGER1
      await createNotification(
        "MANAGER1",
        "Bon de mission envoyé en attente d'approbation",
        "/Home-bon-mission",
        bonMission.numero_bon
      );

      toast.success("Bon de mission envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du bon de mission");
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  const handleApprouver = async () => {
    setShowApproveModal(false);
    if (!bonMission || !userRole) return;

    const newStatut = "approuvée";

    try {
      await fetch(`http://localhost:3000/bon_mission/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });

      setBonMission((prev) => (prev ? { ...prev, statut: newStatut } : prev));

      // Envoyer une notification au MANAGER
      await createNotification(
        "MANAGER",
        "Bon de mission approuvé en attente de décaissement",
        "/List-bonmission-attente",
        bonMission.numero_bon
      );

      toast.success("Bon de mission approuvé");
    } catch (error) {
      toast.error("Erreur lors de l'approbation du bon de mission");
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (!bonMission)
    return <div className="text-center">Bon de mission non trouvé</div>;

  return (
    <Container fluid className="vh-100 mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Bon de mission {bonMission.numero_bon}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>Detail de l'ordre de mission</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Numéro d'odre</th>
                  <th className="text-center align-middle">Donne ordre à</th>
                  <th className="text-center align-middle">De se rendre à</th>
                  <th className="text-center align-middle">
                    Objet de la mission
                  </th>
                  <th className="text-center align-middle">Date départ</th>
                  <th className="text-center align-middle">Date retour</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {formatDate(bonMission.date_ordre)}
                  </td>
                  <td className="align-middle">{bonMission.numero_ordre}</td>
                  <td className="align-middle">
                    {getFullName(bonMission.username_ordre)}
                  </td>
                  <td className="align-middle">
                    {bonMission.destinatoin_ordre}
                  </td>
                  <td className="align-middle">
                    {bonMission.objet_ordre_mission}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(bonMission.date_depart_ordre)}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(bonMission.date_retour_ordre)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <fieldset>
            <h6 style={{ color: "#232754" }}>Information Bon de mission</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Référence</th>
                  <th className="text-center align-middle">Bénéficiare</th>
                  <th className="text-center align-middle">Ville</th>
                  <th className="text-center align-middle">Montant (F.CFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {formatDate(bonMission.date_bon)}
                  </td>
                  <td className="align-middle">{bonMission.numero_bon}</td>
                  <td className=" align-middle">
                    {getFullName(bonMission.beneficiaire_bon)}
                  </td>
                  <td className="align-middle">{bonMission.Ville}</td>
                  <td className="align-middle text-end">
                    {bonMission.Total_frais_mission.toLocaleString("fr-FR")}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-end gap-3 button-container">
        {bonMission.statut === "brouillon" && (
          <>
            {userRole && ["IMPRESSION", "RESPONSABLE"].includes(userRole) && (
              <Button
                variant="warning"
                onClick={() => navigate(`/Edit-bon-mission/${id}`)}
              >
                <FaEdit className="me-2" />
                Modifier
              </Button>
            )}
            {userRole && ["IMPRESSION", "RESPONSABLE"].includes(userRole) && (
              <Button
                className="btn btn-success"
                onClick={() => setShowSendModal(true)}
              >
                <FaPaperPlane size={20} /> Envoyer
              </Button>
            )}
          </>
        )}
        {bonMission.statut === "en attente" && (
          <>
            {userRole && ["IMPRESSION", "RESPONSABLE"].includes(userRole) && (
              <Button
                variant="warning"
                onClick={() => navigate(`/Edit-bon-mission/${id}`)}
              >
                <FaEdit className="me-2" />
                Modifier
              </Button>
            )}
            {userRole && ["MANAGER1"].includes(userRole) && (
              <Button
                className="btn btn-success"
                onClick={() => setShowApproveModal(true)}
              >
                <FaCheck size={20} /> Approuver
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

      {/* Modal pour l'envoi */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation d'envoi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir envoyer ce bon de mission pour approbation ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowSendModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleEnvoyer}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour l'approbation */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation d'approbation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir approuver définitivement ce bon de mission ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowApproveModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleApprouver}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LireBonMission;
