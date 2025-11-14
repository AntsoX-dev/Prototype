import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Ajoute le token dans chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // 👇 tu peux laisser ce log pour debug (supprime après)
        console.log("🔑 Token ajouté :", token);
    } else {
        console.warn("⚠️ Aucun token trouvé dans localStorage");
    }

    return config;
});

// 🚨 Gestion automatique des erreurs 401 (token expiré / manquant)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("⛔ Token invalide ou expiré — déconnexion forcée");
            window.dispatchEvent(new Event("force-logout"));
        }
        return Promise.reject(error);
    }
);

// Fonctions utilitaires
const postData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.post(path, data);
    return response.data;
};

const fetchData = async <T>(path: string): Promise<T> => {
    const response = await api.get(path);
    return response.data;
};

const updateData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.put(path, data);
    return response.data;
};

const deleteData = async <T>(path: string): Promise<T> => {
    const response = await api.delete(path);
    return response.data;
};

const postFormData = async <T>(
  path: string,
  formData: FormData
): Promise<T> => {
  const response = await api.post(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
const patchData = async <T>(path: string): Promise<T> => {
    const response = await api.patch(path); 
    return response.data;
};

const updateFormData = async <T>(
  path: string,
  formData: FormData
): Promise<T> => {
  const response = await api.put(path, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export {
  postData,
  fetchData,
  updateData,
  deleteData,
  updateFormData,
  postFormData,
  patchData,
};
