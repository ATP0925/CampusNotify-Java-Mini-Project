// ==========================================
// Centralized API Client with Sliding JWT
// ==========================================

export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  timestamp?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private token: string | null = null;
  private renewedTokenListener?: (newToken: string) => void;

  constructor() {
    this.token = localStorage.getItem('cnms_jwt_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('cnms_jwt_token', token);
    } else {
      localStorage.removeItem('cnms_jwt_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public onTokenRenewed(callback: (newToken: string) => void) {
    this.renewedTokenListener = callback;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      // L1 Sliding Token Renewal Check
      const renewedToken = response.headers.get('X-Renewed-Token');
      if (renewedToken && renewedToken !== this.token) {
        this.setToken(renewedToken);
        if (this.renewedTokenListener) {
          this.renewedTokenListener(renewedToken);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message ||
            errorData?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const json = await response.json();
      return (json.data !== undefined ? json.data : json) as T;
    } catch (err: any) {
      // In standalone mode or dev network error, log and propagate
      console.warn(`[ApiClient] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
export default api;
