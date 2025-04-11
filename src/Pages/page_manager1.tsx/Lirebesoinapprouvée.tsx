import React, { useEffect, useState } from "react";
import { Card, Table, Button, Container } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Besoin } from "@/Components/types";

const ListBesoinApprouver: React.FC = () => {
  const [besoinsApprouves, setBesoinsApprouves] = useState<Besoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBesoinsApprouves = async () => {
      try {
        const response = await fetch("http://localhost:3000/besoins_approuvés");
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des besoins approuvés."
          );
        }
        const data: Besoin[] = await response.json();
        setBesoinsApprouves(data);
      } catch (err) {
        setError("Impossible de charger les besoins approuvés.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBesoinsApprouves();
  }, []);

  if (loading)
    return (
      <p className="text-center">⏳ Chargement des besoins approuvés...</p>
    );
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <Container fluid className="vh-100 mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Liste des Besoins Approuvés
          </Card.Title>
          <hr />
          <Table
            striped
            bordered
            hover
            responsive
            className="shadow-sm custom-table"
          >
            <thead>
              <tr className="text-center align-middle">
                <th className="align-middle">Date</th>
                <th className="align-middle">Référence</th>
                <th className="align-middle">Émetteur</th>
                <th className="align-middle">Destinataire</th>
                <th className="align-middle">Bénéficiaire</th>
                <th className="align-middle">Nature de l'opération</th>
                <th className="align-middle">Type d'opération</th>
                <th className="align-middle">Montant Total (F.CFA)</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {besoinsApprouves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    Aucun besoin approuvé trouvé.
                  </td>
                </tr>
              ) : (
                besoinsApprouves.map((besoin) => (
                  <tr key={besoin.id}>
                    <td className="text-center align-middle">
                      {new Date(besoin.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="align-middle">{besoin.reference}</td>
                    <td className="align-middle">{besoin.emetteur}</td>
                    <td className="align-middle">{besoin.destinataire}</td>
                    <td className="align-middle">{besoin.beneficiaire}</td>
                    <td className="align-middle">{besoin.nature_operation}</td>
                    <td className="align-middle">{besoin.type_operation}</td>
                    <td className="text-end align-middle">
                      {besoin.details
                        .reduce((acc, detail) => acc + detail.montant, 0)
                        .toLocaleString()}
                    </td>
                    <td className="align-middle text-center">
                      {besoin.statut}
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(`/Approuvée-besoin/${besoin.id}`)
                        }
                      >
                        <FaEye size={20} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListBesoinApprouver;
