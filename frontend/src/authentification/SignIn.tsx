import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { toast } from "sonner";
import { useLoginMutation } from "../hooks/use-auth";
import { useAuth } from "../fournisseur/auth-context";

interface SigninFormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Champs du formulaire
  const [formData, setFormData] = useState<SigninFormData>({
    email: "",
    password: "",
  });

  // Hook React Query pour la connexion
  const { mutate, isPending } = useLoginMutation();

  // Mise à jour des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }


    mutate(formData, {
      onSuccess: (data) => {
        toast.success("Connexion réussie !");
        login(data); 
        navigate("/dashboard"); 
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Une erreur s'est produite";
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-gray-160 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Content de vous revoir 
        </h2>
        <p className="text-gray-500 text-center text-base mt-1 mb-8">
          Connectez-vous en saisissant vos identifiants
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-1 ml-3">E-mail</label>
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
            <div className="flex items-center justify-between w-[440px] ml-2">
              <label className="block text-lg font-semibold text-gray-900 mb-1">
                Mot de passe
              </label>
              <Link
                to="/mdpoublie"
                className="text-sm text-[#005F73] hover:underline" 
              >
                Mot de passe oublié ?
              </Link>
            </div>
            
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-[440px] ml-2 bg-[#005F73] hover:bg-[#004652] text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-900 mt-6">
          Vous n'avez pas de compte ?{" "}
          <Link to="/signup" className="text-[#005F73] hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
