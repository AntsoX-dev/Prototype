import { useParams } from "react-router-dom"
import { useState } from "react";
import { useGetWorkspaceQuery } from "../../hooks/use-workspace";
import type { Project, Workspace } from "../../types";
import { Loader } from "../../components/ui/loader";
import { WorkspaceHeader } from "./workspace-header";

const WorkspaceDetails = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [isCreateProject, setIsCreateProject] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);

    if (!workspaceId) {
        return <div>Aucun espace de travail trouvé</div>
    }

    const { data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
        data: {
            workspace: Workspace;
            projects: Project[];
        };
        isLoading: boolean;
    };
    
    if(isLoading){
        return (
        <div>
            <Loader/>
        </div>
        )
    }
  return (
    <div className="space-y-8">
        <WorkspaceHeader
        
        workspace={data.workspace}
        members={data?.workspace?.members as any}
        onCreateProject={()=> setIsCreateProject(true)}
        onInviteMember={()=> setIsInviteMember(true)}
        
        />
    </div>
  )
}

export default WorkspaceDetails