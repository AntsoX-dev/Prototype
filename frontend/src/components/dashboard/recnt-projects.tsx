import type { Project } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { getProjectProgress, getTaskStatusColor } from "../../libs";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "../../libs/utils";
import { Progress } from "../ui/progress";
import { Button } from "../../components/button";
import { useNavigate } from "react-router-dom";

export const RecentProjects = ({ data }: { data: Project[] }) => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId");
    const navigate = useNavigate();

    const handleViewAllProjects = () => {
        if (workspaceId) {
            navigate(`/dashboard/workspaces/${workspaceId}`);
        }
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Projets récents</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {data.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucun projet récent pour le moment
                    </p>
                ) : (
                    data.map((project) => {
                        const projectProgress = getProjectProgress(project.tasks);

                        // Traduction du statut
                        const getStatusLabel = (status: string) => {
                            switch (status) {
                                case "Planning":
                                    return "En planification";
                                case "In Progress":
                                    return "En cours";
                                case "On Hold":
                                    return "En attente";
                                case "Completed":
                                    return "Terminé";
                                case "Cancelled":
                                    return "Annulé";
                                default:
                                    return status;
                            }
                        };

                        return (
                            <div key={project._id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Link
                                        to={`/dashboard/workspaces/${workspaceId}/projects/${project._id}`}
                                    >
                                        <h3 className="font-medium hover:text-primary transition-colors">
                                            {project.title}
                                        </h3>
                                    </Link>

                                    <span
                                        className={cn(
                                            "px-2 py-1 text-xs rounded-full",
                                            getTaskStatusColor(project.status)
                                        )}
                                    >
                                        {getStatusLabel(project.status)}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                    {project.description || "Aucune description disponible."}
                                </p>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Progression</span>
                                        <span>{projectProgress}%</span>
                                    </div>

                                    <Progress value={projectProgress} className="h-2" />
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Bouton "Voir tous les projets" */}
                {workspaceId && (
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={handleViewAllProjects}
                            className="inline-flex items-center justify-center space-x-2"
                        >
                            <span>Voir tous les projets</span>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
