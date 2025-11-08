// API client utilities
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Events
  events: {
    list: (weddingId: string) =>
      apiCall(`/events?weddingId=${weddingId}`),
    create: (weddingId: string, data: any) =>
      apiCall(`/events`, "POST", { ...data, weddingId }),
    update: (id: string, data: any) =>
      apiCall(`/events/${id}`, "PUT", data),
    delete: (id: string) => apiCall(`/events/${id}`, "DELETE"),
  },
  
  // Similar patterns for other resources...
};