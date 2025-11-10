import type { Utilisateur } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Watchers = ({ watchers }: { watchers: Utilisateur[] }) => {
    return (
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">Observateurs</h3>

            <div className="space-y-2">
                {watchers && watchers.length > 0 ? (
                    watchers.map((watcher) => (
                        <div key={watcher._id} className="flex items-center gap-2">
                            <Avatar className="size-6">
                                <AvatarImage src={watcher.profil} />
                                <AvatarFallback>{watcher.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <p className="text-sm text-muted-foreground">{watcher.name}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Aucun observateur</p>
                )}
            </div>
        </div>
    );
};
