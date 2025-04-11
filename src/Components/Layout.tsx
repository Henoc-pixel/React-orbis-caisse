import * as React from "react";
import Sidebar from "@/Components/Sidebar";
import Navigation from "@/Components/Navigation";
import Footers from "@/Components/Footers";
import { Outlet } from "react-router-dom";
const Layout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="app">
      <Navigation onToggleSidebar={handleToggleSidebar} />
      <Sidebar isCollapsed={isCollapsed} />
      <main className={`app-main ${isCollapsed ? "collapsed" : ""}`}>
        <div className="wrapper">
          <div className="page">
            {/* Les pages enfants (home, page1, page2) seront affichées ici */}
            <div className="page-inner">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footers />
    </div>
  );
};

export default Layout;
