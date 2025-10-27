import type { TaskPriority } from "../../types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    useUpdateTaskPriorityMutation,
} from "../../hooks/use-task";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
    priority,
    taskId,
}: {
    priority: TaskPriority;
    taskId: string;
}) => {
    const { mutate, isPending } = useUpdateTaskPriorityMutation();

    const handleStatusChange = (value: string) => {
        mutate(
            { taskId, priority: value as TaskPriority },
            {
                onSuccess: () => {
                    toast.success("Priorité mise à jour avec succès");
                },
                onError: (error: any) => {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                    console.log(error);
                },
            }
        );
    };
    return (
        <Select value={priority || ""} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]" disabled={isPending}>
                <SelectValue placeholder="Priorité" />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="Low">Basse</SelectItem>
                <SelectItem value="Medium">Normale</SelectItem>
                <SelectItem value="High">Haute</SelectItem>
            </SelectContent>
        </Select>
    );
};
