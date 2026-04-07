/**
 * API Client Configuration
 * Replace with your backend server URL when deployed
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add token if available (for authenticated requests)
    const token = typeof window !== 'undefined' ? localStorage.getItem('libris_auth_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add user ID if available (from localStorage or auth context)
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (userId) {
      headers['x-user-id'] = userId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed to ${url}:`, error);
      throw error;
    }
  }

  async getBooks(
    search?: string,
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.request(`/books?${params.toString()}`);
  }

  async getBook(id: string): Promise<any> {
    return this.request(`/books/${id}`);
  }

  async createBook(data: any): Promise<any> {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBook(id: string, data: any): Promise<any> {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBook(id: string): Promise<any> {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async login(email: string, password: string): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string, collegeCode: string, reason?: string): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, collegeCode, reason }),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me');
  }

  async getColleges(): Promise<any> {
    return this.request('/colleges');
  }

  async createCollege(data: any): Promise<any> {
    return this.request('/colleges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollege(id: string, data: any): Promise<any> {
    return this.request(`/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new APIClient();
