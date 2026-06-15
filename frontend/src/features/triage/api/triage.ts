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

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export const useTriageClients = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["triage", "clients", page, limit],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Client>>(`/debts/triage?page=${page}&limit=${limit}`);
      return response.data.data;
    },
    placeholderData: (prev) => prev,
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

export interface ClientNote {
  id: string;
  client_id: string;
  content: string;
  created_at: string;
}

export interface DashboardKPIs {
  total_overdue_debt: number;
  at_risk_debt: number;
  top_debtors: Client[];
}

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardKPIs }>("/dashboard/kpis");
      return response.data.data;
    },
  });
};

export const useClientNotes = (clientId: string) => {
  return useQuery({
    queryKey: ["client_notes", clientId],
    queryFn: async () => {
      const response = await api.get<{ data: ClientNote[] }>(`/clients/${clientId}/notes`);
      return response.data.data;
    },
    enabled: !!clientId,
  });
};

export const useAddClientNote = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/clients/${clientId}/notes`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_notes", clientId] });
    },
  });
};
