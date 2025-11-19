// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import type { CreateProjectFormData } from "../components/project/create-project";
// import { fetchData, postData } from "../libs/fetch-utils";

// export const UseCreateProject = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async (data: {
//             projectData: CreateProjectFormData;
//             workspaceId: string;
//         }) =>
//             postData(
//                 `/projects/${data.workspaceId}/create-project`,
//                 data.projectData
//             ),
//         onSuccess: (data: any) => {
//             queryClient.invalidateQueries({
//                 queryKey: ["workspace", data.workspace],
//             });
//         },
//     });
// };

// export const UseProjectQuery = (projectId: string) => {
//     return useQuery({
//         queryKey: ["project", projectId],
//         queryFn: () => fetchData(`/projects/${projectId}/tasks`),
//     });
// };


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProjectFormData } from "../components/project/create-project";
import { fetchData, postData, updateData, deleteData } from "../libs/fetch-utils"; 
import type { Project } from "../types"; 

// === Création d'un projet ===
export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { projectData: CreateProjectFormData; workspaceId: string }) =>
      postData(`/projects/${data.workspaceId}/create-project`, data.projectData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", data.workspace] });
    },
  });
};

// === Query projet ===
export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}`),
  });
};


// === Update projet ===
export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
    
  return useMutation({
    mutationFn: (data: { projectId: string; payload: any }) =>
      updateData(`/projects/${data.projectId}`, data.payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["project", vars.projectId] });
    },
  });
};

// === Delete projet ===
export const useDeleteProjectMutation = () => {
  return useMutation({
    mutationFn: (projectId: string) => deleteData(`/projects/${projectId}`),
  });
};
