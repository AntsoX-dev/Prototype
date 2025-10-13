import {useMutation} from "@tanstack/react-query";
import type { WorkspaceForm } from "../components/workspace/create-workspace";
import { postData } from "../libs/fetch-utils";

export const useCreateWorkspace = () => {
    return useMutation ({
        mutationFn: async (data: WorkspaceForm) => postData('/workspaces', data),
    });
}