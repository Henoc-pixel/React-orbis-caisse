import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Table, Container } from "react-bootstrap";
import { FaHome, FaEdit, FaExchangeAlt, FaPrint } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { Bon_Approvisionnement, User, Caisse } from "@/Components/types";

const Reçucaisse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bon_approvisionnement, setBon_Approvisionnement] =
    useState<Bon_Approvisionnement | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du bon d'approvisionnement
  useEffect(() => {
    const fetchBesoin = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/bon_approvisionnement/${id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du besoin.");
        }
        const data: Bon_Approvisionnement = await response.json();
        setBon_Approvisionnement(data);
      } catch (err) {
        setError("Impossible de charger les détails du besoin.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBesoin();
  }, [id]);

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des utilisateurs.");
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs.", error);
      }
    };

    fetchUsers();
  }, []);

  // Charger les caisses
  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await fetch("http://localhost:3000/caisse");
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des caisses.");
        const data: Caisse[] = await response.json();
        setCaisses(data);
      } catch (error) {
        console.error("Erreur lors du chargement des caisses.", error);
      }
    };

    fetchCaisses();
  }, []);

  // Fonction pour obtenir le nom et prénom du bénéficiaire
  const getCaissierName = (username: string) => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username;
  };

  // Fonction pour obtenir l'intitulé de la caisse
  const getCaisseIntitule = (username: string) => {
    const caisse = caisses.find((c) => c.username_caissier === username);
    return caisse ? caisse.intitulé : "Caisse non trouvée";
  };

  // Fonction pour vérifier si la caisse est introuvable
  const isCaisseNotFound = (username: string) => {
    const caisse = caisses.find((c) => c.username_caissier === username);
    return !caisse;
  };

  // Fonction pour gérer l'impression du reçu
  const handlePrint = () => {
    if (!bon_approvisionnement) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Reçu de Caisse</title>
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
              th, td { 
                border: 1px solid black; 
                padding: 5px; /* Réduire le padding */
                text-align: left; 
                 border: 1px  solid #808080 !important;
              }
              th { 
                
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
                 margin-top: 50px; /* la marge */
                  color:#363642;
                  margin-bottom: 50px; /* Réduit l'espace entre les sections */
              }
              .approval div { 
                text-align: center; 
                 color:#363642;
                
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
                radius :5px
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
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/src/assets/images/offset.png" alt="Offset Consulting" />
              <p>Audit et Conseil en Organisation Management</p>
              <p>08 BP 2941 Abidjan 08, République de Côte d'Ivoire</p>
              <p>Tél: (225) 27 22 01 59 71 / (225) 07 78 63 63 06</p>
              <p>Email: info@offset-consulting.com</p>
              <p>www.offset-consulting.com</p>
            </div>
            <div class="title">REÇU DE CAISSE</div>
            <fieldset>
                      <legend>Information du bon d’approvisionnement</legend>
            <table>
              <thead>
                <tr>
                  <th style="width: 70%; text-align: center;">Date</th>
                  <th style=" text-align: center;">Caisse</th>
                  <th style=" text-align: center;">Objet</th>
                  <th style=" text-align: center;">Référence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style=" text-align: center;">${new Date(
                    bon_approvisionnement.date
                  ).toLocaleDateString("fr-FR")}</td>
                  <td style=" text-align: center;">Caisse principale</td>
                  <td style=" text-align: center;">${
                    bon_approvisionnement.objet
                  }</td>
                  <td style=" text-align: center;">${
                    bon_approvisionnement.reference
                  }</td>
                </tr>
              </tbody>
            </table>
            </fieldset>
           <fieldset>
                      <legend>Détail reçu de caisse</legend>
            <table>
              <thead>
                <tr>
                  <th style="width: 60%; text-align:center;">Bénéficiaire</th>
                  <th style=" text-align: center;">Origine des fonds</th>
                  <th style=" text-align: center;">Référence Document</th>
                  <th style=" text-align: center;">Montant Total (F CFA)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style=" text-align: center;">${getCaissierName(
                    bon_approvisionnement.beneficiaire
                  )}</td>
                  <td style=" text-align: center;">${
                    bon_approvisionnement.source_approvisionnement
                  }</td>
                  <td style=" text-align: center;">${
                    bon_approvisionnement.reference_source
                  }</td>
                  <td style=" text-align: end;">${Number(
                    bon_approvisionnement.montant
                  ).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div class="approval" style="width: 70%;margin: 20px auto; text-align: center;">
              <div>Approbation :<p></p><br />_______________</div>
              <div>Caisse :<p></p><br />_______________</div>
              <div>Bénéficiaire :<p></p><br />_______________</div>
            </div>
            </fieldset>
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
  if (!bon_approvisionnement)
    return <p className="text-center">Aucun bon trouvé.</p>;

  return (
    <Container fluid className="vh-100 mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <Card.Title as="h3" className="mb-4 title-color">
            Bon d'approvisionnement {bon_approvisionnement.reference}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>
              Information du bon d'approvisionnement
            </h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Date</th>
                  <th className="text-center align-middle">Caisse</th>
                  <th className="text-center align-middle">Objet</th>
                  <th className="text-center align-middle">Référence Bon</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center align-middle">
                    {new Date(bon_approvisionnement.date).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td className="align-middle">
                    {getCaisseIntitule(bon_approvisionnement.beneficiaire)}
                  </td>
                  <td className="align-middle">
                    {bon_approvisionnement.objet}
                  </td>
                  <td className="align-middle text-center">
                    {bon_approvisionnement.reference}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>

          <fieldset>
            <h6 style={{ color: "#232754" }}>Détail Reçu</h6>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center align-middle">Bénéficiaire</th>
                  <th className="text-center align-middle">
                    Origine des fonds
                  </th>
                  <th className="text-center align-middle">
                    Référence Document
                  </th>
                  <th className="text-center align-middle">
                    Montant Total (F CFA)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="align-middle">
                    {getCaissierName(bon_approvisionnement.beneficiaire)}
                  </td>
                  <td className="align-middle">
                    {bon_approvisionnement.source_approvisionnement}
                  </td>
                  <td className="text-center align-middle">
                    {bon_approvisionnement.reference_source}
                  </td>
                  <td className="align-middle text-end">
                    {Number(bon_approvisionnement.montant).toLocaleString()}{" "}
                  </td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-end gap-3 button-container">
        {bon_approvisionnement.statut === "en attente" && (
          <Button
            variant="primary"
            onClick={() => {
              if (isCaisseNotFound(bon_approvisionnement.beneficiaire)) {
                alert("Aucune caisse n'est reliée à cet utilisateur.");
              } else {
                navigate(`/Add-reçu-caisse/${bon_approvisionnement.id}`);
              }
            }}
            disabled={isCaisseNotFound(bon_approvisionnement.beneficiaire)}
          >
            <FaExchangeAlt size={20} /> Convertir
          </Button>
        )}
        {bon_approvisionnement.statut === "en attente" && (
          <Button
            className="btn btn-warning"
            onClick={() =>
              navigate(`/Edit-Bon-Appro/${bon_approvisionnement.id}`)
            }
          >
            <FaEdit size={20} /> Modifier
          </Button>
        )}

        {bon_approvisionnement.statut === "convertit" && (
          <Button variant="primary" onClick={handlePrint}>
            <FaPrint size={20} /> Imprimer
          </Button>
        )}
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

export default Reçucaisse;
