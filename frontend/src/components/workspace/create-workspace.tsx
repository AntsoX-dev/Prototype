import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { workspaceSchema } from "../../libs/schema";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "../../libs/utils";
import { Button } from "../button";
import { useCreateWorkspace } from "../../hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../fournisseur/react-query";

interface CreateWorkspaceProps {
    isCreatingWorkspace: boolean;
    setIsCreatingWorkspace: (isCreatingWorkspace: boolean) => void;
}
export const colorOptions = [
    "#2563EB",
    "#16A34A",
    "#9333EA",
    "#FFD13A",
    "#DC2626",
    "#0EA5E9",
    "#14B8A6",
    "#64748B",
];

export type WorkspaceForm = z.infer<typeof workspaceSchema>;

export const CreateWorkspace = ({
    isCreatingWorkspace,
    setIsCreatingWorkspace,
}: CreateWorkspaceProps) => {

    const form = useForm<WorkspaceForm>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: "",
            color: colorOptions[0],
            description: "",
        }
    })
    const navigate = useNavigate();
    const { mutate, isPending } = useCreateWorkspace();

    const onSubmit = (data: WorkspaceForm) => {
        mutate(data, {
            onSuccess: (data: any) => {
                form.reset();
                setIsCreatingWorkspace(false);
                toast.success("Espace de travail créé avec succès !");

                // mise à jour automatique via React Query
                queryClient.invalidateQueries({ queryKey: ["workspaces"] });

                // Navigation vers le workspace créé
                navigate(`/dashboard/workspaces/${data._id}`);
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || "Erreur lors de la création";
                toast.error(errorMessage);
                console.log(error);
            }
        })
    }

    return (
        <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace} modal={true}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nouvel espace de travail</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de l'espace de travail</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nom de l'espace de travail " />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description de l’espace de travail</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Description de l'espace de travail" rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Couleur de l'espace de travail</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-3 flex-wrap">
                                                {colorOptions.map((color) => (
                                                    <div
                                                        key={color}
                                                        onClick={() => field.onChange(color)}
                                                        className={cn("h-6 w-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                                                            field.value === color &&
                                                            "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-[#005F73]")}
                                                        style={{ backgroundColor: color }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Création..." : "Créer l'espace"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
};
