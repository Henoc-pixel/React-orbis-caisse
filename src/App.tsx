import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/assets/css/theme.css";
import "@/assets/css/custom.css";
import "react-toastify/dist/ReactToastify.css";
import "@/assets/css/LireBesoin.css";
import "@/assets/css/modeblack.css";
import "@/assets/css/sibebar.css";
import { Route, Routes } from "react-router-dom"; //
import Layout from "@/Components/Layout";
import ProtectedRoute from "@/Components/ProtectedRoute";
import Home from "@/Pages/page_user/Home";
import AddBesoinForm from "@/Pages/page_user/FormAjout";
import Besoin from "@/Pages/page_user/Lire";
import UserEditForm from "@/Pages/page_user/Profil";
import Connexion from "@/Components/connexion";
import Inscription from "@/Components/Inscription";
import ModifBesoin from "./Pages/page_user/FormModif";
import { ThemeProvider } from "@/Components/ThemeProvider";
import Dashboard from "./Pages/page_admin/Dashbord";
import UserAddForm from "./Pages/page_admin/Ajoutusers";
import Listuser from "./Pages/page_admin/Listusers";
import Readuser from "./Pages/page_admin/Modifusers";
import Homeattente from "./Pages/page_responsable/Besoinattente";
import Homevalidéeresponsable from "./Pages/page_responsable/Besoinvalide";
import Validéebesoin from "./Pages/page_responsable/Validée_besoin";
import Homebesoin from "./Pages/page_manager1.tsx/Homebesoin";
import Home_validée_manager1 from "./Pages/page_manager1.tsx/Besoinvalidée";
import Approuvéebesoin from "./Pages/page_manager1.tsx/Approuvéebesoin";
import ModifBesoinvalidé from "./Pages/page_manager1.tsx/Modifbesoinvalidé";
//import Home_approuvée_manager1 from "./page_Manager1.tsx/Besoin_approuvée";
import Homeapprouvéemanager from "./Pages/page_manager.tsx/Besoinapprouvée";
import Convertirbesoin from "./Pages/page_manager.tsx/Convertirbesoin";
import AddCaisseForm from "./Pages/page_admin/Ajoutcaisse";
import Listcaisse from "./Pages/page_admin/Listcaisse";
import ModifCaisse from "./Pages/page_admin/Modifcaisse";
import BonappprovisionnementAddForm from "./Pages/page_manager.tsx/Ajoutbonapprovisionnement";
import ListBonApprovisionnement from "./Pages/page_manager.tsx/Listbonapprovisionnement";
import ModifBonApprovisionnement from "./Pages/page_manager.tsx/Modifbonapprovisionnement";
import Reçucaisse from "./Pages/page_manager.tsx/Lirereçucaisse";
import Ajoutreçucaisse from "./Pages/page_manager.tsx/Ajoutreçucaisse";
import Ajoutboncaisse from "./Pages/page_manager.tsx/Ajoutboncaisse";
import ListBoncaisse from "./Pages/page_manager.tsx/Listboncaisse";
import Boncaisse from "./Pages/page_manager.tsx/Lireboncaisse";
import Homeconvertit from "./Pages/page_impression/Listbesoinconvertit";
import BesoinConvertit from "./Pages/page_impression/Lirebesoinconvertit";
import PrintBesoinConvertit from "./Pages/page_impression/Printbesoinconvertit";
import BesoinConvertitManager1 from "./Pages/page_manager1.tsx/LirebesoinconvertitManager1";
import Homeconvertitmanager1 from "./Pages/page_manager1.tsx/Listbesoinconvertitmanager1";
import ListBesoinApprouver from "./Pages/page_manager1.tsx/Listbesoinapprouvée";
import Fermerjournée from "./Pages/page_manager.tsx/Fermercaisse";
import Ajoutbilletage from "./Pages/page_manager.tsx/Ajoutbilletage";
import ListBilletage from "./Pages/page_manager.tsx/Listbilletage";
import ReadBilletage from "./Pages/page_manager.tsx/Lirebilletage";
import AjoutOrdreMission from "./Pages/page_responsable/Ajouordremission";
import ListOrdreMission from "./Pages/page_responsable/Listordremission";
import LireOrdreMission from "./Pages/page_responsable/Lireordremission";
import ModifOrdreMission from "./Pages/page_responsable/Modif_ordre_mission";
import AjoutBonMission from "./Pages/page_responsable/Ajoubonmission";
import ListBonMission from "./Pages/page_responsable/Listbonmission";
import LireBonMission from "./Pages/page_responsable/Lirebonmission";
import ModifBonMission from "./Pages/page_responsable/Modif_bon_mission";
import HomeBonMission from "./Pages/page_manager1.tsx/Homebonmission";
import ListBonMissionattente from "./Pages/page_manager.tsx/Listbonapprouver";
import Convertirmission from "./Pages/page_manager.tsx/Convertirbonmission";
import Listbonconvertit from "./Pages/page_impression/Listbonconvertit";
import Lirebonconvertit from "./Pages/page_impression/Lirebonconvertit";
import AjoutRetourFond from "./Pages/page_manager.tsx/Ajoutretourfonds";
import Listretourfonds from "./Pages/page_manager.tsx/Listretourfonds";
import LireRetourFonds from "./Pages/page_manager.tsx/Lireretourfonds";
import ModifBilletage from "./Pages/page_manager.tsx/Modifbilletage";
import Journalcaisse from "./Pages/page_manager.tsx/Journalcaisse";
import Homejournalcaisse from "./Pages/page_manager1.tsx/Homejournalcaisse";
import Homesociete from "./Pages/page_admin/listsociete";
import Readsociete from "./Pages/page_admin/Modifsociete";

