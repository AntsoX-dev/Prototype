import { useMutation } from "@tanstack/react-query";
import { postData } from "../libs/fetch-utils";
import type { use } from "react";
import type { useAuth } from "../fournisseur/auth-context";

// Types pour les formulaires
interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordFormData {
  email: string;
}

interface ResetPasswordFormData {
  token: string;
  newPassword: string;
}

interface VerifyEmailData {
  token: string;
}

//  Inscription
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignUpFormData) =>
      postData("/authentification/register", data),
  });
};

// Connexion
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginFormData) =>
      postData("/authentification/login", data),
  });
};

// Vérification e-mail
export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyEmailData) =>
      postData("/authentification/verify-email", data),
  });
};

//  Mot de passe oublié
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      postData("/authentification/forgot-password", data),
  });
};

//  Réinitialisation du mot de passe
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      postData("/authentification/reset-password", data),
  });
};

