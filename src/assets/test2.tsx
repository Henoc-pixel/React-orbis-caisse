import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import {
  FaUsers,
  FaMoneyBillWave,
  FaFileAlt,
  FaCashRegister,
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { User, Caisse, Besoin, Bon_Caisse} from "@/Components/types";

ChartJS.register(...registerables);

// Types pour les données
type StatsData = {
  totalUsers: number;
  totalCaisses: number;
  totalBesoin: number;
  totalBonCaisse: number;
  recentBesoin: Besoin[];
  recentBonCaisse: Bon_Caisse[];
  usersByRole: Record<string, number>;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCaisses: 0,
    totalBesoin: 0,
    totalBonCaisse: 0,
    recentBesoin: [],
    recentBonCaisse: [],
    usersByRole: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer toutes les données nécessaires
        const [usersRes, caisseRes, besoinRes, bonCaisseRes] =
          await Promise.all([
            fetch("http://localhost:3000/users"),
            fetch("http://localhost:3000/caisse"),
            fetch("http://localhost:3000/besoin"),
            fetch("http://localhost:3000/bon_caisse"),
          ]);

        const users: User[] = await usersRes.json();
        const caisses: Caisse[] = await caisseRes.json();
        const besoins: Besoin[] = await besoinRes.json();
        const bonCaisses: Bon_Caisse[] = await bonCaisseRes.json();

        // Compter les utilisateurs par rôle
        const usersByRole: Record<string, number> = {
          USER: 0,
          MANAGER: 0,
          MANAGER1: 0,
          RESPONSABLE: 0,
          IMPRESSION: 0,
        };

        users.forEach((user) => {
          if (user.role in usersByRole) {
            usersByRole[user.role]++;
          }
        });

        // Calculer les statistiques
        setStats({
          totalUsers: users.length,
          totalCaisses: caisses.length,
          totalBesoin: besoins.length,
          totalBonCaisse: bonCaisses.length,
          recentBesoin: besoins.slice(-5).reverse(),
          recentBonCaisse: bonCaisses.slice(-5).reverse(),
          usersByRole,
        });

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Chargement en cours...</div>;
  }

  // Données pour le diagramme à barres (Bons de caisse par mois)
  const barChartData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
    datasets: [
      {
        label: "Bons de caisse",
        data: [3, 5, 2, 4, 6, 1], // Exemple de données, à adapter
        backgroundColor: "#232754",
        borderColor: "#232754",
        borderWidth: 1,
      },
    ],
  };

  // Données pour le diagramme circulaire (Utilisateurs par rôle)
  const pieChartData = {
    labels: ["Utilisateurs", "Managers", "Responsables", "Impression"],
    datasets: [
      {
        data: [
          stats.usersByRole.USER,
          stats.usersByRole.MANAGER + stats.usersByRole.MANAGER1,
          stats.usersByRole.RESPONSABLE,
          stats.usersByRole.IMPRESSION,
        ],
        backgroundColor: ["#232754", "#4e57aa", "#7a81c0", "#a7abd6"],
        borderColor: ["#fff", "#fff", "#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-4">Tableau de Bord</h4>

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #232754" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#232754" }}
              >
                <FaUsers />
              </div>
              <div>
                <Card.Title className="mb-0">Utilisateurs</Card.Title>
                <Card.Text className="fs-3 fw-bold">
                  {stats.totalUsers}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #4e57aa" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#4e57aa" }}
              >
                <FaCashRegister />
              </div>
              <div>
                <Card.Title className="mb-0">Caisses</Card.Title>
                <Card.Text className="fs-3 fw-bold">
                  {stats.totalCaisses}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #7a81c0" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#7a81c0" }}
              >
                <FaFileAlt />
              </div>
              <div>
                <Card.Title className="mb-0">Fiches de besoin</Card.Title>
                <Card.Text className="fs-3 fw-bold">
                  {stats.totalBesoin}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #a7abd6" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#a7abd6" }}
              >
                <FaMoneyBillWave />
              </div>
              <div>
                <Card.Title className="mb-0">Bons de caisse</Card.Title>
                <Card.Text className="fs-3 fw-bold">
                  {stats.totalBonCaisse}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#232754" }}
            >
              <h6 className="mb-0">Bons de caisse par mois</h6>
            </Card.Header>
            <Card.Body>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#232754" }}
            >
              <h6 className="mb-0">Répartition des utilisateurs</h6>
            </Card.Header>
            <Card.Body>
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dernières fiches de besoin */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#232754" }}
            >
              <h6 className="mb-0">Dernières Fiches de Besoin</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBesoin.map((besoin) => (
                      <tr key={besoin.id}>
                        <td>{besoin.reference || "N/A"}</td>
                        <td>{besoin.date}</td>
                        <td>
                          {besoin.details
                            ?.reduce(
                              (sum: number, item: any) => sum + item.montant,
                              0
                            )
                            .toLocaleString() || "0"}{" "}
                          FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Derniers bons de caisse */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#232754" }}
            >
              <h6 className="mb-0">Derniers Bons de Caisse</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBonCaisse.map((bon) => (
                      <tr key={bon.id}>
                        <td>{bon.reference_bon_caisse || "N/A"}</td>
                        <td>{bon.date_bon_caisse}</td>
                        <td>
                          {Number(bon.montant_besoin || 0).toLocaleString()}{" "}
                          FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Nombre de comptes */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#232754" }}
            >
              <h6 className="mb-0">Nombre de comptes</h6>
            </Card.Header>
            <Card.Body>
              <h5 style={{ color: "#232754" }}>Caisse connectée</h5>

              <div className="mb-4">
                <h6>Numéro d'utilisateurs par rôle</h6>
                <ul>
                  <li>
                    Créer/Modifier Fiche de besoin (USER):{" "}
                    {stats.usersByRole.USER}
                  </li>
                  <li>
                    Approuver Fiche de besoin (MANAGER1):{" "}
                    {stats.usersByRole.MANAGER1}
                  </li>
                  <li>
                    Valider Fiche de besoin (RESPONSABLE):{" "}
                    {stats.usersByRole.RESPONSABLE}
                  </li>
                  <li>
                    Imprimer Document (IMPRESSION):{" "}
                    {stats.usersByRole.IMPRESSION}
                  </li>
                </ul>
              </div>

              <div>
                <h6>Clean/Connect Document</h6>
                <ul>
                  <li>Approuveur Fiche de besoin</li>
                  <li>Valider Fiche de besoin</li>
                  <li>Créer/Abattér Fiche de besoin</li>
                  <li>Impétrer/Deprimétrin/Lonys</li>
                  <li>Accéder aux paramètres pour activer Windows</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
