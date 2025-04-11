import {
  Accordion,
  Nav,
  Tooltip,
  OverlayTrigger,
  Dropdown,
  Popover,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaMoon,
  FaHome,
  FaFileAlt,
  FaPrint,
  FaMoneyBill,
  FaUsers,
  FaBuilding,
  FaLock,
} from "react-icons/fa";
import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import "@/assets/css/custom.css";
import { FaHandHoldingUsd } from "react-icons/fa";
import { IoWallet } from "react-icons/io5";
import { BiSolidFile } from "react-icons/bi";

const Sidebar: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("Navbar must be used within a ThemeProvider");
  }

  const { darkMode, setDarkMode } = themeContext;

  // Fetch user role on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Render sections based on user role
  const renderSections = () => {
    switch (userRole) {
      case "RESPONSABLE":
        return (
          <>
            <SidebarSection
              sectionTitle="CREER UNE FICHE DE BESOIN"
              title="Fiche de besoin"
              icon={<FaFileAlt size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-FDB" },
                { label: "Liste", to: "/List-FDB" },
              ]}
            />
            <SidebarSection
              sectionTitle="VALIDATION"
              title="Fiche de besoin"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Besoin en attente", to: "/List-Attente" },
                { label: "Besoin valide", to: "/List-Validée1" },
              ]}
            />
            <SidebarSection
              sectionTitle="ORDRE DE MISSION"
              title="Ordre de mission"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-ordre-mission" },
                { label: "Liste ordre de mission", to: "/List-ordre-mission" },
                { label: "Liste Bon de mission", to: "/List-bon-mission" },
              ]}
            />
          </>
        );

      case "USER":
        return (
          <>
            <SidebarSection
              sectionTitle="CREER UNE FICHE DE BESOIN"
              title="Fiche de besoin"
              icon={<FaFileAlt size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-FDB" },
                { label: "Liste", to: "/List-FDB" },
              ]}
            />
          </>
        );

      case "IMPRESSION":
        return (
          <>
            <SidebarSection
              sectionTitle="CREER UNE FICHE DE BESOIN"
              title="Fiche de besoin"
              icon={<FaFileAlt size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-FDB" },
                { label: "Liste", to: "/List-FDB" },
              ]}
            />
            <SidebarSection
              sectionTitle="CREER UN ORDRE DE MISSION"
              title="Ordre de mission"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-ordre-mission" },
                { label: "Liste ordre de mission", to: "/List-ordre-mission" },
                { label: "Liste Bon de mission", to: "/List-bon-mission" },
              ]}
            />
            <SidebarSection
              sectionTitle="IMPRESSION"
              title="Bon de caisse"
              icon={<FaPrint size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Fiche convertie", to: "/List-Convertit" },
                
              ]}
            />
            <SidebarSection
              
              title="Bon de mission"
              icon={<FaPrint size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Bon convertie", to: "/List-bon-convertit" },
                
              ]}
            />
          </>
        );

      case "MANAGER1":
        return (
          <>
            <SidebarSection
              sectionTitle=""
              title="Fiche de besoin"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Liste", to: "/Home-FDB" },
                { label: "Besoin validé", to: "/List-Validée2" },
                { label: "Bonsoin approuvé", to: "/List-Approuvée1" },
              ]}
            />
            <SidebarSection
              sectionTitle=""
              title="Bon de mission"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Liste", to: "/Home-bon-mission" }]}
            />
            <SidebarSection
              sectionTitle="ENCAISSEMENT"
              title="Approvisionnement"
              icon={<FaHandHoldingUsd size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer un bon", to: "/Add-Bon-Appro" },
                { label: "Liste des bons", to: "/List-Bon-Appro" },
              ]}
            />
            <SidebarSection
              sectionTitle="DECAISSEMENT"
              title="Dépenses"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Fiche approuvée", to: "/List-Approuvée1" },
                { label: "Fiche décaissée", to: "/List-Convertit_M" },
              ]}
            />
            <SidebarSection
              sectionTitle="JOURNAL DE CAISSE"
              title="Etat de caisse"
              icon={<BiSolidFile size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Consulter", to: "/Home-journal-Caisse" }]}
            />
            <SidebarSection
              sectionTitle="ARRETE DE CAISSE"
              title="Liste billetage"
              icon={<BiSolidFile size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Consulter", to: "/List-billetage" }]}
            />
            <SidebarSection
              sectionTitle="FERMETURE"
              title="Fermer la caisse"
              icon={<FaLock size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Fermer", to: "/Close-caisse" }]}
            />
          </>
        );

      case "MANAGER":
        return (
          <>
            <SidebarSection
              sectionTitle="CREER UNE FICHE DE BESOIN"
              title="FIche de besoin"
              icon={<FaFileAlt size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-FDB" },
                { label: "Liste", to: "/List-FDB" },
              ]}
            />
            <SidebarSection
              sectionTitle="ENCAISSEMENT"
              title="Approvisionnement"
              icon={<FaHandHoldingUsd size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer un bon", to: "/Add-Bon-Appro" },
                { label: "Liste des bons", to: "/List-Bon-Appro" },
              ]}
            />

            {/* Grand titre pour regrouper les deux sections
            {!isCollapsed && (
              <div className="sidebar-group-title">
                <span>DECAISSEMENT</span>
              </div>
            )}  */}

            <SidebarSection
              sectionTitle="DECAISSEMENT"
              title="Dépenses"
              icon={<IoWallet size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Besoin approuvé", to: "/List-Approuvée" },
                { label: "Bon de caisse", to: "/List-bon-caisse" },
                { label: "Bon de mission", to: "/List-bonmission-attente" },
              ]}
            />
            <SidebarSection
              title="Retour de fond"
              icon={<IoWallet size={18} />} // Icône pour "Retour de fond"
              isCollapsed={isCollapsed}
              items={[
                { label: "Ajouter", to: "/Add-retour-fonds" },
                { label: "Liste", to: "/List-retour-fonds" },
              ]}
            />
            <SidebarSection
              sectionTitle="JOURNAL DE CAISSE"
              title="Etat de caisse"
              icon={<BiSolidFile size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Consulter", to: "/Journal-Caisse" }]}
            />
            <SidebarSection
              sectionTitle="ARRETE DE CAISSE"
              title="Liste de billetage"
              icon={<BiSolidFile size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Consulter", to: "/list-billetage" }]}
            />
            <SidebarSection
              sectionTitle="FERMETURE"
              title="Fermer la caisse"
              icon={<FaLock size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Fermer", to: "/Close-caisse" }]}
            />
          </>
        );

      case "ADMIN":
        return (
          <>
            <SidebarSection
              sectionTitle="GESTION SOCIETE"
              title="Gestion société"
              icon={<FaBuilding size={18} />}
              isCollapsed={isCollapsed}
              items={[{ label: "Voir", to: "/Societe" }]}
            />
            <SidebarSection
              sectionTitle="GESTION CAISSE"
              title="Gestion caisse"
              icon={<FaMoneyBill size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-Caisse" },
                { label: "Liste", to: "/List-Caisse" },
              ]}
            />
            <SidebarSection
              sectionTitle="GESTION UTILISATEUR"
              title="Gestion utilisateur"
              icon={<FaUsers size={18} />}
              isCollapsed={isCollapsed}
              items={[
                { label: "Créer", to: "/Add-User" },
                { label: "Liste", to: "/List-User" },
              ]}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className={`app-aside app-aside-expand-md app-aside-light ${
        isCollapsed ? "collapsed" : ""
      }`}
      style={{ marginLeft: 0 }}
    >
      <div className="aside-content">
        <div className="aside-menu overflow-hidden">
          <nav id="stacked-menu" className="stacked-menu">
            <Nav className="menu">
              <Accordion>
                <ul className="nav flex-column p-3">
                  {/* Dashboard Link */}
                  <li className="nav-item mb-3">
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id="tooltip-accueil">Tableau de bord</Tooltip>
                      }
                      container={document.body}
                    >
                      <Link
                        to="/Dashboard"
                        className={`nav-link d-flex align-items-center ${
                          isCollapsed ? "justify-content-center" : ""
                        }`}
                        title="Tableau de bord"
                      >
                        <FaHome size={24} />
                        {!isCollapsed && (
                          <span className="ms-3"> Tableau de bord</span>
                        )}
                      </Link>
                    </OverlayTrigger>
                  </li>

                  {/* Role-specific sections */}
                  {renderSections()}
                </ul>
              </Accordion>
            </Nav>
          </nav>
        </div>

        {/* Footer - Night Mode Toggle */}
        <footer className="aside-footer border-top p-2">
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="tooltip-mode-nuit">Mode nuit</Tooltip>}
            container={document.body}
          >
            <button
              className="btn btn-light btn-block"
              style={{ color: "#232754" }}
              title="Mode nuit"
              onClick={() => setDarkMode(!darkMode)}
            >
              {!isCollapsed && (
                <span className="d-compact-menu-none">Night mode </span>
              )}
              <FaMoon size={18} />
            </button>
          </OverlayTrigger>
        </footer>
      </div>
    </aside>
  );
};

