import { createContext } from "react";

// Définition du type du contexte
interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

// Création du contexte avec une valeur par défaut undefined
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
