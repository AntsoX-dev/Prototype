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
                    const isActive = location.pathname === el.href;

                    // j'ai modifier ici "hajaina"
                    const handleClick = () => {
                    // Cas spécial : lien vers workspaces
                    if (el.href === "/workspaces") {
                        navigate("/dashboard/workspaces");
                    } 
                    // Si workspace actif
                    else if (currentWorkspace && currentWorkspace._id) {
                        navigate(`/dashboard${el.href}?workspaceId=${currentWorkspace._id}`);
                    } 
                    // Cas général
                    else {
                        navigate(`/dashboard${el.href}`);
                    }
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

