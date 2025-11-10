import { Link } from 'react-router-dom';
import { BarChart, Send, Users, UserPlus, ShieldPlus, ClipboardCheck } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start">

            {/* Header Section */}
            <header className="w-full py-6 flex justify-between items-center px-4 md:px-10 animate__animated animate__fadeIn">
                <div className="text-xl font-semibold text-[#005F73]">PlaniFio</div>
                <div className="space-x-4">
                    <Link to="/signin" className="text-gray-700 hover:text-[#005F73]">Se connecter</Link>
                    <Link to="/signup" className="text-gray-700 hover:text-[#005F73]">S'inscrire</Link>
                </div>
            </header>

            {/* Main Section */}
            <section className="text-center max-w-4xl mx-auto mt-10">
                <h1 className="text-4xl font-bold text-gray-900 animate__animated animate__fadeIn">Organisez mieux, réalisez plus avec PlaniFio</h1>
                <p className="mt-4 text-lg text-gray-700 animate__animated animate__fadeIn">La plateforme moderne qui aide vos équipes à organiser, suivre et accomplir leurs tâches avec efficacité.</p>

                <div className="mt-8 space-x-4">
                    <Link to="/signup" className="bg-[#005F73] text-white px-6 py-2 rounded-md hover:bg-[#005F73]/80 transition duration-300">Essai gratuit</Link>
                    <Link to="/discover" className="text-[#005F73] hover:text-[#005F73]/80">Découvrir</Link>
                </div>
            </section>

            {/* Tout pour gérer vos tâches efficacement */}
            <section className="mt-16 px-4 md:px-10 text-center animate__animated animate__fadeIn">
                <h2 className="text-3xl font-bold text-gray-900">Tout pour gérer vos tâches efficacement</h2>
                <p className="text-lg text-gray-700 mt-4">Nos outils performants aident vos équipes à s’organiser et à livrer à temps.</p>
            </section>

            {/* Features Section */}
            <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-10">
                <div className="text-center p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-1s">
                    <Users className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Travail d’équipe</h3>
                    <p className="text-gray-600">Collaborez facilement avec votre équipe dans des espaces partagés et profitez de mises à jour en temps réel.</p>
                </div>
                <div className="text-center p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-2s">
                    <ClipboardCheck className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Gestion des tâches</h3>
                    <p className="text-gray-600">Organisez vos tâches avec priorités, dates d’échéance, commentaires et suivez l’avancement visuellement.</p>
                </div>
                <div className="text-center p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-3s">
                    <BarChart className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Suivi de progression</h3>
                    <p className="text-gray-600">Visualisez l’avancement des projets avec de beaux graphiques et des informations sur la productivité de l’équipe.</p>
                </div>
            </section>

            {/* Un processus simple pour des résultats puissants */}
            <section className="mt-16 px-4 md:px-10 text-center animate__animated animate__fadeIn">
                <h2 className="text-3xl font-bold text-gray-900">Un processus simple pour des résultats puissants</h2>
                <p className="text-lg text-gray-700 mt-4">Lancez-vous en quelques minutes et boostez la productivité de votre équipe.</p>
            </section>

            {/* Steps Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-10 mt-8">
                <div className="p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-1s">
                    <ShieldPlus className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Créer un compte</h3>
                    <p className="text-gray-600">Inscrivez-vous gratuitement et lancez vos premiers espaces de travail en un instant.</p>
                </div>
                <div className="p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-2s">
                    <UserPlus className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Invitez votre équipe</h3>
                    <p className="text-gray-600">Invitez votre équipe et lancez la collaboration en un instant.</p>
                </div>
                <div className="p-6 bg-white shadow-lg rounded-lg transform transition-all hover:scale-105 hover:shadow-xl animate__animated animate__fadeIn animate__delay-3s">
                    <Send className="mx-auto h-12 w-12 text-[#005F73] mb-4" />
                    <h3 className="font-semibold text-xl text-gray-900">Passez à l'action</h3>
                    <p className="text-gray-600">Créez des projets, assignez des tâches et suivez l’avancement en temps réel.</p>
                </div>
            </section>

            {/* Call to Action */}
            <section className="mt-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 animate__animated animate__fadeIn">Prêt à rendre votre équipe plus productive ?</h2>
                <Link to="/signup" className="bg-[#005F73] text-white px-8 py-3 rounded-md mt-4 inline-block hover:bg-[#005F73]/80 transition duration-300">Commencer maintenant</Link>
            </section>

        </div>
    );
};

export default LandingPage;
