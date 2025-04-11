import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Container } from "react-bootstrap";
import { FaHome, FaPrint } from "react-icons/fa";
import { Besoin, Bon_Caisse } from "@/Components/types";
import "@/assets/css/LireBesoin.css";

const BesoinConvertit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [besoin, setBesoin] = useState<Besoin | null>(null);
  const [bonCaisse, setBonCaisse] = useState<Bon_Caisse | null>(null);
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

  // Charger les détails du besoin et du bon de caisse associé
  useEffect(() => {
    const fetchData = async () => {
      try {
        const besoinResponse = await fetch(
          `http://localhost:3000/besoin/${id}`
        );
        if (!besoinResponse.ok) {
          throw new Error("Erreur lors de la récupération du besoin.");
        }
        const besoinData: Besoin = await besoinResponse.json();
        setBesoin(besoinData);

        const bonCaisseResponse = await fetch(
          `http://localhost:3000/bon_caisse?reference_besoin=${besoinData.reference}`
        );
        if (!bonCaisseResponse.ok) {
          throw new Error("Erreur lors de la récupération du bon de caisse.");
        }
        const bonCaisseData: Bon_Caisse[] = await bonCaisseResponse.json();
        if (bonCaisseData.length > 0) {
          setBonCaisse(bonCaisseData[0]);
        }
      } catch (err) {
        setError(
          "Impossible de charger les détails du besoin ou du bon de caisse."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Ajoutez cette fonction dans le composant Lire_besoin_convertit
  const handlePrint = () => {
    if (!besoin || !bonCaisse) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Bon de Caisse</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 10px; 
              font-size: 12px; /* Réduire la taille de la police */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            h2, h3, p { 
              text-align: center; 
              margin: 5px 0; /* Réduire les marges */
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px; /* Réduire la marge */
              font-size: 12px; /* Réduire la taille de la police */
              color:#363642;
              border: 1 px solid #808080 !important
            }
              .table-bordered, .table-bordered td, .table-bordered th {
               border: 1px solid #ecedf1;
               }
            th, td { 
              border: 1px  solid #808080 !important; 
              padding: 5px; /* Réduire le padding */
               
            }
            th { 
              background-color: #f2f2f2; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 10px; /* Réduire la marge */
            }
            .footer { 
              margin-top: 10px; /* Réduire la marge */
              text-align: center; 
            }
            .approval {
              display: flex;
              justify-content: space-between;
              margin: 10px 0; /* Réduire la marge */
              font-size: 12px; /* Réduire la taille de la police */
                             
                 
            }
            .approval div { 
              text-align: center; 
               
            }
            .button-container { 
              text-align: center; 
               margin: 20px 10px; /* Réduire la marge */
            }
            button { 
              background-color: navy; 
              color: white; 
              padding: 5px 10px; /* Réduire le padding */
              border: none; 
              cursor: pointer; 
              font-size: 12px; /* Réduire la taille de la police */
              border-radius: 5px;
            }
            .title {
              font-size: 20px; /* Réduire la taille de la police */
              font-weight: bold; 
              margin: 10px 0; /* Réduire la marge */
              border: 1px solid black; 
              padding: 15px 5px; /* Réduire le padding */
              display: inline-block; 
              width: 80%; 
              text-align: center; 
            }
            fieldset {
              border: 1px solid #ddd; /* Bordure grise */
              padding: 5px;
              margin: 5px 0;
              width: 80%; /* Réduire la largeur du fieldset */
            }
            legend {
              font-size: 15px; /* Réduire encore la taille de la police */
              font-weight: bold;
              text-align: left;
              padding: 0 5px;
            }
            .header img { 
              width: 200px; /* Réduire la taille de l'image */
            }
            .header p { 
              margin: 3px 0; /* Réduire les marges */
              font-weight: bold;
            }
            .print-button { 
              background-color: #041b48; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              cursor: pointer;
              border-radius: 5px;
            }
              .print-button:hover { 
              background-color:#0d84de; 
              
            }
            @media print { 
              .print-button { 
                display: none; 
              } 
            } /* Cacher le bouton à l'impression */
             .small-label {
              width: 150px;
              font-weight: bold;
              }
              .custom-table td,
              .custom-table th {
               padding: 4px;
               font-size: 12px;
               border: none;
              }         
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/src/assets/images/offset.png" alt="Offset Consulting" />
            <p>Cabinet Offset Consulting</p>
            <p>Audit et Conseil en Organisation Management</p>
            <p>08 BP 2941 Abidjan 08, République de Côte d'Ivoire</p>
            <p>Tél: (225) 27 22 01 59 71 / (225) 07 78 63 63 06</p>
            <p>Email: info@offset-consulting.com</p>
            <p>www.offset-consulting.com</p>
          </div>
          <div class="title">BON DE CAISSE</div>
           <fieldset>
            <legend>Information Décaissement ${
              bonCaisse.reference_bon_caisse
            }</legend>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold; border: none;">Date : </strong>${new Date(
                bonCaisse.date_bon_caisse
              ).toLocaleDateString("fr-FR")}
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold; border: none;">Bénéficiaire : </strong>${
                bonCaisse.beneficiaire
              }
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Libellé : </strong>${
                bonCaisse.nature_operation_besoin
              }
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Montant en lettres : </strong>${convertToWords(
                Number(bonCaisse.montant_besoin)
              )}
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Statut : </strong>${
                bonCaisse.statut
              }
            </div>
          </fieldset>
          <fieldset>
            <legend>Détail Opération</legend>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Objet de dépense</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire (F.CFA)</th>
                  <th>Montant (F.CFA)</th>
                </tr>
              </thead>
              <tbody>
                ${besoin.details
                  .map(
                    (detail) => `
                  <tr>
                    <td style=" text-align: center;">${detail.objet}</td>
                    <td style=" text-align: center;">${detail.quantite}</td>
                    <td style=" text-align: center;">${detail.prixUnitaire.toLocaleString()}</td>
                    <td style=" text-align: center;">${detail.montant.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr>
                  <td colspan="3"><strong>Total</strong></td>
                  <td style=" text-align: center;">
                    <strong>${besoin.details
                      .reduce((acc, detail) => acc + detail.montant, 0)
                      .toLocaleString()}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          
          <div class="approval" style="width: 70%;margin: 20 auto; text-align: center;">
            <div>Approbation :<p></p><br />_______________</div>
            <div>Caisse :<p></p><br />_______________</div>
            <div>Bénéficiaire :<p></p><br />_______________</div>
          </div>
          <p></p></fieldset>
          <div class="button-container">
            <button class="print-button" onclick="window.print()">Imprimer</button>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close(); // Ferme la fenêtre après impression
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
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
            <Button variant="primary" onClick={handlePrint}>
              <FaPrint size={20} /> Imprimer
            </Button>
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
const convertToWords = (num: number): string => {
  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const teens = [
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const tens = [
    "",
    "dix",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  if (num === 0) return "zéro";
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100)
    return (
      tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" + units[num % 10] : "")
    );
  if (num < 1000)
    return (
      units[Math.floor(num / 100)] +
      " cent" +
      (num % 100 !== 0 ? " " + convertToWords(num % 100) : "")
    );
  if (num < 1000000)
    return (
      convertToWords(Math.floor(num / 1000)) +
      " mille" +
      (num % 1000 !== 0 ? " " + convertToWords(num % 1000) : "")
    );
  return "Nombre trop grand";
};

export default BesoinConvertit;
