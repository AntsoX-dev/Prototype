import type { LucideIcon } from "lucide-react";
import type { Workspace } from "../../types";
import { cn } from "../../libs/utils";
import { Button } from "../button";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> {
    items: {
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
}: SidebarNavProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav
            className={cn("flex flex-col gap-y-2 w-full", className)}
            {...props}
        >
            {items.map((el) => {
                const Icon = el.icon;
                const isActive =
                    el.href === "/dashboard"
                        ? location.pathname === "/dashboard"
                        : location.pathname.startsWith(el.href);

                const handleClick = () => {
                    let path = el.href;

                    // Cas spécial : workspace actif, ajouter l’ID si besoin
                    if (
                        currentWorkspace &&
                        currentWorkspace._id &&
                        el.href === "/dashboard/workspaces"
                    ) {
                        path += `/${currentWorkspace._id}`;
                    }

                    navigate(path);
                };

                return (
                    <Button
                        key={el.href}
                        onClick={handleClick}
                        variant={isActive ? "outline" : "ghost"}
                        className={cn(
                            "w-full flex items-center gap-x-2 transition-all duration-200",
                            "justify-start px-3 py-2 text-sm",
                            "hover:bg-[#005F73]/10",
                            isCollapsed && "justify-center px-0",
                            isActive && "bg-[#005F73]/20 text-[#005F73] font-medium rounded-lg"
                        )}
                    >
                        <Icon className={cn("size-4 shrink-0", !isCollapsed && "mr-2")} />
                        {!isCollapsed && (
                            <span className="truncate">{el.title}</span>
                        )}
                    </Button>
                );
            })}
        </nav>
    );
};
