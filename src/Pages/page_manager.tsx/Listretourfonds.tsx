import { Form, Button, Card, Table } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaFileExcel, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Retour_Fonds } from "@/Components/types";

const Listretourfonds = () => {
  const [retour_fonds, setRetour_Fonds] = useState<Retour_Fonds[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Récupérer le username de l'utilisateur connecté
  const username = localStorage.getItem("username");

  // Utilisation de useCallback pour mémoriser fetchRetour
  const fetchRetour = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/retour_fonds");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Retour_Fonds[] = await response.json();

      // Filtrer la liste a partir de l'username
      const filteredData = data.filter(
        (item) => item.username_retour === username
      );
      setRetour_Fonds(filteredData);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des besoins.",
        error
      );
    }
  }, [username]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchRetour();
    }
  }, [fetchRetour, navigate]); //

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
          <h2>Liste des Retour de fonds</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(retour_fonds);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ListeRetourfonds");
    XLSX.writeFile(workbook, "Liste_Retour_Fonds.xlsx");
  };

  const filteredRetour = retour_fonds.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesDate_retour = new Date(item.date_retour)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .toLowerCase()
      .includes(searchLower);

    const matchesReference_retour = item.reference_retour
      .toLowerCase()
      .includes(searchLower);
    const matchesType_depense = item.type_depense
      .toLowerCase()
      .includes(searchLower);
    const matchesReference_depense = item.reference_depense
      .toLowerCase()
      .includes(searchLower);
    const matchesStatut = item.statut.toLowerCase().includes(searchLower);
    const matchesMontant_sortie = item.montant_sortie
      .toString()
      .toLocaleString()
      .includes(searchLower);
    const matchesMontant_retourné = item.montant_sortie
      .toString()
      .toLocaleString()
      .includes(searchLower);

    return (
      matchesDate_retour ||
      matchesReference_retour ||
      matchesType_depense ||
      matchesReference_depense ||
      matchesStatut ||
      matchesMontant_sortie ||
      matchesMontant_retourné
    );
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBesoin = filteredRetour.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredRetour.length / rowsPerPage);

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
        <h6 className="mb-0">Liste des retour de fonds</h6>
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
                <th className="align-middle">Type de dépense</th>
                <th className="align-middle">Référence de la dépense</th>
                <th className="align-middle">Montant sortie (F.CFA)</th>
                <th className="align-middle">Montant retourné (F.CFA)</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRetour.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center">
                    Aucune donnée disponible dans le tableau.
                  </td>
                </tr>
              ) : (
                currentBesoin.map((Retour) => (
                  <tr key={Retour.id}>
                    <td className="text-center align-middle">
                      {new Date(Retour.date_retour).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="align-middle">{Retour.reference_retour}</td>
                    <td className="align-middle">{Retour.type_depense}</td>
                    <td className="align-middle">{Retour.reference_depense}</td>
                    <td className="align-middle text-end">
                      {Retour.montant_sortie.toLocaleString("fr-FR")}
                    </td>
                    <td className="align-middle text-end">
                      {Retour.montant_retourné.toLocaleString("fr-FR")}
                    </td>
                    <td className="align-middle text-center">
                      <span
                        className={`badge ${getStatusBadge(Retour.statut)}`}
                      >
                        {Retour.statut}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(`/Read-retour-fonds/${Retour.id}`)
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
        <hr />
        <div className="d-flex justify-content-end">
          <Link to="/Add-retour-fonds">
            <Button variant="primary">Nouveau</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Listretourfonds;