function App() {
  return (
    <Routes>
      {/* Route publique pour la connexion */}
      <Route path="/" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />

      {/* Routes protégées sous Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ThemeProvider>
              <Layout />
            </ThemeProvider>
          </ProtectedRoute>
        }
      >
        <Route path="List-FDB" element={<Home />} />
        <Route path="Dashboard" element={<Dashboard />} />
        <Route path="Add-FDB" element={<AddBesoinForm />} />
        <Route path="Read-FDB/:id" element={<Besoin />} />
        <Route path="Edit-FDB/:id" element={<ModifBesoin />} />
        <Route path="User" element={<UserEditForm />} />
        <Route path="Add-User" element={<UserAddForm />} />
        <Route path="List-User" element={<Listuser />} />
        <Route path="Edit-User/:id" element={<Readuser />} />
        <Route path="Edit-Societe/:id" element={<Readsociete />} />
        <Route path="List-Attente" element={<Homeattente />} />
        <Route path="List-Validée1" element={<Homevalidéeresponsable />} />
        <Route path="Validée-besoin/:id" element={<Validéebesoin />} />
        <Route path="Home-FDB" element={<Homebesoin />} />
        <Route path="Societe" element={<Homesociete />} />
        <Route path="List-Validée2" element={<Home_validée_manager1 />} />
        <Route path="Approuvée-besoin/:id" element={<Approuvéebesoin />} />
        <Route path="Edit-besoin-validé/:id" element={<ModifBesoinvalidé />} />
        <Route path="List-Approuvée1" element={<ListBesoinApprouver />} />
        <Route path="List-Approuvée" element={<Homeapprouvéemanager />} />
        <Route path="Convertir-besoin/:id" element={<Convertirbesoin />} />
        <Route path="Add-Caisse" element={<AddCaisseForm />} />
        <Route path="List-Caisse" element={<Listcaisse />} />
        <Route path="Edit-Caisse/:id" element={<ModifCaisse />} />
        <Route
          path="Add-Bon-Appro"
          element={<BonappprovisionnementAddForm />}
        />
        <Route path="List-Bon-Appro" element={<ListBonApprovisionnement />} />
        <Route
          path="Edit-Bon-Appro/:id"
          element={<ModifBonApprovisionnement />}
        />
        <Route path="Read-reçu-caisse/:id" element={<Reçucaisse />} />
        <Route path="Add-reçu-caisse/:id" element={<Ajoutreçucaisse />} />
        <Route path="Add-bon-caisse/:id" element={<Ajoutboncaisse />} />
        <Route path="List-bon-caisse" element={<ListBoncaisse />} />
        <Route path="Read-bon-caisse/:id" element={<Boncaisse />} />
        <Route path="List-Convertit" element={<Homeconvertit />} />
        <Route path="Read-besoin-convertit/:id" element={<BesoinConvertit />} />
        <Route
          path="Print-besoin-convertit/:id"
          element={<PrintBesoinConvertit />}
        />
        <Route
          path="Read-besoin-convertit-M/:id"
          element={<BesoinConvertitManager1 />}
        />
        <Route path="List-Convertit_M" element={<Homeconvertitmanager1 />} />
        <Route path="Close-caisse" element={<Fermerjournée />} />
        <Route path="Add-billetage" element={<Ajoutbilletage />} />
        <Route path="List-billetage" element={<ListBilletage />} />
        <Route path="Read-billetage/:id" element={<ReadBilletage />} />
        <Route path="Add-ordre-mission" element={<AjoutOrdreMission />} />
        <Route path="List-ordre-mission" element={<ListOrdreMission />} />
        <Route path="Read-ordre-mission/:id" element={<LireOrdreMission />} />
        <Route path="Edit-ordre-mission/:id" element={<ModifOrdreMission />} />
        <Route path="Add-bon-mission/:id" element={<AjoutBonMission />} />
        <Route path="List-bon-mission" element={<ListBonMission />} />
        <Route path="Read-bon-mission/:id" element={<LireBonMission />} />
        <Route path="Edit-bon-mission/:id" element={<ModifBonMission />} />
        <Route path="Home-bon-mission" element={<HomeBonMission />} />
        <Route
          path="List-bonmission-attente"
          element={<ListBonMissionattente />}
        />
        <Route path="Convertir-mission/:id" element={<Convertirmission />} />
        <Route path="List-bon-convertit" element={<Listbonconvertit />} />
        <Route path="Read-bon-convertit/:id" element={<Lirebonconvertit />} />
        <Route path="Add-retour-fonds" element={<AjoutRetourFond />} />
        <Route path="List-retour-fonds" element={<Listretourfonds />} />
        <Route path="Read-retour-fonds/:id" element={<LireRetourFonds />} />
        <Route path="Edit-billetage/:id" element={<ModifBilletage />} />
        <Route path="Journal-Caisse" element={<Journalcaisse />} />
        <Route path="Home-journal-Caisse" element={<Homejournalcaisse />} />
      </Route>
    </Routes>
  );
}

export default App;
