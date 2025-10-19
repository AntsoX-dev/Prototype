import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetWorkspacesQuery } from "../../hooks/use-workspace";
import { Loader } from "../../components/ui/loader";
import type { Workspace } from "../../types";
import { CreateWorkspace } from "../../components/workspace/create-workspace";
import { Button } from "../../components/button";
import { PlusCircle, Users } from "lucide-react";
import { NoDataFound } from "../../components/no-data-found";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { WorkspaceAvatar } from "../../components/workspace/workspace-avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Workspaces = () => {
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
        data: Workspace[];
        isLoading: boolean;
    };
    
console.log("workspaces:", workspaces); 


    if(isLoading) {
        return <Loader/>;
    }

    return (
    <>
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold">Espace de travail</h2>


            <Button onClick={() => setIsCreatingWorkspace(true)}>
                <PlusCircle className="size-4 mr-2"/>
                Nouvel Espace
            </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {
                workspaces.map((ws) => (
                    <WorkspaceCard key={ws._id} workspace={ws} />
                ))
            }

            {
                workspaces.length === 0 && <NoDataFound
                    title="Aucun espace de travail trouvé"
                    description="Créez un nouvel espace de travail pour commencer à organiser vos projets et tâches."
                    buttonText="Créer un espace de travail"
                    buttonAction={() => setIsCreatingWorkspace(true)}
                />
            }
        </div>
    </div>


    <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
    </>
    );
};


const WorkspaceCard = ({workspace}: {workspace: Workspace}) => {
    return (
       <Link to={`${workspace._id}`}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <WorkspaceAvatar name={workspace.name}color={workspace.color} />
                            <div>
                                <CardTitle>{workspace.name}</CardTitle>
                                <span className="text-xs text-muted-foreground"> 
                                    Crée le {format(workspace.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <Users className="size-4 mr-1"/>
                            <span className="text-xs">
                                {workspace.members.length}
                            </span>
                        </div>
                    </div>

                    <CardDescription>
                        {workspace.description || "Aucune description fournie."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        Voir les details de l’espace et les projets
                    </div>
                </CardContent>
            </Card>
       </Link>
    );
}

export default Workspaces;

