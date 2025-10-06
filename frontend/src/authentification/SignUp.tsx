import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUpMutation } from "../hooks/use-auth";
import { toast } from "sonner";
import { SignUpSchema, type SignUpFormData } from "./signup-schema";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate, isPending: isLoading } = useSignUpMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = SignUpSchema.safeParse(formData);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        toast.error(issue.message);
      }
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success(
          "Compte créé avec succès ! Vérifiez votre e-mail pour activer votre compte."
        );
        navigate("/signin");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors de la création du compte.";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-gray-160 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Créer un compte
        </h2>
        <p className="text-gray-500 text-center text-base mt-1 mb-8">
          Entrez vos informations et créez votre compte
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">
              Nom et prénom
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Marin Kitagawa"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-1 text-lg font-medium text-gray-900 placeholder-gray-480 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-1 text-lg font-medium text-gray-900 placeholder-gray-480 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-900 mt-6">
          Déjà un compte ?{" "}
          <Link to="/signin" className="text-[#005F73] hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
