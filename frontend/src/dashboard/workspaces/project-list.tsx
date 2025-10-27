import { NoDataFound } from "../../components/no-data-found";
import { ProjectCard } from "../../components/project/project-card";
import type { Project } from "../../types";

interface ProjectListProps {
    workspaceId: string;
    projects: Project[]

    onCreateProject: () => void
}



export const ProjectList = ({
    workspaceId,
    projects,
    onCreateProject,
}: ProjectListProps) => {

    return (
    <div>
        <h3 className="text-xl font-medium mb-4">Projets</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {
                projects.length === 0 ? (<NoDataFound
                title="Aucun projet trouvé"
                description="Créez un projet pour commencer"
                buttonText="Créer un projet"
                buttonAction={onCreateProject}
                /> 
            ) : (
                projects.map((project) => {
                    const projectProgress = 0

                    return(
                    <ProjectCard
                    key={project._id}
                    project={project}
                    progress={projectProgress}
                    workspaceId={workspaceId}
                    />
                )})

            )}
        </div>
    </div>
    )
}