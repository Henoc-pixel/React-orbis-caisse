

// Définition de l'interface pour les détails d'un besoin
export interface Detail {
  objet: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

// Définition de l'interface pour un besoin
export interface Besoin {
  id: number;
  date: string;
  reference:string
  emetteur: string;
  destinataire: string;
  beneficiaire: string;
  nature_operation: string;
  type_operation: string;
  username_besoin: string;
  details: Detail[];
  statut: string;
}

// Définition de l'interface pour un besoin pour le formulaire d'ajout
export interface BesoinFormData {
  date: string;
  reference:string
  emetteur: string;
  destinataire: string;
  beneficiaire: string;
  nature_operation: string;
  type_operation: string;
  username_besoin: string;
  details: Detail[];
  statut: string;
}

// Définition de l'interface pour les détails d'un besoin pour le formulaire d'ajout
export interface BesoinDetails {
  objet: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

// Définition de l'interface pour un besoin pour le formulaire d'ajout


// Définition de l'interface pour le profil  de l'utilisateur
export interface User {
  id: number;
  username: string;
  nom: string;
  prenoms: string;
  telephone: string;
  service: string;
  email: string;
  password: string;
  fonction: string;
  role: string;
}

export interface Caisse {
  id: number;
  code: string;
  intitulé: string;
  username_caissier: string;
  solde: string;
  plafond: string;
  statut: string;
  date_ouverture: string;
}
export interface Bon_Approvisionnement {
  id: number;
  date: string;
  reference: string;
  beneficiaire: string;
  objet:string;
  source_approvisionnement:string;
  reference_source:string;
  montant: string;
  statut:string;
}
export interface Reçu_Caisse {
  id: string;
  date_bon: string;
  reference_bon: string;
  beneficiaire: string;
  objet_bon: string;
  montant: string;
  date_reçu: string;
  reference_reçu: string;
  caisse_approvisionné:string
}
export interface Bon_Caisse{
  id: string;
  date_besoin:string;
  reference_besoin:string;
  nature_operation_besoin:string;
  type_operation_besoin:string;   
  montant_besoin:string;
  date_bon_caisse:string;
  reference_bon_caisse:string;
  beneficiaire:string;
  caisse_décaissé:string;
  statut:string;
}

export interface Journée{
  id:string;
  date_ouverture:string;
  date_fermeture:string
  active: "oui" | "non";
  debit:string;
  credit:string;
  solde:string;
  caissier_username:string;
  last_solde:string;
  caisse_intitulé:string;    
}

export interface Billetage {
  id: string;
  date: string;
  reference: string;
  caisse_intitilé: string;
  caissier_username: string;
  solde_theorique: number;
  solde_reel: number;
  ecart: number;
  statut: string;
  b10000: number;
  b5000: number;
  b2000: number;
  b1000: number;
  b500: number;
  p500: number;
  p250: number;
  p200: number;
  p100: number;
  p50: number;
  p25: number;
  p10: number;
  p5: number;
}

// Définition de l'interface pour une mission pour le formulaire d'ajout
export interface Mission {
  id: number;
  date: string;
  numero_ordre: string;
  gerant: string;
  username: string; 
  username_ordre: string; 
  destinatoin: string;
  type_operation: string;
  nature_operation: string;
  objet_mission: string;
  date_depart: string;
  date_retour: string;
  agents: AgentsMission[];
  statut: string;
}

// Définition de l'interface pour des agents d'une mission pour le formulaire d'ajout
export interface AgentsMission {
  numero: number;
  nom_prenoms: string;
  fonction: string;
  service: string;
}

// Définition de l'interface pour un bon de mission pour le formulaire d'ajout
export interface bon_Mission {
  id: string;
  date_ordre: string;
  numero_ordre: string;
  username_ordre: string;
  destinatoin_ordre: string;
  objet_ordre_mission: string;
  date_depart_ordre: string;
  date_retour_ordre: string;
  date_bon: string;
  numero_bon: string;
  username_bon: string;
  beneficiaire_bon: string;
  Ville: string;
  statut: string;
  frais_mission: DetailFrais[];
  Total_frais_mission: number;
  caisse_décaissé?: string; // Nouveau champ optionnel
}

// Définition de l'interface pour les frais de mission  pour le formulaire d'ajout
export interface DetailFrais {
  rubrique:string;
  quantité:number;
  prix_unitaire:number;
  montant:number;
  
}

// Définition de l'interface pour les retour de fonds  pour le formulaire d'ajout
export interface Retour_Fonds {
  id: string;
  date_retour: string;
  reference_retour:string;
  type_depense:string;
  reference_depense:string;
  username_retour: string;
  montant_sortie:number;
  montant_retourné:number;
  statut:string;
}
// Définition de l'interface pour le journal de caisse
export interface Journal_Caisse {
  id: string;
  date: string;
  numero_pièce: string;
  nature_opération: string;
  libellé: string;
  entrée: number;
  sortie: number;
  solde: number;
  username_caissier: string;
  caisse_intitulé: string;
}

// Définition de l'interface pour les sociétés
export interface Societe {
  id: string;
  date: string;
  raison_sociale: string;
  forme_juridique: string;
  activite: string;
  siege_sociale: string;
  adresse_postale: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  code_commercial: string;
  numero_compte_contribuable: string;
  regime_fiscale: string;
  numero_tele_declarant: string;
}

// Ajoutez cette interface à la fin de types.ts
export interface Notification {
  id: string;
  userId: string; // ID de l'utilisateur concerné
  roleTarget: string; // Role cible de la notification
  message: string;
  link: string;
  date: string;
  read: boolean;
  reference?: string; // Référence du besoin si applicable
}