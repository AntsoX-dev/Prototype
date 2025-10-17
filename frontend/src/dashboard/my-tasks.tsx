import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpRight,
  Clock,
  Filter,
  List,
  Grid,
  ArrowUpDown,
} from "lucide-react";
import { useGetMyTasksQuery } from "../hooks/use-task";
import type { Task } from "../types";

const ICON_BG = "#DDF9FF";
const ICON_FG = "#2AA5E6";
const DUE_DATE_COLOR = "#F2B705";

const capitalizeWords = (s: string) =>
  s
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const MyTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Pour la transition de fondu
  const [isFading, setIsFading] = useState(false);
  const handleViewChange = (mode: "list" | "grid") => {
    if (viewMode !== mode) {
      setIsFading(true);
      setTimeout(() => {
        setViewMode(mode);
        setIsFading(false);
      }, 150);
    }
  };

  useEffect(() => {
    setSearchParams({ filter, sort: sortDirection, search }, { replace: true });
  }, [filter, sortDirection, search, setSearchParams]);

  const { data: myTasks = [], isLoading } = useGetMyTasksQuery() as {
    data?: Task[];
    isLoading: boolean;
  };

  const filteredTasks = myTasks
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
        (task.description || "").toLowerCase().includes(search.toLowerCase())
    );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Chargement des tâches…</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes tâches</h1>

          <div className="flex gap-2 items-center">
            {/* Bouton tri à 2 fonctions (icône + texte) */}
            <button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              aria-label="Changer l'ordre de tri"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-400 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-700" />
              {sortDirection === "asc"
                ? "Les plus anciens en premier"
                : "Les plus récents en premier"}
            </button>

            {/* Bouton Filtrer */}
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-400 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition">
              <Filter className="w-4 h-4 text-gray-700" />
              Filtrer
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher des tâches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] border border-gray-400 rounded-xl px-3 py-2 text-base placeholder:text-base placeholder:font-semibold placeholder:text-gray-400 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
          />
        </div>

        {/* Bloc boutons de vue juste en dessous du champ */}
        <div className="mb-4 inline-flex bg-gray-200 p-1 rounded-xl">
          <button
            onClick={() => handleViewChange("list")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            Vue en liste
          </button>

          <button
            onClick={() => handleViewChange("grid")}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <Grid className="w-4 h-4" />
            Vue en grille
          </button>
        </div>

        {/* Carte principale */}
        <div
          className={`bg-white border border-gray-200 rounded-3xl shadow-sm p-5 transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mes tâches</h2>
              <p className="text-sm font-semibold text-gray-400">
                {sortedTasks.length} tâche(s) qui vous sont assignées
              </p>
            </div>
          </div>

          {/* Liste / Grille */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <div
                  key={task._id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between rounded-2xl p-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: ICON_BG }}
                      aria-hidden
                    >
                      <Clock className="w-5 h-5" style={{ color: ICON_FG }} />
                    </div>

                    <div>
                      <Link
                        to={`/workspaces/${(task.project as any)?.workspace}/projects/${(task.project as any)?._id}/tasks/${task._id}`}
                        className="font-medium text-gray-900 flex items-center gap-2 hover:underline"
                      >
                        {task.title}
                        <ArrowUpRight className="w-4 h-4 text-[#005F73]" />
                      </Link>

                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="px-2 py-0.5 border border-gray-300 rounded-full text-xs bg-white text-gray-700">
                          {task.status === "In Progress"
                            ? "En Cours"
                            : task.status === "To Do"
                            ? "À faire"
                            : "Terminé"}
                        </span>
                        {task.priority && (
                          <span className="px-2 py-0.5 border border-gray-300 rounded-full text-xs bg-white text-gray-700">
                            {task.priority === "High"
                              ? "Haute"
                              : task.priority === "Medium"
                              ? "Moyen"
                              : "Basse"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-right mt-3 md:mt-0">
                    {task.dueDate && (
                      <div>
                        <strong className="mr-1">Échéance :</strong>
                        <span
                          className="font-semibold"
                          style={{ color: DUE_DATE_COLOR }}
                        >
                          {capitalizeWords(
                            format(new Date(task.dueDate), "PPPP", { locale: fr })
                          )}
                        </span>
                      </div>
                    )}
                    <div>
                      Projet :{" "}
                      <span className="font-medium text-gray-900">
                        {(task.project as any)?.title || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTasks.map((task) => (
                <div
                  key={task._id}
                  className="border border-gray-100 rounded-2xl p-4 bg-white hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: ICON_BG }}
                    >
                      <Clock className="w-5 h-5" style={{ color: ICON_FG }} />
                    </div>
                    <div>
                      <Link
                        to={`/workspaces/${(task.project as any)?.workspace}/projects/${(task.project as any)?._id}/tasks/${task._id}`}
                        className="font-medium text-gray-900 flex items-center gap-2 hover:underline"
                      >
                        {task.title}
                        <ArrowUpRight className="w-4 h-4 text-[#005F73]" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedTasks.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Aucune tâche trouvée
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
