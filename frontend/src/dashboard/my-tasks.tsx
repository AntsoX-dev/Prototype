import { Loader } from "../components/loader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useGetMyTasksQuery } from "../hooks/use-task";
import type { Task } from "../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filteredTasks =
    myTasks?.length > 0
      ? myTasks
        .filter((task) => {
          if (filter === "all") return true;
          if (filter === "todo") return task.status === "To Do";
          if (filter === "inprogress") return task.status === "In Progress";
          if (filter === "done") return task.status === "Done";
          if (filter === "achieved") return task.isArchived === true;
          if (filter === "high") return task.priority === "High";
          return true;
        })
        .filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === "In Progress"
  );
  const doneTasks = sortedTasks.filter((task) => task.status === "Done");

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Tâches</h1>

        <div className="flex flex-col items-start md:flex-row gap-2">
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Les plus anciennes" : "Les plus récentes"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <FilterIcon className="w-4 h-4" /> Filtrer
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer les tâches</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                Toutes les tâches
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                À faire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                En cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Terminées
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
                Archivées
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                Priorité haute
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input
        placeholder="Rechercher une tâche..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
          <TabsTrigger value="board">Vue Grille</TabsTrigger>
        </TabsList>

        {/* Vue Liste */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Mes Tâches</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tâche
                {sortedTasks?.length > 1 ? "s" : ""} assignée
                {sortedTasks?.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      {/* Côté gauche */}
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                              <CheckCircle className="size-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600">
                              <Clock className="size-4" />
                            </div>
                          )}
                        </div>

                        {/* Conteneur des informations à décaler */}
                        <div className="ml-4"> {/* Décalage ajouté ici */}
                          <Link
                            to={`/dashboard/workspaces/${task.project?.workspace ?? ""}/projects/${task.project?._id ?? ""}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={task.status === "Done" ? "default" : "outline"}
                            >
                              {task.status === "To Do"
                                ? "À faire"
                                : task.status === "In Progress"
                                  ? "En cours"
                                  : "Terminée"}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority === "High"
                                  ? "Haute"
                                  : task.priority === "Medium"
                                    ? "Normale"
                                    : "Basse"}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archivée</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Côté droit parfaitement aligné */}
                      <div className="text-sm text-muted-foreground w-[280px] flex-shrink-0 grid grid-cols-1 gap-1 text-right">
                        <div className="flex justify-between gap-2">
                          <span className="text-amber-600 font-medium whitespace-nowrap">Échéance :</span>
                          <span className="text-amber-600 font-medium whitespace-nowrap">
                            {task.dueDate
                              ? format(new Date(task.dueDate), "EEEE d MMMM yyyy", { locale: fr })
                              : "—"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">Projet :</span>
                          <span className="font-medium truncate max-w-[160px]">
                            {task.project?.title || "Inconnu"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">Modifiée le :</span>
                          <span className="whitespace-nowrap">
                            {format(new Date(task.updatedAt), "EEEE d MMMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune tâche trouvée
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Vue Tableau — inchangée */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ title: "À faire", data: todoTasks },
            { title: "En cours", data: inProgressTasks },
            { title: "Terminées", data: doneTasks }].map((col) => (
              <Card key={col.title}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {col.title}
                    <Badge variant={"outline"}>{col.data?.length}</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                  {col.data?.map((task) => (
                    <Card
                      key={task._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <Link
                        to={`/dashboard/workspaces/${task.project?.workspace ?? ""}/projects/${task.project?._id ?? ""}/tasks/${task._id}`}
                        className="block"
                      >
                        <h3 className="font-medium ml-4">{task.title}</h3> {/* Décalage ajouté ici */}
                        <p className="text-sm text-muted-foreground line-clamp-3 ml-4">{task.description || "Pas de description"}</p> {/* Décalage ajouté ici */}

                        <div className="flex items-center mt-2 gap-2 ml-4"> {/* Décalage ajouté ici */}
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {task.priority === "High"
                              ? "Haute"
                              : task.priority === "Medium"
                                ? "Normale"
                                : "Basse"}
                          </Badge>

                          {task.dueDate && (
                            <span className="text-sm text-amber-600 font-medium ml-4">
                              {format(new Date(task.dueDate), "EEEE d MMMM yyyy", {
                                locale: fr,
                              })}
                            </span>
                          )}
                        </div>
                      </Link>
                    </Card>
                  ))}

                  {col.data?.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Aucune tâche trouvée
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MyTasks;
