import { useEffect, useState } from "react";
import type { Workspace } from "../../types";
import { useAuth } from "../../fournisseur/auth-context";
import { Button } from "../button";
import { PlusCircle, CheckCircle, Trash2, BellDot, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { deleteData, fetchData, patchData } from "../../libs/fetch-utils";
import { toast } from "sonner";

interface Notification {
  _id: string;
  message: string;
  lu: boolean;
  date_reception: string;
}

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  workspaces: Workspace[];
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { utilisateur, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const isOnWorkspacePage = useLocation().pathname.includes("/workspaces");

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await fetchData<Workspace[]>("/workspaces");
        setWorkspaces(data);
      } catch (error) {
        console.error("Erreur lors du chargement des workspaces:", error);
      }
    };
    loadWorkspaces();
  }, []);

  const loadNotifications = async () => {
    if (!utilisateur) return;
    try {
      const response = await fetchData<{ data: Notification[] }>(
        "/notifications"
      );
      const loadedNotifications = response.data || [];

      setNotifications(loadedNotifications);
      setHasUnread(loadedNotifications.some((n) => !n.lu));
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotifications([]);
      setHasUnread(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [utilisateur]);

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    const location = window.location;

    if (isOnWorkspacePage) {
      navigate(`/dashboard/workspaces/${workspace._id}`);
    } else {
      const basePath = location.pathname;
      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await patchData("/notifications/mark-all-read");

      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      setHasUnread(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications:", error);
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    const now = new Date();
    const past = new Date(isoDate);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteData(`/notifications/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
      toast.success("Notification supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      toast.error("Erreur lors de la suppression de la notification.");
    }
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace?.name}</span>
                </>
              ) : (
                <span className="font-medium">Choisir l'Espace de Travail</span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Espace de Travail</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleOnClick(ws)}
                >
                  {ws.color && (
                    <WorkspaceAvatar color={ws.color} name={ws.name} />
                  )}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer un espace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          {/* Menu des Notifications */}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) loadNotifications();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="text-gray-700 hover:text-primary-500 transition-colors duration-200" />
                {notifications.filter(n => !n.lu).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white font-semibold flex items-center justify-center rounded-full bg-red-500">
                    {/* Afficher le nombre de notifications non lues, ou +9 si le nombre dépasse 9 */}
                    {notifications.filter(n => !n.lu).length > 9
                      ? '+9'
                      : notifications.filter(n => !n.lu).length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg p-2 transition-all duration-300 ease-in-out"
            >
              <div className="py-2 px-4">
                <DropdownMenuLabel className="font-semibold text-lg text-gray-800 text-center mb-2">
                  Notifications
                </DropdownMenuLabel>

                {/* Bouton "Marquer tout comme lu" */}
                {notifications.length > 0 && (
                  <DropdownMenuItem
                    onClick={handleMarkAllRead}
                    className="cursor-pointer text-sm text-[#005F73] justify-center transition-colors duration-200 ease-in-out hover:bg-[#0060731f] focus:bg-[#0060731f] text-center py-2"
                  >
                    <CheckCircle className="w-3 h-3 mr-2 text-[#005F73]" /> Marquer tout comme lu
                  </DropdownMenuItem>
                )}
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((n) => (
                    <DropdownMenuItem
                      key={n._id}
                      className={`flex items-start h-auto py-3 px-4 mb-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${!n.lu
                        ? "bg-[#00607315] hover:bg-blue-100 border-l-4 border-[#005F73]"
                        : "bg-gray-50 text-gray-500"
                        }`}
                    >
                      {/* Icône plus petite */}
                      <div className="flex-shrink-0 mt-0.5">
                        <BellDot className={`w-4 h-4 ${!n.lu ? 'text-[#005F73]' : 'text-gray-400'}`} />
                      </div>

                      {/* Contenu du message */}
                      <div className="ml-3 flex flex-col space-y-1 w-full">
                        <p className="text-sm font-medium leading-tight text-gray-700">{n.message}</p>
                        <span
                          className={`text-xs ${!n.lu ? "text-[#005F73] font-semibold" : "text-gray-400"}`}
                        >
                          {formatTimeAgo(n.date_reception)}
                        </span>
                      </div>
                      {/* Icône de suppression */}
                      <button
                        onClick={() => handleDeleteNotification(n._id)}
                        className="ml-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                        aria-label="Supprimer la notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    className="text-center justify-center text-gray-500"
                    disabled
                  >
                    Aucune nouvelle notification
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>









          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-1 w-8 h-8 flex justify-center items-center">
                <Avatar className="w-8 h-8 flex justify-center items-center">
                  <AvatarImage
                    className="object-cover w-full h-full"
                    src={utilisateur?.profil}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {utilisateur?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
