import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "../../libs/schema";
import { useForm } from "react-hook-form";
import { ProjectStatus, type MemberProps } from "../../types";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../../components/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { fr } from "date-fns/locale";
import { Checkbox } from "../ui/checkbox";
import { UseCreateProject } from "../../hooks/use-project";
import { toast } from "sonner";

const translateRole = (role: string | undefined): string => {
    switch (role) {
        case 'admin':
            return 'Administrateur';
        case 'member':
            return 'Membre';
        case 'owner':
            return 'Propriétaire';
        case 'viewer':
            return 'Observateur';
        case 'contributor':
            return 'Contributeur';
        case 'manager':
            return 'Responsable';
        default:
            return role || '';
    }
};


interface CreateProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
    isOpen,
    onOpenChange,
    workspaceId,
    workspaceMembers,
}: CreateProjectDialogProps) => {

    const form = useForm<CreateProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            status: ProjectStatus.PLANNING,
            startDate: "",
            dueDate: "",
            members: [],
            tags: "",
        },
    });
    const { mutate, isPending } = UseCreateProject();

    const onSubmit = (values: CreateProjectFormData) => {
        if (!workspaceId) return;

        mutate({
            projectData: values,
            workspaceId,
        },
            {
                onSuccess: () => {
                    toast.success("Projet créé avec succès");
                    form.reset();
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                    console.log(error);
                },
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle>Nouveau projet</DialogTitle>
                    <DialogDescription>
                        Créez un nouveau projet pour commencer à suivre vos progrès.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du projet</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Nom du projet" />
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
                                    <FormLabel>Description </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Description du projet"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Statut du projet</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner le statut du projet" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="Planning">En planification</SelectItem>
                                                <SelectItem value="In Progress">En cours</SelectItem>
                                                <SelectItem value="On Hold">En attente</SelectItem>
                                                <SelectItem value="Completed">Terminé</SelectItem>
                                                <SelectItem value="Cancelled">Annulé</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de début</FormLabel>
                                        <FormControl>
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={
                                                            "w-full justify-start text-left font-normal" +
                                                            (!field.value ? "text-muted-foreground" : "")
                                                        }
                                                    >
                                                        <CalendarIcon className="size-4 mr-2" />
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPPP", { locale: fr })
                                                        ) : (
                                                            <span>Choisissez une date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            field.onChange(date?.toISOString() || undefined);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d’échéance</FormLabel>
                                        <FormControl>
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={
                                                            "w-full justify-start text-left font-normal" +
                                                            (!field.value ? "text-muted-foreground" : "")
                                                        }
                                                    >
                                                        <CalendarIcon className="size-4 mr-2" />
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPPP", { locale: fr })
                                                        ) : (
                                                            <span>Choisissez une date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            field.onChange(date?.toISOString() || undefined);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Étiquettes</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Étiquettes séparées par une virgule" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="members"
                            render={({ field }) => {
                                const selectedMembers = field.value || [];

                                return (
                                    <FormItem>
                                        <FormLabel>Membres</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className="w-full justify-start text-left font-normal min-h-11"
                                                    >
                                                        {
                                                            selectedMembers.length === 0 ? (
                                                                <span className="text-muted-foreground">Sélectionnez les membres</span>
                                                            ) : (
                                                                selectedMembers.length <= 2 ? (
                                                                    selectedMembers.map((m, index) => {
                                                                        const member = workspaceMembers.find((wm) => wm.user._id === m.user);
                                                                        if (member) {
                                                                            return (
                                                                                <span key={index}>
                                                                                    {`${member.user.name} (${translateRole(m.role)})`}
                                                                                    {index < selectedMembers.length - 1 && ", "}
                                                                                </span>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })
                                                                ) : (
                                                                    `${selectedMembers.length} membres sélectionnés`
                                                                )
                                                            )
                                                        }
                                                    </Button>

                                                </PopoverTrigger>
                                                <PopoverContent className="w-full max-w-60 overflow-y-auto" align="start">
                                                    <div className="flex flex-col gap-2">
                                                        {
                                                            workspaceMembers.map((member) => {
                                                                const selectedMember = selectedMembers.find((m) => m.user === member.user._id);
                                                                return (
                                                                    <div key={member._id}
                                                                        className="flex items-center gap-2 p-2 border rounded"
                                                                    >
                                                                        <Checkbox
                                                                            checked={!!selectedMember}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked) {
                                                                                    field.onChange([
                                                                                        ...selectedMembers,
                                                                                        { user: member.user._id, role: member.role }
                                                                                    ]);
                                                                                } else {
                                                                                    field.onChange(selectedMembers.filter((m) => m.user !== member.user._id));
                                                                                }
                                                                            }}
                                                                            id={`member-${member.user._id}`}
                                                                        />

                                                                        <span className="truncate flex-1">
                                                                            {member.user.name}
                                                                        </span>

                                                                        {
                                                                            selectedMember && (
                                                                                <Select value={selectedMember?.role} onValueChange={(role) => {
                                                                                    const updatedMembers = selectedMembers.map((m) =>
                                                                                        m.user === member.user._id
                                                                                            ? { ...m, role: role as "contributor" | "manager" | "viewer" }
                                                                                            : m
                                                                                    );

                                                                                    field.onChange(updatedMembers);
                                                                                }}>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Sélectionnez le rôle" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="manager">Responsable</SelectItem>
                                                                                        <SelectItem value="contributor">Contributeur</SelectItem>
                                                                                        <SelectItem value="viewer">Observateur</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>

                                                                            )
                                                                        }
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Créer..." : "Créer le projet"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};