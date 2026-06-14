import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export type SegmentType = "zombi" | "startup" | "grande" | "estandar";
export type ServiceStatus = "activo" | "suspendido" | "cancelado";

export interface Client {
  id: string;
  name: string;
  segment: SegmentType;
  service_status: ServiceStatus;
  created_at: string;
  updated_at: string;
  total_debt: number;
  max_days_overdue: number;
  latest_action?: string;
  latest_action_date?: string;
  priority: number;
}

export interface CollectionActionRequest {
  collection_status: string;
  note: string;
  promise_date?: string;
}

export const useTriageClients = () => {
  return useQuery({
    queryKey: ["triage", "clients"],
    queryFn: async () => {
      const response = await api.get<Client[]>("/debts/triage");
      return response.data;
    },
  });
};

export const useAddCollectionAction = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: CollectionActionRequest) => {
      const response = await api.post(`/clients/${clientId}/actions`, action);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage", "clients"] });
    },
  });
};

export const useUpdateSegment = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (segment: SegmentType) => {
      const response = await api.put(`/clients/${clientId}/segment`, { segment });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage", "clients"] });
    },
  });
};
