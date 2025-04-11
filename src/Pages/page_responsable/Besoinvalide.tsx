import { Form, Button, Card, Table } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaFileExcel, FaPrint, FaHome } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Besoin } from "@/Components/types";

const Homevalidéeresponsable = () => {
  const [besoin, setBesoin] = useState<Besoin[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Utilisation de useCallback pour mémoriser fetchBesoin
  const fetchBesoin = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/besoin");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Besoin[] = await response.json();

      // Filtrer les besoins pour ne conserver que ceux ayant le statut "validée"
      const filteredData = data.filter((item) => item.statut === "validée");

      setBesoin(filteredData);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des besoins.",
        error
      );
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchBesoin();
    }
  }, [fetchBesoin, navigate]); // Ajoutez fetchBesoin dans le tableau des dépendances

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && listRef.current) {
      const dateNow = new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      printWindow.document.write(`
      <html>
        <head>
          <title>Impression</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, p { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            th:last-child, td:last-child { display: none; }
          </style>
        </head>
        <body>
          <h2>Liste des fiches de besoin</h2>
          <p>Date d'impression : ${dateNow}</p>
          ${listRef.current.innerHTML}
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

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(besoin);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ListeBesoins");
    XLSX.writeFile(workbook, "Liste_Besoins.xlsx");
  };

  const filteredBesoin = besoin.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesDate = new Date(item.date)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .toLowerCase()
      .includes(searchLower);

    const matchesEmetteur = item.emetteur.toLowerCase().includes(searchLower);
    const matchesDestinataire = item.destinataire
      .toLowerCase()
      .includes(searchLower);
    const matchesBeneficiaire = item.beneficiaire
      .toLowerCase()
      .includes(searchLower);
    const matchesNature = item.nature_operation
      .toLowerCase()
      .includes(searchLower);
    const matchesType = item.type_operation.toLowerCase().includes(searchLower);
    const matchesObjet = item.details.some((detail) =>
      detail.objet.toLowerCase().includes(searchLower)
    );
    const matchesMontant = item.details.some((detail) =>
      detail.montant.toString().includes(searchLower)
    );
    const matchesStatut = item.statut.toLowerCase().includes(searchLower);
    const matchesReference = item.reference.toLowerCase().includes(searchLower);

    return (
      matchesDate ||
      matchesEmetteur ||
      matchesDestinataire ||
      matchesBeneficiaire ||
      matchesNature ||
      matchesType ||
      matchesObjet ||
      matchesMontant ||
      matchesStatut ||
      matchesReference
    );
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBesoin = filteredBesoin.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBesoin.length / rowsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validée":
        return "badge-info";
      case "en attente":
        return "badge-danger";
      case "annulée":
        return "badge-warning";
      case "approuvée":
        return "badge-primary";
      case "convertit":
        return "badge-success";
      default:
        return "badge-secondary";
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  }, [searchTerm]);

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Liste des fiches de besoins</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-4">
            <Form.Group
              controlId="search"
              className="d-flex align-items-center gap-2 mb-0"
            >
              <Form.Label className="mb-0">Rechercher :</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "250px" }}
              />
            </Form.Group>
            <Form.Label className="mb-0 ml-3">Afficher :</Form.Label>
            <Form.Group
              controlId="rowsPerPage"
              className="d-flex align-items-center gap-2 mb-0"
            >
              <Form.Select
                className="custom-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 lignes</option>
                <option value={25}>25 lignes</option>
                <option value={50}>50 lignes</option>
                <option value={100}>100 lignes</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="d-flex justify-content-end gap-3 button-container">
            <Button variant="secondary" onClick={handlePrint}>
              <FaPrint /> Imprimer
            </Button>
            <Button variant="success" onClick={handleDownloadExcel}>
              <FaFileExcel /> Exporter Excel
            </Button>
          </div>
        </div>

        <div ref={listRef}>
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
                <th className="align-middle">Type de l'opération</th>
                <th className="align-middle">Objet de dépense</th>
                <th className="align-middle">Montant (F.CFA)</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBesoin.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center">
                    Aucune donnée disponible dans le tableau.
                  </td>
                </tr>
              ) : (
                currentBesoin.map((besoin) => (
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
                    <td className="align-middle">
                      {besoin.details
                        .map((detail) => detail.objet)
                        .join(", \n")
                        .split("\n")
                        .map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                    </td>
                    <td className="text-end align-middle">
                      {besoin.details
                        .reduce((acc, detail) => acc + detail.montant, 0)
                        .toLocaleString()}
                    </td>
                    <td className="align-middle text-center">
                      <span
                        className={`badge ${getStatusBadge(besoin.statut)}`}
                      >
                        {besoin.statut}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => navigate(`/Validée-besoin/${besoin.id}`)}
                      >
                        <FaEye size={20} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <div>
            Page {currentPage} sur {totalPages}
          </div>
          <div className="button-container">
            <Button
              variant="outline-primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline-primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="ms-2"
            >
              Suivant
            </Button>
          </div>
        </div>
        <hr />
        <div className="d-flex justify-content-end gap-3 button-container">
          <Button
            className="btn btn-success"
            onClick={() => navigate("/Dashboard")}
          >
            <FaHome size={24} /> Accueil
          </Button>
          <Link to="/Add-FDB">
            <Button variant="primary">Nouveau</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Homevalidéeresponsable;
