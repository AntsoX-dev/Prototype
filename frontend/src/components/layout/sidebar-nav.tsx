import { Icon, type LucideIcon } from "lucide-react";
import type { Workspace } from "../../types";
import { cn } from "../../libs/utils";
import { Button } from "../button";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> {
        items:{
        title: string;
        href: string;
        icon: LucideIcon;
    }[];
    isCollapsed: boolean;
    currentWorkspace: Workspace | null;
    className?: string;
}
export const SidebarNav = ({
    items,
    isCollapsed,
    className,
    currentWorkspace,
    ...props
}: SidebarNavProps) =>{
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <nav className={cn("flex flex-col gap-y-2", className)} {...props}>
            {
                items.map((el) => {
                    const Icon = el.icon;
                    const isActive =
                    el.href === "/dashboard"
                        ? location.pathname === "/dashboard"
                        : location.pathname.startsWith(el.href);



                    const handleClick = () => {
                    let path = el.href;

                    // Cas spécial : workspace actif, ajouter l’ID
                    if (currentWorkspace && currentWorkspace._id && el.href === "/dashboard/workspaces") {
                        path += `/${currentWorkspace._id}`;
                    }

                    navigate(path);
                    };


                    return <Button key={el.href}
                    variant={isActive ? "outline": "ghost"}
                    className={cn("justify-start", isActive && "bg-[#005F73]/20 text-[#005F73] font-medium",)}
                    onClick={handleClick}
                    >
                        <Icon className="mr-2 size-4"/>
                        {
                            isCollapsed ? <span className="sr-only">{el.title}</span> : (
                                el.title
                            )

                        }
                    </Button>
                })
            }
        </nav>
    );
};

