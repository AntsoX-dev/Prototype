// my-task-merged.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Loader2,
  ArrowUpDown,
  ArchiveRestore,
  Trash2,
  List,
  Grid,
  Filter,
} from "lucide-react";

import { useGetMyTasksQuery } from "../hooks/use-task";
import type { Task } from "../types";

import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

// Radix dropdown (comme dans my-task.tsx)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { useQueryClient } from "@tanstack/react-query";

const ICON_BG = "#DDF9FF";
const ICON_FG = "#2AA5E6";

const capitalizeWords = (s: string) =>
  s
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "text-red-600";
    case "Medium":
      return "text-yellow-600";
    case "Low":
      return "text-green-600";
    default:
      return "text-gray-500";
  }
};

type Workspace = {
  _id: string;
  name: string;
  color: string;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const MyTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Archive route detection (comme my-task.tsx)
  const archivedParam = searchParams.get("archived");
  const isArchiveRoute = location.pathname.includes("/dashboard/archived");
  const isArchivedView = archivedParam === "true" || isArchiveRoute;

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  const [isFading, setIsFading] = useState(false);

  // Tabs control (utilise Tabs de my-task-1) : 'list' | 'board'
  // useEffect(() => {
  //   if (isArchivedView) {
  //     setFilter("achieved");
  //     setSearchParams(
  //       { archived: "true", filter: "achieved", sort: sortDirection, search },
  //       { replace: true }
  //     );
  //   } else {
  //     setSearchParams({ filter, sort: sortDirection, search }, { replace: true });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filter, sortDirection, search, isArchivedView]);


useEffect(() => {
  const currentFilter = searchParams.get("filter") || "all";
  const currentSort = searchParams.get("sort") || "desc";
  const currentSearch = searchParams.get("search") || "";
  const currentArchived = searchParams.get("archived") === "true";

  // Empêcher les updates si rien n'a changé
  if (
    currentFilter === filter &&
    currentSort === sortDirection &&
    currentSearch === search &&
    currentArchived === isArchivedView
  ) {
    return;
  }

  if (isArchivedView) {
    setFilter("achieved");
    setSearchParams(
      {
        archived: "true",
        filter: "achieved",
        sort: sortDirection,
        search,
      },
      { replace: true }
    );
  } else {
    setSearchParams(
      {
        filter,
        sort: sortDirection,
        search,
      },
      { replace: true }
    );
  }
}, [filter, sortDirection, search, isArchivedView]);


  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: myTasks = [], isLoading, refetch } = useGetMyTasksQuery() as {
    data?: Task[];
    isLoading: boolean;
    refetch: () => void;
  };

  const qc = useQueryClient();
  const token = localStorage.getItem("token");

  // latest activity map & workspace map (comme dans my-task.tsx)
  const [latestActivityMap, setLatestActivityMap] = useState<
    Record<string, { description?: string; createdAt?: string } | undefined>
  >({});
  const [workspacesMap, setWorkspacesMap] = useState<Record<string, Workspace>>({});

  // fetch activities for visible tasks (copié de my-task.tsx)
  useEffect(() => {
    let mounted = true;
    const tasksToFetch = (myTasks || []).slice(0, 30);

    const fetchActivities = async () => {
      try {
        const promises = tasksToFetch.map(async (t) => {
          try {
            const res = await fetch(`${API_BASE}/tasks/${t._id}/activity`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return { taskId: t._id, activity: null };
            const activities = await res.json();
            const latest = activities && activities.length > 0 ? activities[0] : null;
            return { taskId: t._id, activity: latest };
          } catch (err) {
            return { taskId: t._id, activity: null };
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        const map: Record<string, { description?: string; createdAt?: string } | undefined> =
          {};
        results.forEach((r) => {
          if (r.activity) {
            map[r.taskId] = {
              description: r.activity.description,
              createdAt: r.activity.createdAt,
            };
          } else {
            map[r.taskId] = undefined;
          }
        });
        setLatestActivityMap((p) => ({ ...p, ...map }));
      } catch (err) {
        // ignore
      }
    };

    if (tasksToFetch.length > 0) fetchActivities();
    return () => {
      mounted = false;
    };
  }, [myTasks, token]);

  // fetch workspaces (copié depuis my-task.tsx, avec consoles utiles)
  useEffect(() => {
    let mounted = true;

    const fetchWorkspaces = async () => {
      try {
        const res = await fetch(`${API_BASE}/workspaces`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const workspaces: Workspace[] = await res.json();
        if (!mounted) return;
        const map: Record<string, Workspace> = {};
        workspaces.forEach((workspace) => {
          map[workspace._id] = workspace;
        });
        setWorkspacesMap(map);
      } catch (err) {
        console.error("Erreur chargement workspaces:", err);
      }
    };

    if (token) fetchWorkspaces();
    return () => {
      mounted = false;
    };
  }, [token]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";


  // Actions Restaurer / Supprimer (copié de my-task.tsx)
  const restoreTask = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/achieved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Echec restauration");
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      refetch();
    } catch (err) {
      console.error("Erreur restauration tâche :", err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Supprimer définitivement cette tâche ?")) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Echec suppression");
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      refetch();
    } catch (err) {
      console.error("Erreur suppression tâche :", err);
    }
  };

  // advancedSearch (copié de my-task.tsx)
  const advancedSearch = (task: Task, searchTerm: string) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase().trim();

    if (task.title.toLowerCase().includes(term)) return true;
    if (task.description && task.description.toLowerCase().includes(term)) return true;

    if (task.priority === "High" && term.includes("haute")) return true;
    if (task.priority === "Medium" && term.includes("moyenne")) return true;
    if (task.priority === "Low" && term.includes("basse")) return true;

    if (task.dueDate) {
      try {
        const frenchDate = format(new Date(task.dueDate), "dd/MM/yyyy", { locale: fr });
        if (frenchDate.includes(term)) return true;
      } catch (error) {
        console.error("Date error:", error);
      }
    }

    return false;
  };

  // Filtrage & tri (mix logique des 2 fichiers, en respectant l'archive)
  const filteredTasks =
    (myTasks || [])
      .filter((task) => {
        if (isArchivedView) return task.isArchived === true;
        if (filter === "all") return task.isArchived === false;
        if (filter === "todo") return task.status === "To Do" && !task.isArchived;
        if (filter === "inprogress") return task.status === "In Progress" && !task.isArchived;
        if (filter === "done") return task.status === "Done" && !task.isArchived;
        if (filter === "achieved") return task.isArchived === true;
        if (filter === "high") return task.priority === "High" && !task.isArchived;
        return !task.isArchived;
      })
      .filter((task) => advancedSearch(task, search));

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  // workspace helper
  const getWorkspaceInfo = (task: Task) => {
    const project = task.project as any;
    if (!project || !project.workspace) {
      return { name: "Espace", color: "#64748B" };
    }

    const workspaceId = project.workspace;
    const workspace = workspacesMap[workspaceId];

    if (workspace) {
      return { name: workspace.name, color: workspace.color };
    }

    return { name: "Espace", color: "#64748B" };
  };



  
  if (isLoading)
    return (
      <div>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Chargement des tâches…</div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold">{isArchivedView ? "Archives" : "Mes Tâches"}</h1>

        <div className="flex flex-col items-start md:flex-row gap-2">
          <button
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-xl bg-white text-sm"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDirection === "asc" ? "Les plus anciennes" : "Les plus récentes"}
          </button>

          {/* Filtre (icône / look de my-task.tsx) */}
          {!isArchivedView && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-xl bg-white text-sm">
                  <Filter className="w-4 h-4" />
                  Filtrer
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-48" align="end">
                <DropdownMenuLabel className="text-gray-700 font-semibold text-sm px-2">
                  Filtrer les tâches
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 border-gray-200" />
                {[
                  { key: "all", label: "Toutes les tâches" },
                  { key: "todo", label: "À faire" },
                  { key: "inprogress", label: "En cours" },
                  { key: "done", label: "Terminées" },
                  { key: "achieved", label: "Archivées" },
                  { key: "high", label: "Priorité haute" },
                ].map((item) => (
                  <DropdownMenuItem asChild key={item.key}>
                    <button
                      onClick={() => setFilter(item.key)}
                      className={`w-full text-left px-2 py-1 cursor-pointer rounded-md
                        ${
                          filter === item.key
                            ? "bg-[#E0F7FA] text-[#005F73] font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

{/* Barre de recherche responsive */}
<div className="mb-4 flex flex-col sm:flex-row gap-3 items-start w-full">

  <div className="relative w-full max-w-xs"> 
    <Input
      placeholder="Rechercher une tâche..."
      value={search}
      onChange={(e: any) => setSearch(e.target.value)}
      className="pl-10 pr-10 py-2 w-full rounded-xl border border-gray-300 
                 focus:ring-2 focus:ring-primary focus:outline-none"
    />

    {/* Icône loupe */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>

    {/* Effacer */}
    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    )}
  </div>

  {/* Petit texte explicatif */}
  <div className="text-xs text-gray-500 flex items-center sm:mt-1">
    Recherche : nom tâche • description • date • priorité
  </div>
</div>


      {/* Tabs (vue liste / grille comme my-task-1.tsx) */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="w-4 h-4 inline-block mr-2" /> Vue Liste
          </TabsTrigger>
          <TabsTrigger value="board">
            <Grid className="w-4 h-4 inline-block mr-2" /> Vue Grille
          </TabsTrigger>
        </TabsList>

        {/* Vue Liste (structure & icônes de my-task-1.tsx, couleurs & archive buttons de my-task.tsx) */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Mes Tâches</CardTitle>
              <CardDescription>
                {sortedTasks?.length} tâche{sortedTasks?.length > 1 ? "s" : ""} assignée
                {sortedTasks?.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedTasks?.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      {/* Côté gauche : icônes LIST view from my-task-1 */}
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                              <CheckCircle className="size-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Conteneur des informations */}
                        <div className="ml-4">
                          {/* liens kept from my-task.tsx style */}
                          <Link
                            to={`/dashboard/workspaces/${task.project?.workspace ?? ""}/projects/${task.project?._id ?? ""}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={task.status === "Done" ? "default" : "outline"}>
                              {task.status === "To Do"
                                ? "À faire"
                                : task.status === "In Progress"
                                  ? "En cours"
                                  : "Terminée"}
                            </Badge>

                            {task.priority && (
                              <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>
                                {task.priority === "High"
                                  ? "Haute"
                                  : task.priority === "Medium"
                                    ? "Normale"
                                    : "Basse"}
                              </Badge>
                            )}

                            {task.isArchived && <Badge variant={"outline"}>Archivée</Badge>}
                          </div>
                        </div>
                      </div>

                      {/* Côté droit (échéance, projet, modif) */}
                      <div className="text-sm text-muted-foreground w-[280px] flex-shrink-0 grid grid-cols-1 gap-1 text-right">
                        <div className="flex justify-between gap-2">
                          <span className={`font-medium ${getPriorityColor(task.priority ?? "Low")}`}>
                            Échéance :
                          </span>
                          <span className={`font-medium whitespace-nowrap ${getPriorityColor(task.priority ?? "Low")}`}>
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

                    {/* Si vue archivées afficher boutons Restaurer / Supprimer (de my-task.tsx) */}
                    {isArchivedView && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => restoreTask(task._id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                        >
                          <ArchiveRestore size={14} />
                          Restaurer
                        </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-red-400 text-red-600 rounded-lg text-sm hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </button>
                      </div>
                    )}
                  </div>
                ))}

                {sortedTasks?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">Aucune tâche trouvée</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vue Grille (layout my-task-1, couleurs & archive buttons from my-task.tsx) */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ title: "À faire", data: sortedTasks.filter(t => t.status === "To Do") },
            { title: "En cours", data: sortedTasks.filter(t => t.status === "In Progress") },
            { title: "Terminées", data: sortedTasks.filter(t => t.status === "Done") }].map((col) => (
              <Card key={col.title}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {col.title}
                    <Badge variant={"outline"}>{col.data?.length}</Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                  {col.data?.map((task) => {
                    const workspaceInfo = getWorkspaceInfo(task);
                    return (
                      <Card key={task._id} className="hover:shadow-md transition-shadow">
                        <Link
                          to={`/dashboard/workspaces/${task.project?.workspace ?? ""}/projects/${task.project?._id ?? ""}/tasks/${task._id}`}
                          className="block"
                        >
                          <h3 className="font-medium ml-4">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 ml-4">
                            {task.description || "Pas de description"}
                          </p>

                          <div className="flex items-center mt-2 gap-2 ml-4">
                            <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>
                              {task.priority === "High"
                                ? "Haute"
                                : task.priority === "Medium"
                                  ? "Normale"
                                  : "Basse"}
                            </Badge>

                            {task.dueDate && (
                              <span className={`text-sm font-medium ml-4 ${getPriorityColor(task.priority ?? "Low")}`}>
                                {format(new Date(task.dueDate), "EEEE d MMMM yyyy", { locale: fr })}
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Archive actions in grid (small buttons like my-task.tsx grid) */}
                        {isArchivedView && (
                          <div className="flex gap-2 mt-3 ml-4">
                            <button
                              onClick={() => restoreTask(task._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-100"
                            >
                              <ArchiveRestore size={12} />
                              Restaurer
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-red-400 text-red-600 rounded-lg text-xs hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </Card>
                    );
                  })}

                  {col.data?.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">Aucune tâche trouvée</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {sortedTasks?.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">Aucune tâche trouvée</div>
      )}
    </div>
  );
};

export default MyTasks;
