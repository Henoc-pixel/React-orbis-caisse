import { Form, Button, Card, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";
import { FaFileExcel, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { User } from "@/Components/types";

const Listuser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchUser();
    }
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des Utilisateurs.",
        error
      );
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
            /* Masquer la colonne "Actions" */
            th:last-child, td:last-child { display: none; }
          </style>
        </head>
        <body>
          <h2>Liste des Utilisateurs</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste_utilisateurs");
    XLSX.writeFile(workbook, "Liste_utilisateurs.xlsx");
  };

  // Filtrer les données en fonction de la recherche
  const filteredBesoin = users.filter((item) => {
    const matchesNom = item.nom
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPrenom = item.prenoms
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesUsername = item.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesContact = item.telephone
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFonction = item.fonction
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesService = item.service
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = item.role
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEmail = item.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (
      matchesNom ||
      matchesPrenom ||
      matchesUsername ||
      matchesContact ||
      matchesFonction ||
      matchesService ||
      matchesRole ||
      matchesEmail
    );
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentBesoin = filteredBesoin.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBesoin.length / rowsPerPage);

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Liste des utilisateurs</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Partie gauche : Barre de recherche + Sélecteur de lignes */}
          <div className="d-flex align-items-center gap-4">
            {/* Barre de recherche */}
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
                style={{ width: "250px" }} // Ajuste la largeur si nécessaire
              />
            </Form.Group>
            <Form.Label className="mb-0 ml-3">Afficher :</Form.Label>

            {/* Sélection du nombre de lignes */}
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

          {/* Partie droite : Boutons */}
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
                <th className="align-middle">Nom</th>
                <th className="align-middle">Prenoms</th>
                <th className="align-middle">Identifiant</th>
                <th className="align-middle">contact</th>
                <th className="align-middle">Email</th>
                <th className="align-middle">Fonction</th>
                <th className="align-middle">Service</th>
                <th className="align-middle">Role</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBesoin.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    Aucune donnée disponible dans le tableau
                  </td>
                </tr>
              ) : (
                currentBesoin.map((users) => (
                  <tr key={users.id}>
                    <td className="align-middle">{users.nom}</td>
                    <td className="align-middle">{users.prenoms}</td>
                    <td className="align-middle">{users.username}</td>
                    <td className="align-middle">{users.telephone}</td>
                    <td className="align-middle">{users.email}</td>
                    <td className="align-middle">{users.fonction}</td>
                    <td className="align-middle">{users.service}</td>
                    <td className="align-middle">{users.role}</td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => navigate(`/Edit-User/${users.id}`)}
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

export default Listuser;
