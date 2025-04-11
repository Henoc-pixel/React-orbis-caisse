import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Table, Container } from "react-bootstrap";
import { FaHome, FaPrint, FaEdit } from "react-icons/fa";
import { Billetage } from "@/Components/types";

const ReadBilletage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [billetage, setBilletage] = useState<Billetage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilletage = async () => {
      try {
        const response = await fetch(`http://localhost:3000/billetage/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du billetage.");
        }
        const data: Billetage = await response.json();
        setBilletage(data);
      } catch (err) {
        setError("Impossible de charger les détails du billetage.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBilletage();
  }, [id]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && billetage) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Billetage ${billetage.reference}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2, h3, p { text-align: center; margin: 5px 0; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid black; padding: 5px; text-align: center; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 10px; }
               .header img { 
              width: 200px;
            }
              .footer { margin-top: 10px; text-align: center; }
              .approval { display: flex; justify-content: space-between; margin: 10px 0; }
              .approval div { text-align: center; }
              .print-button { display: none; }
              @media print { 
                .print-button { display: none; } 
              }
                .title {
              font-size: 20px;
              font-weight: bold; 
              margin: 10px 0;
              border: 1px solid black; 
              padding: 15px 5px;
              display: inline-block; 
              width: 100%; 
              text-align: center; 
            }
              fieldset {
              border: 1px solid #ddd;
              padding: 5px;
              margin: 5px 0;
              width: 100%;
            }
              legend {
              font-size: 15px;
              font-weight: bold;
              text-align: left;
              padding: 0 5px;
            }
            </style>
          </head>
          <body>
            <div class="header">
             <img src="/src/assets/images/offset.png" alt="Offset Consulting" />
              <p>Cabinet Offset Consulting</p>
              <p>Audit et Conseil en Organisation Management</p>
              <p>08 BP 2841 Abulgano 08, République de Côte d'Ivoire</p>
              <p>Tél: (225) 27 22 61 53 71 60. (225) 07 78 63 63 06</p>
              <p>Email: info@offset-consulting.com</p>
              <p>www.offset-consulting.com</p>
            </div>
            
            <div class="title">BILLETAGE</div>
            <fieldset>
            <legend>Information du billetage</legend>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Caisse</th>
                  <th>Solde théorique</th>
                  <th>Solde réel</th>
                  <th>Ecart</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${new Date(billetage.date).toLocaleDateString(
                    "fr-FR"
                  )}</td>
                  <td>${billetage.reference}</td>
                  <td>${billetage.caisse_intitilé}</td>
                  <td>${billetage.solde_theorique.toLocaleString()}</td>
                  <td>${billetage.solde_reel.toLocaleString()}</td>
                  <td>${billetage.ecart.toLocaleString()}</td>
                  <td>${billetage.statut}</td>
                </tr>
              </tbody>
            </table>
            </fieldset>
            
            <fieldset>
            <legend>Détail du billetage</legend>
            <table>
              <thead>
                <tr>
                  <th colspan="3">Billets</th>
                </tr>
                <tr>
                  <th>Nominal</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="width:70%;">10 000</td>
                  <td style="text-align: end;">${billetage.b10000}</td>
                  <td style="text-align: end;">${(
                    billetage.b10000 * 10000
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>5 000</td>
                  <td style="text-align: end;">${billetage.b5000}</td>
                  <td style="text-align: end;">${(
                    billetage.b5000 * 5000
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>2 000</td>
                  <td style="text-align: end;">${billetage.b2000}</td>
                  <td style="text-align: end;">${(
                    billetage.b2000 * 2000
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>1 000</td>
                  <td style="text-align: end;">${billetage.b1000}</td>
                  <td style="text-align: end;">${(
                    billetage.b1000 * 1000
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td style="text-align: end;">${billetage.b500}</td>
                  <td style="text-align: end;">${(
                    billetage.b500 * 500
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2"><strong>Sous Total</strong></td>
                  
                  <td style="text-align: end;"><strong>${(
                    billetage.b10000 * 10000 +
                    billetage.b5000 * 5000 +
                    billetage.b2000 * 2000 +
                    billetage.b1000 * 1000 +
                    billetage.b500 * 500
                  ).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <table>
              <thead>
                <tr>
                  <th colspan="3">Monnaie</th>
                </tr>
                <tr>
                  <th>Nominal</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="width:70%;">500</td>
                  <td style="text-align: end;">${billetage.p500}</td>
                  <td style="text-align: end;">${(
                    billetage.p500 * 500
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>200</td>
                  <td style="text-align: end;">${billetage.p200}</td>
                  <td style="text-align: end;">${(
                    billetage.p200 * 200
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>100</td>
                  <td style="text-align: end;">${billetage.p100}</td>
                  <td style="text-align: end;">${(
                    billetage.p100 * 100
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>50</td>
                  <td style="text-align: end;">${billetage.p50}</td>
                  <td style="text-align: end;">${(
                    billetage.p50 * 50
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>25</td>
                  <td style="text-align: end;">${billetage.p25}</td>
                  <td style="text-align: end;">${(
                    billetage.p25 * 25
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>10</td>
                  <td style="text-align: end;">${billetage.p10}</td>
                  <td style="text-align: end;">${(
                    billetage.p10 * 10
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td style="text-align: end;">${billetage.p5}</td>
                  <td style="text-align: end;">${(
                    billetage.p5 * 5
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2"><strong>Sous Total</strong></td>
                  
                  <td style="text-align: end;"><strong>${(
                    billetage.p500 * 500 +
                    billetage.p200 * 200 +
                    billetage.p100 * 100 +
                    billetage.p50 * 50 +
                    billetage.p25 * 25 +
                    billetage.p10 * 10 +
                    billetage.p5 * 5
                  ).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
            </fieldset>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading)
    return <p className="text-center">⏳ Chargement des détails...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!billetage) return <p className="text-center">Aucun billetage trouvé.</p>;

  return (
    <Container className="vh-100 mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4">
            Billetage {billetage.reference}
          </Card.Title>

          <h5>Information du billetage</h5>
          <Table className="custom-billetage" striped bordered hover>
            <tbody>
              <tr>
                <td style={{ width: "20%" }}>Date</td>
                <td>{new Date(billetage.date).toLocaleDateString("fr-FR")}</td>
              </tr>
              <tr>
                <td>Référence</td>
                <td>{billetage.reference}</td>
              </tr>
              <tr>
                <td>Caisse</td>
                <td>{billetage.caisse_intitilé}</td>
              </tr>
              <tr>
                <td>Caissier</td>
                <td>{billetage.caissier_username}</td>
              </tr>
              <tr>
                <td>Solde théorique</td>
                <td>{billetage.solde_theorique.toLocaleString()} FCFA</td>
              </tr>
              <tr>
                <td>Solde réel</td>
                <td>{billetage.solde_reel.toLocaleString()} FCFA</td>
              </tr>
              <tr>
                <td>Ecart</td>
                <td
                  className={
                    billetage.ecart === 0 ? "text-success" : "text-danger"
                  }
                >
                  {billetage.ecart.toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td>Statut</td>
                <td>
                  <span
                    className={`badge ${
                      billetage.statut === "validée"
                        ? "badge-success"
                        : billetage.statut === "en attente"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {billetage.statut}
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>

          <h5 className="mt-4">Détail des billets</h5>
          <Table className="custom-billetage" striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Nominal</th>
                <th className="text-center">Quantité</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: "60%" }} className="text-center">
                  10 000 FCFA
                </td>
                <td className="text-end">{billetage.b10000}</td>
                <td className="text-end">
                  {(billetage.b10000 * 10000).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">5 000 FCFA</td>
                <td className="text-end">{billetage.b5000}</td>
                <td className="text-end">
                  {(billetage.b5000 * 5000).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">2 000 FCFA</td>
                <td className="text-end">{billetage.b2000}</td>
                <td className="text-end">
                  {(billetage.b2000 * 2000).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">1 000 FCFA</td>
                <td className="text-end">{billetage.b1000}</td>
                <td className="text-end">
                  {(billetage.b1000 * 1000).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">500 FCFA</td>
                <td className="text-end">{billetage.b500}</td>
                <td className="text-end">
                  {(billetage.b500 * 500).toLocaleString()} FCFA
                </td>
              </tr>
              <tr className="font-weight-bold">
                <td colSpan={2} className="text-center">
                  Sous Total
                </td>

                <td className="text-end">
                  {(
                    billetage.b10000 * 10000 +
                    billetage.b5000 * 5000 +
                    billetage.b2000 * 2000 +
                    billetage.b1000 * 1000 +
                    billetage.b500 * 500
                  ).toLocaleString()}{" "}
                  FCFA
                </td>
              </tr>
            </tbody>
          </Table>

          <h5 className="mt-4">Détail de la monnaie</h5>
          <Table className="custom-billetage" striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Nominal</th>
                <th className="text-center">Quantité</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: "60%" }} className="text-center">
                  500 FCFA
                </td>
                <td className="text-end">{billetage.p500}</td>
                <td className="text-end">
                  {(billetage.p500 * 500).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">200 FCFA</td>
                <td className="text-end">{billetage.p200}</td>
                <td className="text-end">
                  {(billetage.p200 * 200).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">100 FCFA</td>
                <td className="text-end">{billetage.p100}</td>
                <td className="text-end">
                  {(billetage.p100 * 100).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">50 FCFA</td>
                <td className="text-end">{billetage.p50}</td>
                <td className="text-end">
                  {(billetage.p50 * 50).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">25 FCFA</td>
                <td className="text-end">{billetage.p25}</td>
                <td className="text-end">
                  {(billetage.p25 * 25).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">10 FCFA</td>
                <td className="text-end">{billetage.p10}</td>
                <td className="text-end">
                  {(billetage.p10 * 10).toLocaleString()} FCFA
                </td>
              </tr>
              <tr>
                <td className="text-center">5 FCFA</td>
                <td className="text-end">{billetage.p5}</td>
                <td className="text-end">
                  {(billetage.p5 * 5).toLocaleString()} FCFA
                </td>
              </tr>
              <tr className="font-weight-bold">
                <td colSpan={2} className="text-center">
                  Sous Total
                </td>

                <td className="text-end">
                  {(
                    billetage.p500 * 500 +
                    billetage.p200 * 200 +
                    billetage.p100 * 100 +
                    billetage.p50 * 50 +
                    billetage.p25 * 25 +
                    billetage.p10 * 10 +
                    billetage.p5 * 5
                  ).toLocaleString()}{" "}
                  FCFA
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex justify-content-end gap-3 button-container">
            <Button variant="primary" onClick={handlePrint}>
              <FaPrint /> Imprimer
            </Button>
            <Button
              className="btn btn-warning"
              onClick={() => navigate(`/Edit-billetage/${billetage.id}`)}
            >
              <FaEdit size={20} /> Modifier
            </Button>

            <Button
              className="btn btn-info btn-custom"
              onClick={() => navigate("/Dashbord")}
            >
              <FaHome size={24} /> Retour
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReadBilletage;
