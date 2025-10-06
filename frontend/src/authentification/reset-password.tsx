import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../hooks/use-auth";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ correction ici :
  const { mutate, isPending: isLoading } = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      toast.error("Token manquant. Le lien semble invalide.");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token manquant.");
      return;
    }
    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    mutate(
      { token, newPassword: form.newPassword },
      {
        onSuccess: () => {
          toast.success("Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.");
          navigate("/signin");
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Erreur lors de la réinitialisation.";
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-gray-160 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900">Réinitialiser le mot de passe</h2>
        <p className="text-gray-500 text-center text-base mt-1 mb-8">
          Choisissez un nouveau mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">Nouveau mot de passe</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="********"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-[440px] ml-2 bg-[#005F73] hover:bg-[#004652] text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            {isLoading ? "En cours..." : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
