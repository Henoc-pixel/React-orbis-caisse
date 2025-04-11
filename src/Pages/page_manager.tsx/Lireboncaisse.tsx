import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Table, Container } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Bon_Caisse } from "@/Components/types";

const Boncaisse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bon_caisse, setBon_Caisse] = useState<Bon_Caisse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du bon d'approvisionnement
  useEffect(() => {
    const fetchBesoin = async () => {
      try {
        const response = await fetch(`http://localhost:3000/bon_caisse/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du besoin.");
        }
        const data: Bon_Caisse = await response.json();
        setBon_Caisse(data);
      } catch (err) {
        setError("Impossible de charger les détails du besoin.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBesoin();
  }, [id]);

  if (loading)
    return <p className="text-center">⏳ Chargement des détails...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!bon_caisse) return <p className="text-center">Aucun bon trouvé.</p>;

  return (
    <Container fluid className="vh-100 mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Bon de caisse {bon_caisse.reference_bon_caisse}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>Détail de le fiche</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">
                    N° Fiche de besoin
                  </th>
                  <th className="text-center align-middle">Type d'opération</th>
                  <th className="text-center align-middle">
                    Nature d'opération
                  </th>
                  <th className="text-center align-middle">Montant (F.CFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center align-middle">
                    {new Date(bon_caisse.date_besoin).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td className="align-middle">
                    {bon_caisse.reference_besoin}
                  </td>
                  <td className="align-middle">
                    {bon_caisse.type_operation_besoin}
                  </td>
                  <td className="align-middle">
                    {bon_caisse.nature_operation_besoin}
                  </td>
                  <td className="align-middle text-end">
                    {Number(bon_caisse.montant_besoin).toLocaleString()}{" "}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <fieldset>
            <h6 style={{ color: "#232754" }}>Information du bon de caisse</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Référence</th>
                  <th className="text-center align-middle">Bénéficiaire</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle text-center">
                    {new Date(bon_caisse.date_bon_caisse).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td className="align-middle">
                    {bon_caisse.reference_bon_caisse}
                  </td>
                  <td className=" align-middle ">{bon_caisse.beneficiaire}</td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-end gap-3 button-container">
        <Button
          className="btn btn-info btn-custom"
          onClick={() => navigate("/Dashboard")}
        >
          <FaHome size={24} /> Retour
        </Button>
      </div>
    </Container>
  );
};

export default Boncaisse;
