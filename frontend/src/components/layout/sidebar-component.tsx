import type { Workspace } from '../../types';
import { useAuth } from '../../fournisseur/auth-context';
import { useState } from 'react';
import { LayoutDashboard, Users, ListCheck, CheckCircle2, Settings, ClipboardCheck , ChevronsRight, ChevronsLeft, LogOut } from 'lucide-react';
import { cn } from '../../libs/utils';
import { Link } from 'react-router-dom';
import { Button } from '../button';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarNav } from './sidebar-nav';


export const SidebarComponent = ({ currentWorkspace }: { currentWorkspace: Workspace | null }) => {
const {utilisateur, logout} = useAuth();
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
      href: `/dashboard/members`,
      icon: Users,
    },
    {
      title: "Accomplies",
      href: `/dashboard/achieved`,
      icon: CheckCircle2,
    },
    {
      title: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];
return (
<div className={cn("flex flex-col border-r bg-sidebar traansition-all duration-300",
    isCollapsed ? "w-16 md:w-[80px]" : "w-16 md:w-[240px]"
)}
>
    <div className='flex h-14 items-center border-b px-4 mb-4'>
        <Link to="/dashboard" className='flex items-center'>
            {!isCollapsed && (
            <div className='flex items-center gap-2'>
                <ClipboardCheck   className='size-6 text-[#005F73]'/>
                <span className='font-semibold text-lg hidden md:block'>
                    Planifio
                </span>
            </div> 
        )}

        {isCollapsed && <ClipboardCheck   className='size-6 text-[#005F73]'/> }

        </Link>
        <Button 
            variant={"ghost"}
            size={"icon"}
            className='ml-auto hidden md:block'
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            {
                isCollapsed ? (<ChevronsRight className='size-4'/> 

                ) : (
                <ChevronsLeft className='size-4'/>
            )}
        </Button>
    </div>
    <ScrollArea className='flex-1 px-3 py-2'>
        <SidebarNav
        items={navItems}
        isCollapsed={isCollapsed}
        className={
            cn(isCollapsed && "items-center space-y-2")
        }
        currentWorkspace={currentWorkspace}
        />
    </ScrollArea>
    <div>
        <Button variant={"ghost"} size={isCollapsed ? "icon":"default"} onClick={logout}>
            <LogOut className={cn('size-4', isCollapsed && 'mr-2')}/>
            <span className='hidden md:block'>Déconnexion</span>
        </Button>
    </div>
</div>
)
}