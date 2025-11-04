import type { Workspace } from '../../types';
import { useAuth } from '../../fournisseur/auth-context';
import { useState } from 'react';
import { LayoutDashboard, Users, ListCheck, CheckCircle2, Settings, ClipboardCheck, ChevronsRight, ChevronsLeft, LogOut } from 'lucide-react';
import { cn } from '../../libs/utils';
import { Link } from 'react-router-dom';
import { Button } from '../button';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarNav } from './sidebar-nav';

export const SidebarComponent = ({ currentWorkspace }: { currentWorkspace: Workspace | null }) => {
  const { utilisateur, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      title: "Tableau de Bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Espaces de Travail",
      href: "/dashboard/workspaces",
      icon: Users,
    },
    {
      title: "Mes Tâches",
      href: "/dashboard/my-tasks",
      icon: ListCheck,
    },
    {
      title: "Membres",
      href: "/dashboard/members",
      icon: Users,
    },
    {
      title: "Archivés",
      href: "/dashboard/achieved",
      icon: CheckCircle2,
    },
    {
      title: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16 md:w-[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className='flex h-14 items-center border-b px-4 mb-4'>
        <Link to="/dashboard" className='flex items-center'>
          {!isCollapsed && (
            <div className='flex items-center gap-2'>
              <ClipboardCheck className='size-6 text-[#005F73]' />
              <span className='font-semibold text-lg hidden md:block'>
                Planifio
              </span>
            </div>
          )}
          {isCollapsed && <ClipboardCheck className='size-6 text-[#005F73]' />}
        </Link>
        <Button
          variant={"ghost"}
          size={"icon"}
          className='ml-auto hidden md:block'
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronsRight className='size-4' />
          ) : (
            <ChevronsLeft className='size-4' />
          )}
        </Button>
      </div>

      <ScrollArea className='flex-1 px-3 py-2'>
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className={cn(isCollapsed && "items-center space-y-2")}
          currentWorkspace={currentWorkspace}
        />
      </ScrollArea>

      <div className={cn("p-3", isCollapsed && "flex justify-center")}>
        <Button
          variant={"ghost"}
          className={cn(
            "w-full justify-start gap-x-2 transition-colors duration-300",
            isCollapsed
              ? "justify-center w-auto p-2 text-red-600 hover:text-red-700 hover:bg-red-100"
              : "hover:bg-[#005F73]/10"
          )}
          onClick={logout}
        >
          <LogOut
            className={cn(
              "size-4 transition-colors duration-300",
              isCollapsed && "text-red-600"
            )}
          />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>


    </div>
  );
};
