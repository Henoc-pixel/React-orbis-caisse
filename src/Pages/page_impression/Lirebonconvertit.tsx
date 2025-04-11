import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button } from "react-bootstrap";
import { FaHome, FaPrint } from "react-icons/fa";
import { bon_Mission } from "@/Components/types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Lirebonconvertit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<bon_Mission | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Fonction pour convertir un nombre en lettres
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
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? "-" + units[num % 10] : "")
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

  // Fonction pour l'impression
  const handlePrint = () => {
    if (!mission) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Bon de Mission</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 10px; 
              font-size: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            h2, h3, p { 
              text-align: center; 
              margin: 5px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
              font-size: 12px;
              color:#363642;
            }
            .table-bordered, .table-bordered td, .table-bordered th {
              border: 1px solid #ecedf1;
            }
            th, td { 
              border: 1px solid #808080; 
              padding: 5px;
            }
            th { 
              background-color: #f2f2f2; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 10px;
            }
            .footer { 
              margin-top: 10px;
              text-align: center; 
            }
            .approval {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              font-size: 12px;
            }
            .approval div { 
              text-align: center; 
            }
            .button-container { 
              text-align: center; 
              margin: 20px 10px;
            }
            button { 
              background-color: navy; 
              color: white; 
              padding: 5px 10px;
              border: none; 
              cursor: pointer; 
              font-size: 12px;
              border-radius: 5px;
            }
            .title {
              font-size: 20px;
              font-weight: bold; 
              margin: 10px 0;
              border: 1px solid black; 
              padding: 15px 5px;
              display: inline-block; 
              width: 80%; 
              text-align: center; 
            }
            fieldset {
              border: 1px solid #ddd;
              padding: 5px;
              margin: 5px 0;
              width: 80%;
            }
            legend {
              font-size: 15px;
              font-weight: bold;
              text-align: left;
              padding: 0 5px;
            }
            .header img { 
              width: 200px;
            }
            .header p { 
              margin: 3px 0;
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
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/src/assets/images/offset.png" alt="Offset Consulting" />
            <p>Cabinet Offset Consulting</p>
            <p>Audit et Conseil en Organisation Management</p>
            <p>08 BP 754 L'Abligation, Méquidaires de Cité d'Inche</p>
            <p>Tél: (123) 21 22 01 59 17 + Fax: (123) 21 71 83 53 04</p>
            <p>Email: info@offset-consulting.com</p>
            <p>www.offset-consulting.com</p>
          </div>
          <div class="title">BON DE MISSION</div>
          <fieldset>
            <legend>Information Décaissement ${mission.numero_bon}</legend>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Date : </strong>${new Date(
                mission.date_bon
              ).toLocaleDateString("fr-FR")}
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Bénéficiaire : </strong>${
                mission.beneficiaire_bon
              }
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Objet de la mission : </strong>${
                mission.objet_ordre_mission
              }
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Montant en lettres : </strong>${convertToWords(
                Number(mission.Total_frais_mission)
              )} francs CFA
            </div>
            <div style="margin-bottom: 10px;color:#363642;">
              <strong style="font-weight: bold;">Statut : </strong>${
                mission.statut
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
                ${mission.frais_mission
                  .map(
                    (frais) => `
                  <tr>
                    <td style="text-align: center;">${frais.rubrique}</td>
                    <td style="text-align: center;">${frais.quantité}</td>
                    <td style="text-align: center;">${frais.prix_unitaire.toLocaleString()}</td>
                    <td style="text-align: center;">${frais.montant.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr>
                  <td colspan="3"><strong>Total</strong></td>
                  <td style="text-align: center;">
                    <strong>${mission.Total_frais_mission.toLocaleString()}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
          <div class="approval" style="width: 70%; margin: 20px auto; text-align: center;">
            <div>Approbation :<p></p><br />_______________</div>
             <div>Caisse :<p></p><br />_______________</div>
            <div>Bénéficiaire :<p></p><br />_______________</div>
          </div>
          <div class="button-container">
            <button class="print-button" onclick="window.print()">Imprimer</button>
          </div>
          
        </body>
      </html>
    `);
      printWindow.document.close();
    }
  };

  // Récupérer les données de la mission
  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await fetch(`http://localhost:3000/bon_mission/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la mission");
        }
        const data = await response.json();
        setMission(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement de la mission");
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  if (loading) return <div className="text-center">Chargement...</div>;
  if (!mission) return <div className="text-center">Mission non trouvée</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4">
            Bon de mission {mission.numero_bon}
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
                    {formatDate(mission.date_ordre)}
                  </td>
                  <td className="align-middle">{mission.numero_ordre}</td>
                  <td className="align-middle">{mission.username_ordre}</td>
                  <td className="align-middle">{mission.destinatoin_ordre}</td>
                  <td className="align-middle">
                    {mission.objet_ordre_mission}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_depart_ordre)}
                  </td>
                  <td className="align-middle text-center">
                    {formatDate(mission.date_retour_ordre)}
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
                    {formatDate(mission.date_bon)}
                  </td>
                  <td className="align-middle">{mission.numero_bon}</td>
                  <td className=" align-middle">{mission.beneficiaire_bon}</td>
                  <td className="align-middle">{mission.Ville}</td>
                  <td className="align-middle text-end">
                    {mission.Total_frais_mission.toLocaleString("fr-FR")}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <div className="d-flex justify-content-end gap-3 button-container mt-4">
            <Button variant="primary" onClick={handlePrint}>
              <FaPrint className="me-2" />
              Imprimer
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
    </>
  );
};

export default Lirebonconvertit;
