import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Container, Modal } from "react-bootstrap";
import { FaHome, FaEdit, FaPaperPlane } from "react-icons/fa";
import { Besoin } from "@/Components/types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/assets/css/LireBesoin.css";
import { User } from "@/Components/types";

const Lirebesoin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [besoin, setBesoin] = useState<Besoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  // Récupérer le rôle de l'utilisateur connecté
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Charger les détails du besoin
  useEffect(() => {
    const fetchBesoin = async () => {
      try {
        const response = await fetch(`http://localhost:3000/besoin/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du besoin.");
        }
        const data: Besoin = await response.json();
        setBesoin(data);
      } catch (err) {
        setError("Impossible de charger les détails du besoin.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBesoin();
  }, [id]);
  // Ajoutez cette fonction dans Lire.tsx
  const createNotification = async (
    roleTarget: string,
    message: string,
    link: string,
    reference?: string
  ) => {
    try {
      // Trouver l'ID du responsable
      const usersResponse = await fetch("http://localhost:3000/users");
      const users: User[] = await usersResponse.json();
      const responsable = users.find((u) => u.role === roleTarget);

      if (!responsable) return;

      await fetch("http://localhost:3000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: responsable.id,
          roleTarget,
          message,
          link,
          date: new Date().toISOString(),
          read: false,
          reference,
        }),
      });
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
    }
  };

  // Fonction pour envoyer le besoin
  // Modifiez la fonction handleEnvoyer pour inclure la création de notification
  const handleEnvoyer = async () => {
    setShowSendModal(false);
    if (!besoin || !userRole) return;

    let newStatut = "en attente";
    if (["MANAGER", "MANAGER1", "IMPRESSION"].includes(userRole)) {
      newStatut = "validée";
    }

    try {
      const response = await fetch(`http://localhost:3000/besoin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      setBesoin((prev) => (prev ? { ...prev, statut: newStatut } : prev));

      // Créer une notification si le statut est "en attente"
      if (newStatut === "en attente") {
        await createNotification(
          "RESPONSABLE",
          "Nouvelle fiche de besoin en attente de validation",
          "/List-Attente",
          besoin.reference
        );
      }

      toast.success("Le besoin a été envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
      toast.error("Une erreur est survenue lors de l'envoi du besoin");
    }
  };

  if (loading)
    return <p className="text-center">⏳ Chargement des détails...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!besoin) return <p className="text-center">Aucun besoin trouvé.</p>;

  const totalMontant = besoin.details.reduce(
    (acc, detail) => acc + detail.montant,
    0
  );

  return (
    <Container fluid className="vh-100 mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Fiche de Besoin {besoin.reference}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>
              Information de la fiche de besoin
            </h6>
            <Table bordered className="custom-table">
              <tbody>
                <tr>
                  <td className="small-label">Date</td>
                  <td>
                    {new Date(besoin.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="small-label">Émetteur</td>
                  <td>{besoin.emetteur}</td>
                </tr>
                <tr>
                  <td className="small-label">Bénéficiaire</td>
                  <td>{besoin.beneficiaire}</td>
                </tr>
                <tr>
                  <td className="small-label">Type opération</td>
                  <td>{besoin.type_operation}</td>
                </tr>
                <tr>
                  <td className="small-label">Nature opération</td>
                  <td>{besoin.nature_operation}</td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
          <fieldset>
            <h6 style={{ color: "#232754" }}>Détail opération</h6>
            <Table bordered className="custom-table">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "50%" }}>
                    Objet de dépense
                  </th>
                  <th className="text-center">Quantité</th>
                  <th className="text-center">Prix Unitaire (F.CFA)</th>
                  <th className="text-center">Montant (F.CFA)</th>
                </tr>
              </thead>
              <tbody>
                {besoin.details.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.objet}</td>
                    <td className="text-end">{detail.quantite}</td>
                    <td className="text-end">
                      {detail.prixUnitaire.toLocaleString()}
                    </td>
                    <td className="text-end">
                      {detail.montant.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="">
                    <strong>Total</strong>
                  </td>
                  <td className="text-end">
                    <strong>{totalMontant.toLocaleString()}</strong>
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <div className="d-flex justify-content-end gap-3 button-container">
            {(besoin.statut === "en attente" ||
              besoin.statut === "brouillon") && (
              <Button
                className="btn btn-warning"
                onClick={() => navigate(`/Edit-FDB/${besoin.id}`)}
              >
                <FaEdit size={20} /> Modifier
              </Button>
            )}
            {besoin.statut === "brouillon" && (
              <Button
                className="btn btn-success"
                onClick={() => setShowSendModal(true)}
              >
                <FaPaperPlane size={20} /> Envoyer
              </Button>
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

      {/* Modal de confirmation d'envoi */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>Confirmation d'envoi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir envoyer cette fiche de besoin pour validation
          ?
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
    </Container>
  );
};

export default Lirebesoin;
