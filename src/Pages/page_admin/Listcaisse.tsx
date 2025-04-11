import { Form, Button, Card, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";
import { FaFileExcel, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Caisse, User } from "@/Components/types";

const Listcaisse = () => {
  const [caisse, setCaisse] = useState<Caisse[]>([]);
  const [users, setUsers] = useState<User[]>([]); // État pour stocker les utilisateurs
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
      fetchCaisse();
      fetchUsers(); // Récupérer les utilisateurs
    }
  }, [navigate]);

  const fetchCaisse = async () => {
    try {
      const response = await fetch("http://localhost:3000/caisse");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Caisse[] = await response.json();
      setCaisse(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des caisses.",
        error
      );
    }
  };

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

  // Fonction pour obtenir le nom et prénom du caissier
  const getCaissierName = (username: string) => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username; // Retourne le nom et prénom ou le username si non trouvé
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
            /* Masquer la colonne "Actions" */
            th:last-child, td:last-child { display: none; }
          </style>
        </head>
        <body>
          <h2>Liste des Caisses</h2>
          <p>Date d'impression : ${dateNow}</p>
          ${listRef.current.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close(); // Ferme la fenêtre après impression
              }, 500); // Petite attente pour s'assurer que l'impression démarre bien
            };
          </script>
        </body>
      </html>
    `);

      printWindow.document.close();
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(caisse);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste_caisses");
    XLSX.writeFile(workbook, "Liste_caisses.xlsx");
  };

  // Filtrer les données en fonction de la recherche
  const filteredBesoin = caisse.filter((item) => {
    const matchesCode = item.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesIntitulé = item.intitulé
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesUsername_caissier = item.username_caissier
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSolde = item.solde
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlafond = item.plafond
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return (
      matchesCode ||
      matchesIntitulé ||
      matchesUsername_caissier ||
      matchesSolde ||
      matchesPlafond
    );
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBesoin = filteredBesoin.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBesoin.length / rowsPerPage);

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Liste des Caisses</h6>
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
                <th className="align-middle">Code</th>
                <th className="align-middle">Intitulé</th>
                <th className="align-middle">Gérant</th>
                <th className="align-middle">Solde (FCFA)</th>
                <th className="align-middle">Plafond (FCFA)</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBesoin.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Aucune donnée disponible dans le tableau
                  </td>
                </tr>
              ) : (
                currentBesoin.map((caisseItem) => (
                  <tr key={caisseItem.id}>
                    <td className="align-middle">{caisseItem.code}</td>
                    <td className="align-middle">{caisseItem.intitulé}</td>
                    <td className="align-middle">
                      {getCaissierName(caisseItem.username_caissier)}{" "}
                      {/* Afficher le nom et prénom */}
                    </td>
                    <td className="align-middle text-end">
                      {Number(caisseItem.solde).toLocaleString()}{" "}
                    </td>
                    <td className="align-middle text-end">
                      {Number(caisseItem.plafond).toLocaleString()}{" "}
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(`/Edit-Caisse/${caisseItem.id}`)
                        }
                      >
                        <FaPencil size={20} />
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
          <Link to="/Add-User">
            <Button style={{ background: "#232754", color: "white" }}>
              Nouveau
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Listcaisse;
