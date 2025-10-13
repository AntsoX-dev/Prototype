export interface Utilisateur {
    _id: string;
    email: string;
    name: string;
    created: Date; 
    isEmailVerified: boolean;
    updated: Date;
    profilePictureUrl?: string;
}

export interface AuthContextType {
    utilisateur: Utilisateur | null;
    setUtilisateur: (utilisateur: Utilisateur | null) => void;
}

export interface Workspace {
    _id: string;
    name: string;
    description?: string;
    owner: Utilisateur | string;
    color: string;
    members : {
        user: Utilisateur;
        role: 'admin' | 'member' |'owner' |'viewer';
        joinedAt: Date;
    }[];
    created: Date;
    updated: Date;
}