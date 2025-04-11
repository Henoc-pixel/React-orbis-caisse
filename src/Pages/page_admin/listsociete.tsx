import { Form, Button, Card, Table } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileExcel, FaPrint, FaHome } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { Societe } from "@/Components/types";

const Homesociete = () => {
  const [societe, setSociete] = useState<Societe[]>([]);
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
      fetchSociete();
    }
  }, [navigate]);

  const fetchSociete = async () => {
    try {
      const response = await fetch("http://localhost:3000/societe", );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des données.");
      const data: Societe[] = await response.json();
      setSociete(data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la liste des Societés.",
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
            th:last-child, td:last-child { display: none; }
          </style>
        </head>
        <body>
          <h2>Liste des societés</h2>
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
    const worksheet = XLSX.utils.json_to_sheet(societe);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ListeSocietés");
    XLSX.writeFile(workbook, "Liste_Societés.xlsx");
  };

  const filteredSociete = societe.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesDate = new Date(item.date)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .toLowerCase()
      .includes(searchLower);
    const matchesRaison = item.raison_sociale
      .toLowerCase()
      .includes(searchLower);
    const matchesForme = item.forme_juridique
      .toLowerCase()
      .includes(searchLower);
    const matchesActivie = item.activite
      .toLowerCase()
      .includes(searchLower);
    const matchesSiege_sociale = item.siege_sociale.toLowerCase().includes(searchLower);
    const matchesAdresse_postale = item.adresse_postale.toLowerCase().includes(searchLower);
    const matchesVille = item.ville
      .toLowerCase()
      .includes(searchLower);
      const matchesPays = item.pays
        .toLowerCase()
        .includes(searchLower);
        const matchesTelephone = item.telephone
          .toLowerCase()
          .includes(searchLower);
          const matchesEmail = item.email
            .toLowerCase()
            .includes(searchLower);
            const matchesCode_commercial = item.code_commercial
              .toLowerCase()
              .includes(searchLower);
              const matchesSite_web = item.site_web
                .toLowerCase()
                .includes(searchLower);
                const matchesNumero_contribuable = item.numero_compte_contribuable
                  .toLowerCase()
                  .includes(searchLower);
                   const matchesRegime_fiscal =
                     item.numero_compte_contribuable
                       .toLowerCase()
                       .includes(searchLower);
                        const matchesNumero_declarant =
                          item.numero_compte_contribuable
                            .toLowerCase()
                            .includes(searchLower);

    return (
      matchesDate ||
      matchesRaison ||
      matchesForme ||
      matchesActivie ||
      matchesSiege_sociale ||
      matchesAdresse_postale ||
      matchesVille ||
      matchesPays ||
      matchesTelephone ||
      matchesEmail ||
      matchesCode_commercial ||
      matchesSite_web ||
      matchesNumero_contribuable ||
      matchesRegime_fiscal ||
      matchesNumero_declarant 

    );
     
  });

  const lastIndex = currentPage * rowsPerPage;
  const firstIndex = lastIndex - rowsPerPage;
  const currentSociete = filteredSociete.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredSociete.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  }, [searchTerm]);

  return (
    <Card className="shadow w-100">
      <Card.Header className="text-white bg-primary">
        <h6 className="mb-0">Information societé</h6>
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
                <th className="align-middle">Raison sociale</th>
                <th className="align-middle">Forme juridique</th>
                <th className="align-middle">Activité</th>
                <th className="align-middle">Siege sociale</th>
                <th className="align-middle">Adresse postale</th>
                <th className="align-middle">Ville</th>
                <th className="align-middle">Pays</th>
                <th className="align-middle">Téléphone</th>
                <th className="align-middle">Email</th>
                <th className="align-middle">Site internet</th>
                <th className="align-middle">Code commerce</th>
                <th className="align-middle">Numéro compte contribuable</th>
                <th className="align-middle">Regime fiscal</th>
                <th className="align-middle">Numéro télé déclarant</th>
                <th className="text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSociete.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center">
                    Aucune donnée disponible dans le tableau
                  </td>
                </tr>
              ) : (
                currentSociete.map((societe) => (
                  <tr key={societe.id}>
                    <td className="text-center align-middle">
                      {new Date(societe.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="align-middle">{societe.raison_sociale}</td>
                    <td className="align-middle">{societe.forme_juridique}</td>
                    <td className="align-middle">{societe.activite}</td>
                    <td className="align-middle">{societe.siege_sociale}</td>
                    <td className="align-middle">{societe.adresse_postale}</td>
                    <td className="align-middle">{societe.ville}</td>
                    <td className="align-middle">{societe.pays}</td>
                    <td className="align-middle">{societe.telephone}</td>
                    <td className="align-middle">{societe.email}</td>
                    <td className="align-middle">{societe.site_web}</td>
                    <td className="align-middle">{societe.code_commercial}</td>
                    <td className="align-middle text-end">
                      {societe.numero_compte_contribuable}
                    </td>
                    <td className="align-middle">{societe.regime_fiscale}</td>
                    <td className="align-middle text-end">
                      {societe.numero_tele_declarant}
                    </td>

                    <td className="text-center align-middle">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => navigate(`/Edit-Societe/${societe.id}`)}
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
        <div className="d-flex justify-content-end gap-3 button-container">
          <Button
            className="btn btn-success"
            onClick={() => navigate("/Dashboard")}
          >
            <FaHome size={24} /> Accueil
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Homesociete;
