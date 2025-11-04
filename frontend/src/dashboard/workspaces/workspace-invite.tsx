import { Button } from "../../components/button";
import { Loader } from "../../components/loader";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/Card";
import { WorkspaceAvatar } from "../../components/workspace/workspace-avatar";
import {
    useAcceptGenerateInviteMutation,
    useAcceptInviteByTokenMutation,
    useGetWorkspaceDetailsQuery,
} from "../../hooks/use-workspace";
import type { Workspace } from "../../types";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const WorkspaceInvite = () => {
    const { workspaceId } = useParams();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("tk");

    const navigate = useNavigate();

    if (!workspaceId) {
        return <div>Espace de travail introuvable</div>;
    }

    const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(
        workspaceId!
    ) as { data: Workspace; isLoading: boolean };

    const {
        mutate: acceptInviteByToken,
        isPending: isAcceptInviteByTokenPending,
    } = useAcceptInviteByTokenMutation();

    const {
        mutate: acceptGenerateInvite,
        isPending: isAcceptGenerateInvitePending,
    } = useAcceptGenerateInviteMutation();

    const handleAcceptInvite = () => {
        if (!workspaceId) return;

        if (token) {
            acceptInviteByToken(token, {
                onSuccess: () => {
                    toast.success("Invitation acceptée");
                    navigate(`/dashboard/workspaces/${workspaceId}`);
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                    console.log(error);
                },
            });
        } else {
            acceptGenerateInvite(workspaceId, {
                onSuccess: () => {
                    toast.success("Invitation acceptée");
                    navigate(`/dashboard/workspaces/${workspaceId}`);
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                    console.log(error);
                },
            });
        }
    };

    const handleDeclineInvite = () => {
        toast.info("Invitation déclinée");
        navigate("/dashboard/workspaces");
    };

    if (isLoading) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Invitation invalide</CardTitle>
                        <CardDescription>
                            Cette invitation à l'espace de travail est invalide ou a expiré.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate("/dashboard/workspaces")} className="w-full">
                            Aller aux espaces de travail
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <WorkspaceAvatar name={workspace.name} color={workspace.color} />
                        <CardTitle>{workspace.name}</CardTitle>
                    </div>
                    <CardDescription>
                        Vous avez été invité à rejoindre l'espace de travail "<strong>{workspace.name}</strong>".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {workspace.description && (
                        <p className="text-sm text-muted-foreground">
                            {workspace.description}
                        </p>
                    )}
                    <div className="flex gap-3">
                        <Button
                            variant="default"
                            className="flex-1"
                            onClick={handleAcceptInvite}
                            disabled={
                                isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
                            }
                        >
                            {isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
                                ? "En cours de rejoindre..."
                                : "Accepter l'invitation"}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleDeclineInvite}
                            disabled={
                                isAcceptInviteByTokenPending || isAcceptGenerateInvitePending
                            }
                        >
                            Décliner
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkspaceInvite;
