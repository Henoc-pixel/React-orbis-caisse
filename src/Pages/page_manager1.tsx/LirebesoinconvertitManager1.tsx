import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Container } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { Besoin } from "@/Components/types";
import "@/assets/css/LireBesoin.css";

const BesoinConvertitManager1: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [besoin, setBesoin] = useState<Besoin | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <Button
              className="btn btn-info btn-custom"
              onClick={() => navigate("/Dashboard")}
            >
              <FaHome size={24} /> Retour
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BesoinConvertitManager1;
