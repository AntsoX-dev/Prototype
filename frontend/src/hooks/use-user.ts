import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";
import { fetchData, updateData } from "../libs/fetch-utils";
import type { ChangePasswordFormData, ProfileFormData } from "../user/profile";

const queryKey: QueryKey = ["user"];

export const useUserProfileQuery = () => {
    return useQuery({
        queryKey,
        queryFn: () => fetchData("/users/profile"),
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordFormData) =>
            updateData("/users/change-password", data),
    });
};

export const useUpdateUserProfile = () => {
    return useMutation({
        mutationFn: (data: ProfileFormData) => updateData("/users/profile", data),
    });
};
