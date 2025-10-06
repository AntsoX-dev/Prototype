import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Card, CardHeader, CardContent } from "../components/ui/Card";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus("loading");
        const response = await fetch("http://localhost:5000/api-v1/authentification/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la vérification");
        }

        const data = await response.json();
        console.log("✅ Vérification réussie :", data);

        // Si le backend renvoie un message de succès
        if (data && data.message && data.message.includes("succès")) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification :", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <h1 className="text-xl font-bold mb-2">Vérification de l'e-mail</h1>
      <p className="text-sm text-gray-500 mb-6">
        Veuillez patienter pendant la vérification de votre e-mail...
      </p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-sm text-gray-600">Statut de la vérification</h2>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            {status === "loading" && (
              <>
                <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
                <h3 className="text-lg font-semibold">Vérification en cours...</h3>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
                <h3 className="text-lg font-semibold">E-mail vérifié avec succès </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Vous pouvez maintenant vous connecter à votre compte.
                </p>
                <Link
                  to="/signin"
                  className="text-[#005F73] mt-3 font-semibold hover:underline"
                >
                  Aller à la page de connexion
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircleIcon className="w-10 h-10 text-red-500" />
                <h3 className="text-lg font-semibold">Échec de la vérification</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Le lien de vérification est invalide ou a expiré.
                </p>
                <Link
                  to="/signup"
                  className="text-[#005F73] mt-3 font-semibold hover:underline"
                >
                  Recréer un compte
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
