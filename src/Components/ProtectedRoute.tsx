import React from 'react'; 
// Importation de la bibliothèque React pour créer des composants.

import { Navigate } from 'react-router-dom'; 
// Importation du composant `Navigate` de React Router pour effectuer une redirection.

interface ProtectedRouteProps {
  children: React.JSX.Element;
}
// Déclaration de l'interface TypeScript pour définir les props attendues par le composant `ProtectedRoute`.
// Le composant doit recevoir un élément enfant de type `JSX.Element`.

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Déclaration d'un composant fonctionnel `ProtectedRoute` qui accepte des props conformes à `ProtectedRouteProps`.

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  // Récupération de la valeur `isAuthenticated` stockée dans le localStorage. 
  // Cette valeur est supposée indiquer si l'utilisateur est authentifié.

  return isAuthenticated ? children : <Navigate to="/" replace />;
  // Si l'utilisateur est authentifié (`isAuthenticated` n'est pas null ou falsy), on affiche l'enfant fourni.
  // Sinon, on redirige vers la page d'accueil (`"/"`) en utilisant `Navigate` avec l'option `replace`
  // pour éviter que la redirection soit enregistrée dans l'historique de navigation.


};

export default ProtectedRoute;
// Exportation du composant `ProtectedRoute` pour pouvoir l'utiliser dans d'autres parties de l'application.
