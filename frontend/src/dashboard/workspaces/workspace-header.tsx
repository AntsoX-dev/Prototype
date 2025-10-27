import { Plus, UserPlus } from "lucide-react";
import { Button } from "../../components/button";
import { WorkspaceAvatar } from "../../components/workspace/workspace-avatar";
import type { Utilisateur, Workspace } from "../../types"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

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

                    <h2 className="text-xl md:text-2xl font-semibold">{workspace.name}</h2>
                </div>

                <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0">
                    <Button variant={"outline"} onClick={onInviteMember}>
                        <UserPlus className="size-4 mr-2"/>
                        Inviter
                    </Button>
                    <Button onClick={onCreateProject}>
                        <Plus className="size-4 mr-2"/>
                        Nouveau projet
                    </Button>
                </div>
            </div>

            {
                workspace.description &&  (<p className="text-sm md:text-base text-muted-foreground">{workspace.description}</p>
            )}
        </div>

        {
            members.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Membres :</span>
                    <div className="flex space-x-2">
                        {
                            members.map((members) =>(
                                <Avatar key={members._id} className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden" title={members.user.name}>
                                    <AvatarImage src={members.user.profilePictureUrl} alt={members.user.name}/>
                                    <AvatarFallback>
                                        {members.user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            ))
                        }
                        
                    </div>
                </div>
            )
        }
    </div>
}