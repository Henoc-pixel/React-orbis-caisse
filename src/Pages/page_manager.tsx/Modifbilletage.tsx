import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Table, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { FaHome } from "react-icons/fa";
import { Billetage } from "@/Components/types";
import "react-toastify/dist/ReactToastify.css";

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("fr-FR").format(value);
};

const ModifBilletage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    b10000: 0,
    b5000: 0,
    b2000: 0,
    b1000: 0,
    b500: 0,
    p500: 0,
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilletage = async () => {
      try {
        const response = await fetch(`http://localhost:3000/billetage/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du billetage");
        }
        const billetage: Billetage = await response.json();

        setQuantities({
          b10000: billetage.b10000,
          b5000: billetage.b5000,
          b2000: billetage.b2000,
          b1000: billetage.b1000,
          b500: billetage.b500,
          p500: billetage.p500,
          p250: billetage.p250,
          p200: billetage.p200,
          p100: billetage.p100,
          p50: billetage.p50,
          p25: billetage.p25,
          p10: billetage.p10,
          p5: billetage.p5,
        });

        setTheoreticalBalance(billetage.solde_theorique);
        setReference(billetage.reference);
        setDate(new Date(billetage.date).toLocaleDateString("fr-FR"));
        setCaisseIntitule(billetage.caisse_intitilé);
        setCaissierUsername(billetage.caissier_username);

        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement du billetage");
        setLoading(false);
      }
    };

    fetchBilletage();
  }, [id]);

  const handleChange = (field: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  const calculateTotal = () => {
    const totalBillets =
      quantities.b10000 * 10000 +
      quantities.b5000 * 5000 +
      quantities.b2000 * 2000 +
      quantities.b1000 * 1000 +
      quantities.b500 * 500;

    const totalPieces =
      quantities.p500 * 500 +
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
      id: id || "",
      date: new Date(date.split("/").reverse().join("-"))
        .toISOString()
        .split("T")[0],
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
      b500: quantities.b500,
      p500: quantities.p500,
      p250: quantities.p250,
      p200: quantities.p200,
      p100: quantities.p100,
      p50: quantities.p50,
      p25: quantities.p25,
      p10: quantities.p10,
      p5: quantities.p5,
    };

    try {
      const response = await fetch(`http://localhost:3000/billetage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billetageData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification du billetage");
      }

      toast.success("Billetage modifié avec succès");
      setTimeout(() => navigate("/List-billetage"), 2000);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la modification");
    }
  };

  if (loading) {
    return <div className="text-center">Chargement en cours...</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="shadow w-100">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Modifier le billetage</h6>
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
              Enregistrer les modifications
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
    </>
  );
};

export default ModifBilletage;
