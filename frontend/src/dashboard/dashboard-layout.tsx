import { useAuth } from '../fournisseur/auth-context'
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Header } from '../components/layout/header';
import { useState } from 'react'; 
import type { Workspace } from '../types';
import { SidebarComponent } from '../components/layout/sidebar-component';
import { CreateWorkspace } from '../components/workspace/create-workspace';
import { fetchData } from '../libs/fetch-utils';
import { useQuery } from "@tanstack/react-query"; //
//il ne sert plus à useLoaderData()
export const clientLoader = async() => {
  try {
    const [workspaces] = await Promise.all([
      fetchData('/workspaces'),
    ]);
    return {workspaces};
  } catch (error) {
    console.log(error)
  }
}

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // États internes
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // Gestion via React Query au lieu de useEffect manuel
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: () => fetchData("/workspaces"),
  });

  // Vérifications d'authentification
  if (isLoading || isWorkspacesLoading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;      
  }

  // Quand l'utilisateur choisit un workspace dans le menu
  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  }

  // Structure de ton layout
  return (
    <div className='flex h-screen w-full'>
      <SidebarComponent currentWorkspace={currentWorkspace}/>

      <div className='flex flex-1 flex-col h-full'>
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}  
          workspaces={workspaces} 
        /> 

        <main className='flex-1 overflow-y-auto h-full w-full'>
          <div className='mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full'>
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  )
}

export default DashboardLayout;
