import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Table, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Billetage, Caisse, Journée } from "@/Components/types";
import "react-toastify/dist/ReactToastify.css";

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("fr-FR").format(value);
};

const Ajoutbilletage: React.FC = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    b10000: 0,
    b5000: 0,
    b2000: 0,
    b1000: 0,
    b500: 0, // billet de 500
    p500: 0, // pièce de 500
    p250: 0,
    p200: 0,
    p100: 0,
    p50: 0,
    p25: 0,
    p10: 0,
    p5: 0,
  });
  const [theoreticalBalance, setTheoreticalBalance] = useState<number>(0);
  const [reference, setReference] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [caisseIntitule, setCaisseIntitule] = useState<string>("");
  const [caissierUsername, setCaissierUsername] = useState<string>("");
  const [caisse, setCaisse] = useState<Caisse | null>(null);
  const [journee, setJournee] = useState<Journée | null>(null);

  useEffect(() => {
    const today = new Date();
    const jour = String(today.getDate()).padStart(2, "0");
    const mois = String(today.getMonth() + 1).padStart(2, "0");
    const annee = today.getFullYear();
    setDate(`${jour}/${mois}/${annee}`);
  }, []);

  useEffect(() => {
    const fetchLastReference = async () => {
      try {
        const response = await fetch("http://localhost:3000/billetage");
        const billetages = await response.json();
        if (billetages.length > 0) {
          const lastReference = billetages[billetages.length - 1].reference;
          const nextReferenceNumber = parseInt(lastReference.slice(-3)) + 1;
          setReference(
            `N°BI${new Date().getFullYear()}${String(
              nextReferenceNumber
            ).padStart(3, "0")}`
          );
        } else {
          setReference(`N°BI${new Date().getFullYear()}001`);
        }
      } catch (error) {
        console.error("Erreur lors de la génération de la référence :", error);
      }
    };

    fetchLastReference();
  }, []);

  useEffect(() => {
    const fetchCaissierInfo = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        // Récupérer l'utilisateur connecté
        const userResponse = await fetch(
          `http://localhost:3000/users/${userId}`
        );
        const user = await userResponse.json();
        setCaissierUsername(user.username);

        // Récupérer la caisse de l'utilisateur
        const caisseResponse = await fetch("http://localhost:3000/caisse");
        const caisses: Caisse[] = await caisseResponse.json();
        const userCaisse = caisses.find(
          (c) => c.username_caissier === user.username
        );

        if (userCaisse) {
          setCaisse(userCaisse);
          setCaisseIntitule(userCaisse.intitulé);
          setTheoreticalBalance(Number(userCaisse.solde));
        }

        // Récupérer la journée active
        const journeeResponse = await fetch("http://localhost:3000/journée");
        const journees: Journée[] = await journeeResponse.json();
        const activeJournee = journees.find(
          (j) => j.active === "oui" && j.caissier_username === user.username
        );
        setJournee(activeJournee || null);
      } catch (error) {
        console.error("Erreur lors du chargement des informations :", error);
      }
    };

    fetchCaissierInfo();
  }, []);

  const handleChange = (field: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  const calculateTotal = () => {
    // Calcul pour les billets
    const totalBillets =
      quantities.b10000 * 10000 +
      quantities.b5000 * 5000 +
      quantities.b2000 * 2000 +
      quantities.b1000 * 1000 +
      quantities.b500 * 500; // billet de 500

    // Calcul pour les pièces
    const totalPieces =
      quantities.p500 * 500 + // pièce de 500
      quantities.p250 * 250 +
      quantities.p200 * 200 +
      quantities.p100 * 100 +
      quantities.p50 * 50 +
      quantities.p25 * 25 +
      quantities.p10 * 10 +
      quantities.p5 * 5;

    return {
      totalBillets,
      totalPieces,
      total: totalBillets + totalPieces,
    };
  };

  const { totalBillets, totalPieces, total } = calculateTotal();
  const difference = total - theoreticalBalance;

  const handleSubmit = async () => {
    if (difference !== 0) {
      toast.error("L'écart doit être égal à 0 pour valider le billetage");
      return;
    }

    const billetageData: Billetage = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      reference,
      caisse_intitilé: caisseIntitule,
      caissier_username: caissierUsername,
      solde_theorique: theoreticalBalance,
      solde_reel: total,
      ecart: difference,
      statut: "validée",
      b10000: quantities.b10000,
      b5000: quantities.b5000,
      b2000: quantities.b2000,
      b1000: quantities.b1000,
      b500: quantities.b500, // billet de 500
      p500: quantities.p500, // pièce de 500
      p250: quantities.p250,
      p200: quantities.p200,
      p100: quantities.p100,
      p50: quantities.p50,
      p25: quantities.p25,
      p10: quantities.p10,
      p5: quantities.p5,
    };

    try {
      // Enregistrer le billetage
      const response = await fetch("http://localhost:3000/billetage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billetageData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du billetage");
      }

      // Fermer la caisse
      if (caisse) {
        const fermerCaisseResponse = await fetch(
          `http://localhost:3000/caisse/${caisse.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...caisse, statut: "fermer" }),
          }
        );

        if (!fermerCaisseResponse.ok) {
          throw new Error("Erreur lors de la fermeture de la caisse");
        }
      }

      // Fermer la journée
      if (journee) {
        const fermerJourneeResponse = await fetch(
          `http://localhost:3000/journée/${journee.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...journee,
              date_fermeture: new Date().toISOString().slice(0, 16),
              active: "non",
              reference_billetage: reference,
            }),
          }
        );

        if (!fermerJourneeResponse.ok) {
          throw new Error("Erreur lors de la fermeture de la journée");
        }
      }

      toast.success("Billetage enregistré et caisse fermée avec succès");
      setTimeout(() => navigate("/Dashboard"), 2000);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de l'opération");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="shadow w-100">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">
            {" "}
            Effectuer le billetage avant fermeture de caisse
          </h6>
        </Card.Header>
        <Card.Body>
          <h5 className="mt-3 border-bottom pb-2">Information de Billetage</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="text" value={date} readOnly />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Référence</Form.Label>
                <Form.Control type="text" value={reference} readOnly />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-3 border-bottom pb-2">Détail Billetage</h5>
          <Table
            striped
            bordered
            hover
            responsive
            className="shadow-sm custom-table"
          >
            <thead>
              <tr>
                <th className="text-center">Nominal</th>
                <th className="text-center">Quantité</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="text-center fw-bold">
                  Billets
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">10 000</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.b10000}
                    onChange={(e) =>
                      handleChange("b10000", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.b10000 * 10000)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">5 000</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.b5000}
                    onChange={(e) =>
                      handleChange("b5000", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.b5000 * 5000)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">2 000</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.b2000}
                    onChange={(e) =>
                      handleChange("b2000", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.b2000 * 2000)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">1 000</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.b1000}
                    onChange={(e) =>
                      handleChange("b1000", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.b1000 * 1000)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">500</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.b500}
                    onChange={(e) =>
                      handleChange("b500", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.b500 * 500)}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="text-center fw-bold">
                  Sous Total Billets
                </td>
                <td className="text-end">{formatNumber(totalBillets)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-center fw-bold">
                  Monnaie
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">500</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p500}
                    onChange={(e) =>
                      handleChange("p500", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p500 * 500)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">250</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p250}
                    onChange={(e) =>
                      handleChange("p250", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p250 * 250)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">200</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p200}
                    onChange={(e) =>
                      handleChange("p200", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p200 * 200)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">100</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p100}
                    onChange={(e) =>
                      handleChange("p100", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p100 * 100)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">50</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p50}
                    onChange={(e) =>
                      handleChange("p50", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p50 * 50)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">25</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p25}
                    onChange={(e) =>
                      handleChange("p25", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p25 * 25)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">10</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p10}
                    onChange={(e) =>
                      handleChange("p10", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p10 * 10)}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle">5</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    className="text-end"
                    value={quantities.p5}
                    onChange={(e) =>
                      handleChange("p5", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(quantities.p5 * 5)}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="text-center fw-bold">
                  Sous Total Monnaie
                </td>
                <td className="text-end">{formatNumber(totalPieces)}</td>
              </tr>
            </tbody>
          </Table>

          <Table bordered className="mt-3" style={{ background: "#d1ecf1" }}>
            <tbody>
              <tr>
                <td
                  className="fw-bold text-center align-middle text-dark"
                  style={{ width: "56%" }}
                >
                  Total
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(total)}
                  />
                </td>
              </tr>
              <tr>
                <td className="fw-bold text-center align-middle text-dark">
                  Solde théorique
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className="text-end"
                    value={formatNumber(theoreticalBalance)}
                  />
                </td>
              </tr>
              <tr>
                <td className="fw-bold text-center align-middle text-dark">
                  Écart
                </td>
                <td>
                  <Form.Control
                    type="text"
                    readOnly
                    className={`text-end ${
                      difference === 0 ? "text-success" : "text-danger"
                    }`}
                    value={formatNumber(difference)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex justify-content-end gap-3 button-container mt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={difference !== 0}
            >
              Enregistrer et Fermer la Caisse
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/Close-caisse")}
            >
              <FaHome /> Retour
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default Ajoutbilletage;
