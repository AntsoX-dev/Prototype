import { WorkspaceAvatar } from "../../components/workspace/workspace-avatar";
import type { Utilisateur, Workspace } from "../../types"

interface WorkspaceHeaderProps{
    workspace: Workspace,
    members: {
        _id: string;
        user: Utilisateur;
        role: "admin" | "member" | "owner" | "viewer";
        joinedAt: Date;
    }[];
    onCreateProject: () => void;
    onInviteMember: () => void;
}


export const WorkspaceHeader = ({
    workspace,
    members,
    onCreateProject,
    onInviteMember,
}: WorkspaceHeaderProps) => {
    return <div className="space-y-8">
        <div className="space-y-3">
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex md:items-center gap-3">
                    {
                        workspace.color && <WorkspaceAvatar color={workspace.color} name={workspace.name}/>
                    }
                </div>

            </div>

        </div>
    </div>
}