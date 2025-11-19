import { useMutation, useQuery } from "@tanstack/react-query";
import type { WorkspaceForm } from "../components/workspace/create-workspace";
import { fetchData, postData } from "../libs/fetch-utils";


export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData('/workspaces', data),
    });
}

export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => fetchData('/workspaces'),
    });
}

export const useGetWorkspaceQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
    })
};

export const useGetWorkspaceStatsQuery = (workspaceId?: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId, "stats"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
        enabled: !!workspaceId && workspaceId !== "null",
    });
};


export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId, "details"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
    });
};

export const useInviteMemberMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
            postData(`/workspaces/${data.workspaceId}/invite-member`, data),
    });
};

export const useAcceptInviteByTokenMutation = () => {
    return useMutation({
        mutationFn: (token: string) =>
            postData(`/workspaces/accept-invite-token`, {
                token,
            }),
    });
};

export const useAcceptGenerateInviteMutation = () => {
    return useMutation({
        mutationFn: (workspaceId: string) =>
            postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
    });
};


// SETTINGS
import { updateData, deleteData } from "../libs/fetch-utils";

export const useUpdateWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (data: { workspaceId: string; payload: any }) =>
      updateData(`/workspaces/${data.workspaceId}`, data.payload),
  });
};

export const useTransferWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (data: { workspaceId: string; newOwnerId: string }) =>
      updateData(`/workspaces/${data.workspaceId}/transfer`, {
        newOwnerId: data.newOwnerId,
      }),
  });
};

export const useDeleteWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      deleteData(`/workspaces/${workspaceId}`),
  });
};