import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Table, Container } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Retour_Fonds } from "@/Components/types";

const LireRetourFonds: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [retourFonds, setRetourFonds] = useState<Retour_Fonds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du retour de fonds
  useEffect(() => {
    const fetchRetourFonds = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/retour_fonds/${id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du retour de fonds.");
        }
        const data: Retour_Fonds = await response.json();
        setRetourFonds(data);
      } catch (err) {
        setError("Impossible de charger les détails du retour de fonds.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRetourFonds();
  }, [id]);

  if (loading)
    return <p className="text-center">⏳ Chargement des détails...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!retourFonds)
    return <p className="text-center">Aucun retour de fonds trouvé.</p>;

  // Fonction pour formater le type de dépense
  const formatTypeDepense = (type: string) => {
    switch (type) {
      case "bon_mission":
        return "Bon de mission";
      case "bon_caisse":
        return "Bon de caisse";
      default:
        return type;
    }
  };

  return (
    <Container fluid className="vh-100 mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Retour de fonds {retourFonds.reference_retour}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>Informations générales</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Référence</th>
                  <th className="text-center align-middle">Utilisateur</th>
                  <th className="text-center align-middle">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center align-middle">
                    {new Date(retourFonds.date_retour).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td className="align-middle">
                    {retourFonds.reference_retour}
                  </td>
                  <td className="align-middle">
                    {retourFonds.username_retour}
                  </td>
                  <td className="align-middle text-center">
                    {retourFonds.statut}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <fieldset>
            <h6 style={{ color: "#232754" }}>Détails du retour</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Type de dépense</th>
                  <th className="text-center align-middle">
                    Référence dépense
                  </th>
                  <th className="text-center align-middle">
                    Montant sorti (F.CFA)
                  </th>
                  <th className="text-center align-middle">
                    Montant retourné (F.CFA)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {formatTypeDepense(retourFonds.type_depense)}
                  </td>
                  <td className="align-middle">
                    {retourFonds.reference_depense}
                  </td>
                  <td className="align-middle text-end">
                    {Number(retourFonds.montant_sortie).toLocaleString()}
                  </td>
                  <td className="align-middle text-end">
                    {Number(retourFonds.montant_retourné).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-end gap-3 button-container mt-3">
        <Button
          className="btn btn-info btn-custom"
          onClick={() => navigate("/List-retour-fonds")}
        >
          <FaHome className="me-2" /> Retour
        </Button>
      </div>
    </Container>
  );
};

export default LireRetourFonds;
