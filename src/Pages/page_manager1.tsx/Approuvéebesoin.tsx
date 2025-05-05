import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Container, Modal } from "react-bootstrap";
import { FaHome, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { Besoin, User } from "@/Components/types";
import { ToastContainer, toast } from "react-toastify";
import "@/assets/css/LireBesoin.css";

const Approuvéebesoin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [besoin, setBesoin] = useState<Besoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApprouvéeModal, setShowApprouvéeModal] = useState(false);
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
      const manager = users.find((u) => u.role === roleTarget);

      if (!manager) {
        console.error(`Aucun utilisateur avec le rôle ${roleTarget} trouvé`);
        return;
      }

      const response = await fetch("http://localhost:3000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: manager.id,
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

  const handleApprouvée = async () => {
    if (!besoin || !userRole) return;
    try {
      // Mettre à jour le statut du besoin dans l'API "besoin"
      const response = await fetch(`http://localhost:3000/besoin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "approuvée" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      // Ajouter le besoin approuvé à l'API "besoins_approuvés"
      const responseApprouve = await fetch(
        `http://localhost:3000/besoins_approuvés`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...besoin, statut: "approuvée" }),
        }
      );

      if (!responseApprouve.ok) {
        throw new Error("Erreur lors de l'ajout du besoin approuvé");
      }

      setBesoin((prev) => (prev ? { ...prev, statut: "approuvée" } : prev));
      setShowApprouvéeModal(false);

      // Envoyer une notification au MANAGER
      await createNotification(
        "MANAGER",
        "Nouvelle fiche de besoin approuvée prête pour décaissement",
        "/List-Approuvée",
        besoin.reference
      );

      toast.success("Besoin approuvé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'approbation du besoin.");
      console.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  const handleAnnuler = async () => {
    if (!besoin) return;
    try {
      await fetch(`http://localhost:3000/besoin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "annulée" }),
      });
      setBesoin((prev) => (prev ? { ...prev, statut: "annulée" } : prev));
      setShowAnnulerModal(false);
      toast.success("Besoin annulé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'annulation du besoin.");
      console.error("Erreur lors de la mise à jour du statut", error);
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
            Détails du Besoin {besoin.reference}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>
              Information de la fiche de besoin{" "}
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
            {besoin.statut === "validée" && (
              <>
                <Button
                  className="btn btn-warning"
                  onClick={() => navigate(`/Edit-besoin-validé/${besoin.id}`)}
                >
                  <FaEdit size={20} /> Modifier
                </Button>
                <Button
                  className="btn btn-success"
                  onClick={() => setShowApprouvéeModal(true)}
                >
                  <FaCheck size={24} /> Approuvée
                </Button>
                <Button
                  className="btn btn-danger"
                  onClick={() => setShowAnnulerModal(true)}
                >
                  <FaTimes size={20} /> Annuler
                </Button>
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

      {/* Modal pour confirmer la validation */}
      <Modal
        show={showApprouvéeModal}
        onHide={() => setShowApprouvéeModal(false)}
      >
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>
            <h5>Approbation fiche de besoin {besoin.reference}</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir approuver ce besoin ?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowApprouvéeModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleApprouvée}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour confirmer l'annulation */}
      <Modal show={showAnnulerModal} onHide={() => setShowAnnulerModal(false)}>
        <Modal.Header style={{ background: "#f7c46c" }} closeButton>
          <Modal.Title>
            <h5>Annulation fiche de besoin {besoin.reference}</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir annuler ce besoin ?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowAnnulerModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleAnnuler}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Approuvéebesoin;
