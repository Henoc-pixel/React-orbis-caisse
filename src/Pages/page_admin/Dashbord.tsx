import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaBuilding, FaCashRegister } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { User, Caisse, Societe } from "@/Components/types";

ChartJS.register(...registerables);

// Types pour les données
type StatsData = {
  totalUsers: number;
  totalCaisses: number;
  totalSocietes: number;
  usersByRole: Record<string, number>;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCaisses: 0,
    totalSocietes: 0,
    usersByRole: {},
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        // Récupérer le rôle de l'utilisateur
        const userResponse = await fetch(
          `http://localhost:3000/users/${userId}`
        );
        const userData = await userResponse.json();
        setUserRole(userData.role);

        // Si l'utilisateur n'est pas ADMIN, on s'arrête là
        if (userData.role !== "ADMIN") {
          setLoading(false);
          return;
        }

        // Récupérer toutes les données nécessaires seulement pour ADMIN
        const [usersRes, caisseRes, societeRes] = await Promise.all([
          fetch("http://localhost:3000/users"),
          fetch("http://localhost:3000/caisse"),
          fetch("http://localhost:3000/societe"),
        ]);

        const users: User[] = await usersRes.json();
        const caisses: Caisse[] = await caisseRes.json();
        const societes: Societe[] = await societeRes.json();

        // Compter les utilisateurs par rôle
        const usersByRole: Record<string, number> = {
          USER: 0,
          MANAGER: 0,
          MANAGER1: 0,
          RESPONSABLE: 0,
          IMPRESSION: 0,
          ADMIN: 0,
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
          totalSocietes: societes.length,
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

  // Si l'utilisateur n'est pas ADMIN, afficher une page vierge
  if (userRole !== "ADMIN") {
    return <div style={{ display: "none" }}></div>;
  }

  // Données pour le diagramme à barres (Répartition des utilisateurs)
  const barChartData = {
    labels: [
      "Crée/Convertir Document",
      "Approuver Fiche de besoin",
      "Valider Fiche de besoin",
      "Créer/Modifier Fiche de besoin",
      "Imprimer Document",
    ],
    datasets: [
      {
        label: "Nombre d'utilisateurs par rôle",
        data: [
          stats.usersByRole.MANAGER,
          stats.usersByRole.MANAGER1,
          stats.usersByRole.RESPONSABLE,
          stats.usersByRole.USER,
          stats.usersByRole.IMPRESSION,
        ],
        backgroundColor: [
          "#007bff",
          "#00a28a",
          "#f7c12c",
          "#ea2222",
          "#5f4b8b",
        ],
        borderColor: ["#fff", "#fff", "#fff", "#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container-fluid">
      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={4}>
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

        <Col md={4}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #232754" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#232754" }}
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

        <Col md={4}>
          <Card
            className="shadow-sm h-100"
            style={{ borderLeft: "4px solid #232754" }}
          >
            <Card.Body className="d-flex align-items-center">
              <div
                className="me-3"
                style={{ fontSize: "2rem", color: "#232754" }}
              >
                <FaBuilding />
              </div>
              <div>
                <Card.Title className="mb-0">Sociétés</Card.Title>
                <Card.Text className="fs-3 fw-bold">
                  {stats.totalSocietes}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphique de répartition des utilisateurs */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm h-500">
            <div style={{ height: "700px", width: "70%", margin: "auto" }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
