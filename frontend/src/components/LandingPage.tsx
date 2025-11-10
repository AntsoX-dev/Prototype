import { Link } from "react-router-dom";
import {
  BarChart,
  Send,
  Users,
  UserPlus,
  ShieldPlus,
  ClipboardCheck,
  Cog,
  ExternalLink,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col items-center p-8 text-center bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="p-3 bg-[#005F73]/10 rounded-full">
      <Icon className="h-8 w-8 text-[#005F73]" />
    </div>
    <h3 className="mt-4 font-semibold text-xl text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-3 text-base">{description}</p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-[#005F73] flex items-center gap-2 group"
          >
            <div className="p-2 bg-[#005F73] text-white rounded-lg transition-transform duration-500 ">
              <Cog
                size={20}
                className="group-hover:rotate-180 duration-1000 group-hover:scale-150"
              />
            </div>
            PlaniFio
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/signin"
              className="text-sm font-medium text-gray-600 hover:text-[#005F73] transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#005F73] rounded-lg shadow-sm hover:bg-[#005F73]/90 transition-all hover:shadow-md"
            >
              S'inscrire
            </Link>
          </nav>
        </div>
      </header>

      <section className="w-full">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 !leading-tight">
              Organisez mieux, réalisez plus avec
              <br />
              <span className="text-[#005F73]">PlaniFio</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              La plateforme moderne qui aide vos équipes à organiser, suivre et
              accomplir leurs tâches avec efficacité.
            </p>
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center text-base font-medium text-white px-8 py-3 rounded-lg bg-[#005F73] shadow-md hover:bg-[#005F73]/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Essai gratuit
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center justify-center text-base font-medium text-[#005F73] px-8 py-3 rounded-lg border border-[#005F73] bg-white shadow-md hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Découvrir
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/5 mt-10 lg:mt-0">
            <img
              src="/TeamWork.svg"
              alt="Illustration d'une équipe travaillant ensemble"
              className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-50 py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="px-4 py-1 text-sm font-semibold text-[#005F73] bg-[#005F73]/10 rounded-full">
              Nos atouts
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Tout pour gérer vos tâches efficacement
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Nos outils performants aident vos équipes à s’organiser et à
              livrer à temps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Travail d’équipe"
              description="Collaborez facilement avec votre équipe dans des espaces partagés et profitez de mises à jour en temps réel."
            />
            <FeatureCard
              icon={ClipboardCheck}
              title="Gestion des tâches"
              description="Organisez vos tâches avec priorités, dates d’échéance, commentaires et suivez l’avancement visuellement."
            />
            <FeatureCard
              icon={BarChart}
              title="Suivi de progression"
              description="Visualisez l’avancement des projets avec de beaux graphiques et des informations sur la productivité de l’équipe."
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="px-4 py-1 text-sm font-semibold text-[#005F73] bg-[#005F73]/10 rounded-full">
              Comment ça marche ?
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Un processus simple pour des résultats puissants
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Lancez-vous en quelques minutes et boostez la productivité de
              votre équipe.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldPlus}
              title="Créer un compte"
              description="Inscrivez-vous gratuitement et lancez vos premiers espaces de travail en un instant."
            />
            <FeatureCard
              icon={UserPlus}
              title="Invitez votre équipe"
              description="Invitez votre équipe et lancez la collaboration en un instant pour une synergie immédiate."
            />
            <FeatureCard
              icon={Send}
              title="Passez à l'action"
              description="Créez des projets, assignez des tâches et suivez l’avancement en temps réel."
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-[#005F73]">
        <div className="container mx-auto flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Prêt à rendre votre équipe plus productive ?
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-xl">
            Rejoignez des milliers d'équipes qui font confiance à PlaniFio pour
            gérer leurs projets.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 text-base font-semibold text-[#005F73] bg-white px-8 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Commencer maintenant
            <ExternalLink size={18} />
          </Link>
        </div>
      </section>

      <footer className="w-full bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PlaniFio. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
