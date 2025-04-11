import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Table, Container } from "react-bootstrap";
import { FaPrint } from "react-icons/fa";
import { Besoin, Bon_Caisse } from "@/Components/types";

const PrintBesoinConvertit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [besoin, setBesoin] = useState<Besoin | null>(null);
  const [bonCaisse, setBonCaisse] = useState<Bon_Caisse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handlePrint = () => {
    window.print();
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
            Bon de Caisse {bonCaisse?.reference_bon_caisse}
          </Card.Title>
          <hr />
          <fieldset>
            <h6 style={{ color: "#232754" }}>Information Décaissement</h6>
            <Table bordered className="custom-table">
              <tbody>
                <tr>
                  <td className="small-label">Numéro du bon de caisse</td>
                  <td>{bonCaisse?.reference_bon_caisse}</td>
                </tr>
                <tr>
                  <td className="small-label">Date</td>
                  <td>{bonCaisse?.date_bon_caisse}</td>
                </tr>
                <tr>
                  <td className="small-label">Bénéficiaire</td>
                  <td>{bonCaisse?.beneficiaire}</td>
                </tr>
                <tr>
                  <td className="small-label">Libellé</td>
                  <td>{bonCaisse?.nature_operation_besoin}</td>
                </tr>
                <tr>
                  <td className="small-label">Montant en lettres</td>
                  <td>{convertToWords(totalMontant)}</td>
                </tr>
                <tr>
                  <td className="small-label">Statut</td>
                  <td>{bonCaisse?.statut}</td>
                </tr>
              </tbody>
            </Table>
          </fieldset>
          <fieldset>
            <h6 style={{ color: "#232754" }}>Détail Opération</h6>
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
            <Button variant="secondary" onClick={handlePrint}>
              <FaPrint /> Imprimer
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
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

export default PrintBesoinConvertit;
