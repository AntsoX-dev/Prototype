import type { Workspace } from "../../types";
import { useAuth } from "../../fournisseur/auth-context";
import { Button } from "../button";
import { Bell, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Link, useLoaderData } from "react-router-dom";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";


interface HeaderProps {
    onWorkspaceSelected: (workspace: Workspace) => void;
    selectedWorkspace: Workspace | null;
    onCreateWorkspace: () => void;
}

export const Header = ({
    onWorkspaceSelected,
    selectedWorkspace,
    onCreateWorkspace
}: HeaderProps) => {
    const {utilisateur, logout} = useAuth();
    const workspaces = []
    //const {workspaces} = useLoaderData() as {workspaces: Workspace[]};

    
    return (
    <div className="bg-background sticky top-0 z-40 border-b">
        <div className=" flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"outline"}>
                        {selectedWorkspace ? ( <>
                            {selectedWorkspace.color && <WorkspaceAvatar color={selectedWorkspace.color} name=
                            {selectedWorkspace.name}/>
                            }
                            <span className="font-medium">{selectedWorkspace?.name}</span>
                        </>
                        ) : ( 
                        <span className="font-medium">Choisir l'Espace de Travail</span>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuLabel>Espace de Travail</DropdownMenuLabel>
                    <DropdownMenuSeparator/>

                    <DropdownMenuGroup>
                        {
                            workspaces.map((ws) => (

                                <DropdownMenuItem key={ws._id} onClick={() => onWorkspaceSelected(ws)}>
                                    {ws.color && (<WorkspaceAvatar color={ws.color} name={ws.name}/>
                                    )}
                                    <span className="ml-2">{ws.name}</span>
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuGroup>

                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={onCreateWorkspace}>
                            <PlusCircle className="h-4 w-4 mr-2 "/>
                            Créer un espace
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Bell/>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full border p-1 w-8 h-8">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={utilisateur?.profilePictureUrl}/>
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {utilisateur?.name ?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <Link to="/utilisateur/profile">Profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                         <DropdownMenuItem onClick={logout}> Se déconnecter</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </div>
    )
}
