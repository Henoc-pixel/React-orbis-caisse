import { Form, Button, Card, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileExcel, FaPrint, FaEye } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Billetage } from "@/Components/types";

const ListBilletage = () => {
  const [billetages, setBilletages] = useState<Billetage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchBilletages();
    }
  }, [navigate]);

  const fetchBilletages = async () => {
    try {
      const response = await fetch("http://localhost:3000/billetage");
      const data = await response.json();
      setBilletages(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des billetages :", error);
    }
  };

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
          <h2>Liste des billetages</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(billetages);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste_Billetages");
    XLSX.writeFile(workbook, "Liste_Billetages.xlsx");
  };

  const filteredBilletages = billetages.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesDate = new Date(item.date)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .toLowerCase()
      .includes(searchLower);
    const matchesReference = item.reference.toLowerCase().includes(searchLower);
    const matchesCaisse = item.caisse_intitilé
      .toLowerCase()
      .includes(searchLower);
    const matchesSolde = item.solde_reel.toString().includes(searchLower);

    return matchesDate || matchesReference || matchesCaisse || matchesSolde;
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBilletages = filteredBilletages.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBilletages.length / rowsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validée":
        return "badge-success";
      case "en attente":
        return "badge-warning";
      case "annulée":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Liste des billetages</h6>
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
                <th className="text-center align-middle">Date</th>
                <th className="align-middle">Référence</th>
                <th className="align-middle">Caisse</th>
                <th className="align-middle">Solde réel (FCFA)</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBilletages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Aucune donnée disponible dans le tableau.
                  </td>
                </tr>
              ) : (
                currentBilletages.map((billetage) => (
                  <tr key={billetage.id}>
                    <td className="align-middle text-center">
                      {new Date(billetage.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="align-middle">{billetage.reference}</td>
                    <td className="align-middle">
                      {billetage.caisse_intitilé}
                    </td>
                    <td className="align-middle text-end">
                      {billetage.solde_reel.toLocaleString()}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${getStatusBadge(billetage.statut)}`}
                      >
                        {billetage.statut}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(`/Read-billetage/${billetage.id}`)
                        }
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
      </Card.Body>
    </Card>
  );
};

export default ListBilletage;
