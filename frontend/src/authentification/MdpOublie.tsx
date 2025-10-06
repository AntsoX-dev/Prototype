import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "../hooks/use-auth";
import { toast } from "sonner";

const MdpOublie = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useForgotPasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("L'email est requis.");
      return;
    }

    mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Si cet e-mail existe, un lien de réinitialisation a été envoyé.");
          setTimeout(() => navigate("/signin"), 3000);
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Erreur lors de la demande.";
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-gray-160 border border-gray-200 rounded-3xl p-5 shadow-sm">
        <div className="mb-6">
          <Link to="/signin" className="flex items-center gap-2 text-sm text-[#005F73] hover:underline">
            <span>&larr; Retour à la connexion</span>
          </Link>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <span className="text-green-600 text-4xl font-bold">✓</span>
            <h1 className="text-2xl font-bold text-gray-900">E-mail de réinitialisation envoyé</h1>
            <p className="text-gray-500 text-base">Veuillez vérifier votre boîte de réception.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Mot de passe oublié</h2>
            <p className="text-gray-500 text-center text-base mt-1 mb-8">
              Entrez votre e-mail pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-lg font-semi-bold text-gray-900 mb-1 ml-3">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-[440px] ml-2 border border-gray-300 rounded-xl px-3 py-1 text-lg font-medium text-gray-900 placeholder-gray-480 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#005F73]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-[440px] ml-2 bg-[#005F73] hover:bg-[#004652] text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
              >
                {isPending ? "Envoi..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MdpOublie;
