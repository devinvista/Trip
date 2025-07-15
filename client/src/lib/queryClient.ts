import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any,
): Promise<Response> {
  // Get session ID from localStorage if available
  const sessionId = localStorage.getItem('sessionId');
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add session ID to headers if available (fallback for cookie issues)
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  
  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Include cookies/session
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erro HTTP ${response.status}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get session ID from localStorage if available
    const sessionId = localStorage.getItem('sessionId');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add session ID to headers if available (fallback for cookie issues)
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    // Handle URL with query parameters
    let url = queryKey[0] as string;
    
    // If there are query parameters in the queryKey, add them to the URL
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
    }
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});