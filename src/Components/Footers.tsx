import React from "react";

const Footer: React.FC = () => {
  return (

    <footer className="app-footer">
            <ul className="list-inline">

                <li className="list-inline-item">
                    <a className="text-muted" href="#">Support</a>
                </li>
                <li className="list-inline-item">
                    <a className="text-muted" href="#">Help Center</a>
                </li>
                <li className="list-inline-item">
                    <a className="text-muted" href="#">Privacy</a>
                </li>
                <li className="list-inline-item">
                    <a className="text-muted" href="#">Terms of Service</a>
                </li>
            </ul>
            <div className="copyright"> Copyright © 2025. All right reserved.</div>
        </footer>
  );
};

export default Footer;
