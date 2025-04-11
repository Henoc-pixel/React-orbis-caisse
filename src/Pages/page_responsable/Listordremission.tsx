import { Form, Button, Card, Table } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaFileExcel, FaPrint, FaHome } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Mission, User } from "@/Components/types";

const ListOrdreMission = () => {
  const [users, setUsers] = useState<User[]>([]); // État pour stocker les utilisateurs
  const [mission, setMission] = useState<Mission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Récupérer le username de l'utilisateur connecté
  const username = localStorage.getItem("username");

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getFullName = (username: string) => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.nom} ${user.prenoms}` : username;
  };

  // Utilisation de useCallback pour mémoriser fetchMission
  const fetchMission = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/mission");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Mission[] = await response.json();

      // Filtrer les besoins pour ne conserver que ceux de l'utilisateur connecté
      const filteredData = data.filter((item) => item.username === username);

      setMission(filteredData);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des besoins.",
        error
      );
    }
  }, [username]); // Ajoutez ici toutes les dépendances nécessaires

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
      fetchMission();
      fetchUsers(); // Charger les utilisateurs
    }
  }, [fetchMission, fetchUsers, navigate]);

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
          <h2>Liste des ordres de mission</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(mission);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ListeMission");
    XLSX.writeFile(workbook, "Liste_Ordre_Mission.xlsx");
  };

  const filteredBesoin = mission.filter((item: Mission) => {
    const matchesDate = item.date
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesReference = item.numero_ordre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGerant = item.gerant
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDestination = item.destinatoin
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTypes_operation = item.type_operation
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesNature_operation = item.nature_operation
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesObjet_mission = item.objet_mission
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate_depart = item.date_depart
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate_retour = item.date_retour
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatut = item.statut
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return (
      matchesDate ||
      matchesReference ||
      matchesGerant ||
      matchesDestination ||
      matchesTypes_operation ||
      matchesNature_operation ||
      matchesObjet_mission ||
      matchesDate_depart ||
      matchesDate_retour ||
      matchesStatut
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
        <h6 className="mb-0">Liste des ordres de mission</h6>
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
                <th className="align-middle">Gerant</th>
                <th className="align-middle">Donne ordre à</th>
                <th className="align-middle">De se rendre à</th>
                <th className="align-middle">Type opération</th>
                <th className="align-middle">Nature opération</th>
                <th className="align-middle">Objet de la mission</th>
                <th className="align-middle">Date depart</th>
                <th className="align-middle">date retour</th>
                <th className="align-middle">Statut</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBesoin.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center">
                    Aucune donnée disponible dans le tableau.
                  </td>
                </tr>
              ) : (
                currentBesoin.map((ordre_mission) => (
                  <tr key={ordre_mission.id}>
                    <td className="align-middle text-center">
                      {new Date(ordre_mission.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="align-middle">
                      {ordre_mission.numero_ordre}
                    </td>
                    <td className="align-middle">{ordre_mission.gerant}</td>
                    <td className="align-middle">
                      {getFullName(ordre_mission.username_ordre)}{" "}
                      {/* Utilisation de getFullName */}
                    </td>
                    <td className="align-middle">
                      {ordre_mission.destinatoin}
                    </td>
                    <td className="align-middle ">
                      {ordre_mission.type_operation}
                    </td>
                    <td className="align-middle">
                      {ordre_mission.nature_operation}
                    </td>
                    <td className="align-middle">
                      {ordre_mission.objet_mission}
                    </td>
                    <td className="align-middle text-center">
                      {new Date(ordre_mission.date_depart).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {new Date(ordre_mission.date_retour).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="text-center align-middle">
                      <span
                        className={`badge ${getStatusBadge(
                          ordre_mission.statut
                        )}`}
                      >
                        {ordre_mission.statut}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          navigate(`/Read-ordre-mission/${ordre_mission.id}`)
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
          <Link to="/Add-ordre-mission">
            <Button variant="primary">Nouveau</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ListOrdreMission;
