import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../libs/fetch-utils"; 

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => fetchData("/tasks/my-tasks"), 
  });
};