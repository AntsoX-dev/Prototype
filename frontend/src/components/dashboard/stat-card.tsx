import type { StatsCardProps } from "../../types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/Card";

export const StatsCard = ({ data }: { data: StatsCardProps }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total des projets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalProjects}</div>
                    <p className="text-xs text-muted-foreground">
                        {data.totalProjectInProgress} en cours
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total des tâches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTasks}</div>
                    <p className="text-xs text-muted-foreground">
                        {data.totalTaskCompleted} terminé
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">À Faire</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTaskToDo}</div>
                    <p className="text-xs text-muted-foreground">
                        Tâche en attente d'être effectuées
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">En Cours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTaskInProgress}</div>
                    <p className="text-xs text-muted-foreground">
                        Tâche actuellement en cours
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