// Reusable SidebarSection component
const SidebarSection: React.FC<{
  sectionTitle?: string; // Titre de section facultatif
  title: string;
  icon: JSX.Element;
  isCollapsed: boolean;
  items: { label: string; to: string }[];
}> = ({ sectionTitle, title, icon, isCollapsed, items }) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="sidebar-section">
      {/* Section Title (affiché uniquement si sectionTitle est défini) */}
      {!isCollapsed && sectionTitle && (
        <span className="sidebar-section-title">{sectionTitle}</span>
      )}

      {/* Dropdown pour la section */}
      <li className="nav-item mb-3">
        <OverlayTrigger
          trigger="hover"
          placement="right"
          overlay={
            isCollapsed ? (
              <Popover id={`popover-${title.toLowerCase()}`}>
                <Popover.Body>
                  <div
                    className="d-flex flex-column"
                    onMouseEnter={() => setShowPopover(true)}
                    onMouseLeave={() => setShowPopover(false)}
                  >
                    {items.map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="sidebar-popover-link"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </Popover.Body>
              </Popover>
            ) : (
              <Tooltip id={`tooltip-${title.toLowerCase()}`}>{title}</Tooltip>
            )
          }
          show={isCollapsed ? showPopover : undefined}
          onToggle={(nextShow) => setShowPopover(nextShow)}
        >
          <div>
            <Dropdown className="w-100" show={!isCollapsed ? undefined : false}>
              <Dropdown.Toggle
                variant="link"
                className={`nav-link d-flex align-items-center w-100 ${
                  isCollapsed ? "justify-content-center" : ""
                }`}
                id={`dropdown-${title.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  color: "#232754",
                  cursor: "pointer",
                  border: "none",
                }}
                title={title}
              >
                {icon}
                {!isCollapsed && (
                  <span className="ms-3 sidebar-section-label">{title}</span>
                )}
              </Dropdown.Toggle>
              {!isCollapsed && (
                <Dropdown.Menu className="w-100 align-items-left">
                  {items.map((item, index) => (
                    <Dropdown.Item
                      key={index}
                      as={Link}
                      to={item.to}
                      className="sidebar-section-label"
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            </Dropdown>
          </div>
        </OverlayTrigger>
      </li>
    </div>
  );
};

export default Sidebar;
