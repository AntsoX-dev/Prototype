export interface Utilisateur {
    _id: string;
    email: string;
    name: string;
    created: Date; 
}

export interface AuthContextType {
    utilisateur: Utilisateur | null;
    setUtilisateur: (utilisateur: Utilisateur | null) => void;
}