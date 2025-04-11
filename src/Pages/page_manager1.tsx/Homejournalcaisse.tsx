import { Form, Button, Card, Table, Row, Col } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileExcel,
  FaPrint,
  FaList,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { Journal_Caisse } from "@/Components/types";

const Homejournalcaisse = () => {
  const [journal, setJournal] = useState<Journal_Caisse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchJournal = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/journal_caisse");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Journal_Caisse[] = await response.json();
      setJournal(data);
    } catch (error) {
      console.error("Erreur lors du chargement du journal.", error);
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchJournal();
    }
  }, [fetchJournal, navigate]);

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
          <h2>Etat de la caisse</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(filteredJornal);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EtatCaisse");
    XLSX.writeFile(workbook, "Etat_Caisse.xlsx");
  };

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  const filteredJornal = journal.filter((item) => {
    if (!hasSearched) return false;

    const itemDate = new Date(item.date);

    // Filtrage par intervalle de dates
    if (dateDebut && new Date(dateDebut) > itemDate) return false;
    if (dateFin && new Date(dateFin) < itemDate) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesDate = itemDate
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .toLowerCase()
      .includes(searchLower);

    const matchesNumero_pièce = item.numero_pièce
      .toLowerCase()
      .includes(searchLower);
    const matchesNature_opération = item.nature_opération
      .toLowerCase()
      .includes(searchLower);
    const matchesLibellé = item.libellé.toLowerCase().includes(searchLower);
    const matchesEntrée = item.entrée.toString().includes(searchLower);
    const matchesSortie = item.sortie.toString().includes(searchLower);
    const matchesSolde = item.solde.toString().includes(searchLower);

    return (
      matchesDate ||
      matchesNumero_pièce ||
      matchesNature_opération ||
      matchesLibellé ||
      matchesEntrée ||
      matchesSortie ||
      matchesSolde
    );
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBesoin = filteredJornal.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredJornal.length / rowsPerPage);

  const resetDates = () => {
    setDateDebut("");
    setDateFin("");
    setHasSearched(false);
    setSearchTerm("");
  };

  return (
    <>
      {/* Card Période */}

      <Card className="shadow w-100 mb-3">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">
            <FaCalendarAlt size={24} /> Période
          </h6>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Group
                as={Row}
                controlId="dateDebut"
                className="mb-3 align-items-center"
              >
                <Form.Label column sm="4" className="text-nowrap">
                  Date de début
                </Form.Label>
                <Col sm="8" md="8">
                  <Form.Control
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group
                as={Row}
                controlId="dateFin"
                className="mb-3 align-items-center"
              >
                <Form.Label column sm="4" className="text-nowrap">
                  Date de fin
                </Form.Label>
                <Col sm="8" md="8">
                  <Form.Control
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col
              md={6}
              className="d-flex align-items-center justify-content-end"
            >
              <div className="d-flex justify-content-end gap-3 button-container">
                <Button
                  variant="secondary"
                  onClick={resetDates}
                  className="me-2"
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="success"
                  onClick={handleSearch}
                  disabled={!dateDebut && !dateFin}
                >
                  <FaSearch size={24} /> Rechercher
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Card Etat de la caisse */}
      <Card className="shadow w-100">
        <Card.Header className="text-white bg-primary">
          <h6 className="mb-0">
            <FaList size={24} /> Etat de la caisse
          </h6>
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
                  disabled={!hasSearched}
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
                  disabled={!hasSearched}
                >
                  <option value={10}>10 lignes</option>
                  <option value={25}>25 lignes</option>
                  <option value={50}>50 lignes</option>
                  <option value={100}>100 lignes</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="d-flex justify-content-end gap-3 button-container">
              <Button
                variant="secondary"
                onClick={handlePrint}
                disabled={!hasSearched || filteredJornal.length === 0}
              >
                <FaPrint /> Imprimer
              </Button>
              <Button
                variant="success"
                onClick={handleDownloadExcel}
                disabled={!hasSearched || filteredJornal.length === 0}
              >
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
              className="shadow-sm custom-etat-journal"
            >
              <thead style={{ background: "#f6f7f9" }}>
                <tr className="text-center align-middle">
                  <th className="align-middle">Date</th>
                  <th className="align-middle">N° de la pièce</th>
                  <th className="align-middle">Nature opération</th>
                  <th className="align-middle">Libellé</th>
                  <th className="align-middle">Entrée</th>
                  <th className="align-middle">Sortie</th>
                  <th className="align-middle">Solde</th>
                </tr>
              </thead>
              <tbody>
                {!hasSearched ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Veuillez sélectionner une période et cliquer sur
                      "Rechercher" pour afficher les données
                    </td>
                  </tr>
                ) : filteredJornal.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Aucune donnée disponible pour la période sélectionnée
                    </td>
                  </tr>
                ) : (
                  currentBesoin.map((journal) => (
                    <tr key={journal.id}>
                      <td className="text-center align-middle">
                        {new Date(journal.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="align-middle">{journal.numero_pièce}</td>
                      <td className="align-middle">
                        {journal.nature_opération}
                      </td>
                      <td className="align-middle">{journal.libellé}</td>
                      <td className="align-middle text-end">
                        {journal.entrée.toLocaleString()}
                      </td>
                      <td className="align-middle text-end">
                        {journal.sortie.toLocaleString()}
                      </td>
                      <td className="align-middle text-end">
                        {journal.solde.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {hasSearched && filteredJornal.length > 0 && (
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
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default Homejournalcaisse;
