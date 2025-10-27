import type {
    ProjectStatusData,
    StatsCardProps,
    TaskPriorityData,
    TaskTrendsData,
    WorkspaceProductivityData,
} from "../../types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/Card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

interface StatisticsChartsProps {
    stats: StatsCardProps;
    taskTrendsData: TaskTrendsData[];
    projectStatusData: ProjectStatusData[];
    taskPriorityData: TaskPriorityData[];
    workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
    taskTrendsData,
    projectStatusData,
    taskPriorityData,
    workspaceProductivityData,
}: StatisticsChartsProps) => {
    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">Tendances des tâches</CardTitle>
                        <CardDescription>Changements quotidiens du statut des tâches</CardDescription>
                    </div>
                    <ChartLine className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        <ChartContainer
                            className="h-[300px]"
                            config={{
                                completed: { color: "#10b981" }, // green
                                inProgress: { color: "#f59e0b" }, // blue
                                todo: { color: "#3b82f6" }, // gray
                            }}
                        >
                            <LineChart data={taskTrendsData}>
                                <XAxis
                                    dataKey={"name"}
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
                                <ChartTooltip />

                                <Line
                                    type="monotone"
                                    dataKey={"completed"}
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="inProgress"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="todo"
                                    stroke="#6b7280"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />

                                <ChartLegend content={<ChartLegendContent />} />
                            </LineChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {/* project status  */}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Statut du projet
                        </CardTitle>
                        <CardDescription>Répartition des statuts du projet</CardDescription>
                    </div>

                    <ChartPie className="size-5 text-muted-foreground" />
                </CardHeader>

                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        <ChartContainer
                            className="h-[300px]"
                            config={{
                                Terminé: { color: "#10b981" },
                                "En cours": { color: "#3b82f6" },
                                "En planification": { color: "#f59e0b" },
                            }}
                        >
                            <PieChart>
                                <Pie
                                    data={projectStatusData.map((item) => ({
                                        ...item,
                                        name:
                                            item.name === "Completed"
                                                ? "Terminé"
                                                : item.name === "In Progress"
                                                    ? "En cours"
                                                    : "En planification",
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    label={({ name, percent }) =>
                                        `${name} (${(percent * 100).toFixed(0)}%)`
                                    }
                                    labelLine={false}
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>


            {/* task priority  */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Priorité des tâches
                        </CardTitle>
                        <CardDescription>
                            Répartition des priorités des tâches
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        <ChartContainer
                            className="h-[300px]"
                            config={{
                                Haute: { color: "#ef4444" },
                                Normale: { color: "#f59e0b" },
                                Basse: { color: "#6b7280" },
                            }}
                        >
                            <PieChart>
                                <Pie
                                    data={taskPriorityData.map((item) => ({
                                        ...item,
                                        name:
                                            item.name === "High"
                                                ? "Haute"
                                                : item.name === "Medium"
                                                    ? "Normale"
                                                    : "Basse",
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {taskPriorityData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>


            {/* Workspace Productivity Chart */}
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Productivité de l’espace de travail
                        </CardTitle>
                        <CardDescription>
                            Achèvement des tâches par projet
                        </CardDescription>
                    </div>
                    <ChartBarBig className="h-5 w-5 text-muted-foreground" />
                </CardHeader>

                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        <ChartContainer
                            className="h-[300px]"
                            config={{
                                terminées: { color: "#3b82f6" },
                                totales: { color: "black" },
                            }}
                        >
                            <BarChart
                                data={workspaceProductivityData}
                                barGap={0}
                                barSize={20}
                            >
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="total"
                                    fill="#000"
                                    radius={[4, 4, 0, 0]}
                                    name="Tâches totales"
                                />
                                <Bar
                                    dataKey="completed"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    name="Tâches finie"
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};
