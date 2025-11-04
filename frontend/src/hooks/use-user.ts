// use-user.ts
import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";
import { fetchData, updateFormData } from "../libs/fetch-utils"; // on va le créer juste après
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
      fetch(`/api-v1/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok)
          throw new Error("Erreur lors du changement de mot de passe");
        return res.json();
      }),
  });
};

// Fitahiana (ajout d'un envoi formdata)
export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (data: FormData) => updateFormData("/users/profile", data),
  });
};
