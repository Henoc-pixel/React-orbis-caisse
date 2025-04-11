import { Form, Button, Card, Table } from "react-bootstrap";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileExcel, FaPrint, FaEye, FaHome } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Bon_Approvisionnement, User } from "@/Components/types";

const ListBonApprovisionnement = () => {
  const [bon_Approvisionnement, setBon_Approvisionnement] = useState<
    Bon_Approvisionnement[]
  >([]);
  const [users, setUsers] = useState<User[]>([]); // État pour stocker les utilisateurs
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Récupérer le username de l'utilisateur connecté
  const username = localStorage.getItem("username");

  // Utilisation de useCallback pour mémoriser fetchBons
  const fetchBons = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/bon_approvisionnement"
      );
      const data = await response.json();

      // Filtrer les bons pour ne conserver que ceux de l'utilisateur connecté
      const filteredData = data.filter(
        (item: Bon_Approvisionnement) => item.beneficiaire === username
      );

      setBon_Approvisionnement(filteredData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des bons d'approvisionnement :",
        error
      );
    }
  }, [username]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des utilisateurs.");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs.", error);
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    } else {
      fetchBons();
      fetchUsers();
    }
  }, [navigate, fetchBons, fetchUsers]); // Ajouter fetchBons et fetchUsers dans les dépendances

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
          <h2>Liste des bons d'approvisionnement</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(bon_Approvisionnement);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Liste__bons_approvisionnement"
    );
    XLSX.writeFile(workbook, "Liste_bons_approvisionnement.xlsx");
  };

  // Filtrer les données en fonction de la recherche
  const filteredBesoin = bon_Approvisionnement.filter(
    (item: Bon_Approvisionnement) => {
      const matchesReference = item.date
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesIntitulé = item.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBeneficiaire = item.beneficiaire
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesObjet = item.objet
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSource_approvisionnement = item.source_approvisionnement
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesReference_source = item.reference_source
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMontant = item.montant
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatut = item.statut
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return (
        matchesReference ||
        matchesIntitulé ||
        matchesBeneficiaire ||
        matchesObjet ||
        matchesSource_approvisionnement ||
        matchesReference_source ||
        matchesMontant ||
        matchesStatut
      );
    }
  );

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

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Liste des bons d'approvisionnement</h6>
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
                <th className="align-middle">Bénéficiaire</th>
                <th className="align-middle">Objet</th>
                <th className="align-middle">Montant (FCFA)</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBesoin.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Aucune donnée disponible dans le tableau.
                  </td>
                </tr>
              ) : (
                currentBesoin.map((bon_approvisionnement) => (
                  <tr key={bon_approvisionnement.id}>
                    <td className="align-middle text-center">
                      {new Date(bon_approvisionnement.date).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="align-middle">
                      {bon_approvisionnement.reference}
                    </td>
                    <td className="align-middle">
                      {getCaissierName(bon_approvisionnement.beneficiaire)}
                    </td>
                    <td className="align-middle">
                      {bon_approvisionnement.objet}
                    </td>
                    <td className="align-middle text-end">
                      {Number(bon_approvisionnement.montant).toLocaleString()}{" "}
                      {/* Conversion en nombre et ajout des séparateurs de milliers */}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${getStatusBadge(
                          bon_approvisionnement.statut
                        )}`}
                      >
                        {bon_approvisionnement.statut}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/Read-reçu-caisse/${bon_approvisionnement.id}`
                          )
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
        <div className="d-flex justify-content-end gap-3 button-container">
          <Button
            className="btn btn-success"
            onClick={() => navigate("/Dashboard")}
          >
            <FaHome size={24} /> Accueil
          </Button>
          <Link to="/Add-Bon-Appro">
            <Button style={{ background: "#232754", color: "white" }}>
              Nouveau
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ListBonApprovisionnement;
