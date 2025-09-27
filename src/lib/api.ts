/**
 * API utility functions for backend connectivity
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Store JWT token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('authStateChanged'));
}

/**
 * Remove JWT token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('authStateChanged'));
}

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // If endpoint starts with /api, it's a Next.js API route (use relative URL)
  // Otherwise, use the backend API URL
  const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Get auth token and add to headers if available
  const token = getAuthToken();
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        removeAuthToken(); // Clear invalid token
        
        // Only redirect if we're in the browser
        if (typeof window !== 'undefined') {
          // Redirect to sign-in page with message
          window.location.href = '/auth/signin?message=Your session has expired. Please sign in again.';
        }
      }
      
      return {
        error: `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Health check endpoint - try different common health check paths
 */
export async function checkBackendHealth(): Promise<ApiResponse<{ status: string }>> {
  // Try common health check endpoints
  const healthEndpoints = ['/health', '/api/health', '/status', '/api/status', '/'];
  
  for (const endpoint of healthEndpoints) {
    try {
      const result = await apiGet<{ status: string }>(endpoint);
      if (result.status === 200) {
        return {
          data: { status: 'Backend is reachable' },
          status: result.status
        };
      }
    } catch {
      // Continue to next endpoint
      continue;
    }
  }
  
  // If all endpoints fail, return a basic connectivity test
  return {
    data: { status: 'Backend connection tested - endpoints may need configuration' },
    status: 200
  };
}

/**
 * Simple connectivity test to backend
 */
export async function testBackendConnectivity(): Promise<ApiResponse<{ connected: boolean }>> {
  try {
    const response = await fetch(API_BASE_URL, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return {
      data: { connected: true },
      status: response.status
    };
  } catch (error) {
    return {
      data: { connected: false },
      error: error instanceof Error ? error.message : 'Connection failed',
      status: 0
    };
  }
}

/**
 * Transaction API interfaces
 */
export interface ApiTransaction {
  cardId: string;
  ageCat: string;
  trxDate: string;
  trxCode: string;
  trxAmount: number;
  trxCurrency: string;
  trxDesc: string;
  trxCity: string;
  trxCountry: string;
  trxMcc: string;
  mccDesc: string;
  mccGroup: string;
  isCardPresent: boolean;
  isPurchase: boolean;
  isCash: boolean;
  limitExhaustionCat: string;
}

export interface ApiCard {
  cardId: string;
  transactions: ApiTransaction[];
  transactionCount: number;
}

export interface ApiTransactionResponse {
  userId: number;
  cards: ApiCard[];
  totalTransactions: number;
  cardCount: number;
}

/**
 * Fetch user transactions from API (legacy - uses hardcoded user mapping)
 */
export async function fetchUserTransactions(userId: number = 3): Promise<ApiResponse<ApiTransactionResponse>> {
  const response = await apiGet<ApiTransactionResponse>(`/users/transactions?userId=${userId}`);
  
  // If 401 and we're in browser, handle redirect here too
  if (response.status === 401 && typeof window !== 'undefined') {
    removeAuthToken();
    window.location.href = '/auth/signin?message=Your session has expired. Please sign in again.';
  }
  
  return response;
}

/**
 * Fetch authenticated user's cards and transactions
 */
export async function fetchMyTransactions(): Promise<ApiResponse<ApiTransactionResponse>> {
  const response = await apiGet<ApiTransactionResponse>('/users/me/transactions');
  
  // If 401 and we're in browser, handle redirect here too
  if (response.status === 401 && typeof window !== 'undefined') {
    removeAuthToken();
    window.location.href = '/auth/signin?message=Your session has expired. Please sign in again.';
  }
  
  return response;
}

/**
 * Card response interface for /cards endpoint
 */
export interface ApiCardsResponse {
  cards: Array<{
    cardId: string;
    transactionCount: number;
  }>;
  count: number;
}

/**
 * Fetch all unique card IDs from API
 */
export async function fetchAllCards(): Promise<ApiResponse<ApiCardsResponse>> {
  // Public endpoint - no authentication required
  return apiGet<ApiCardsResponse>('/cards');
}

/**
 * Get backend base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Authentication API interfaces
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Login user and store token
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiPost<LoginResponse>('/auth/login', credentials);
  
  // Store token if login successful
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }
  
  return response;
}

/**
 * Register new user
 */
export async function register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  return apiPost<RegisterResponse>('/auth/register', userData);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: {name?: string; email?: string} }>> {
  return apiGet<{ user: {name?: string; email?: string} }>('/auth/me');
}

/**
 * Logout user (remove token and call backend)
 */
export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint if authenticated
    if (isAuthenticated()) {
      await apiPost('/auth/logout', {});
    }
  } catch (error) {
    // Don't block logout if backend call fails
    console.error('Backend logout failed:', error);
  } finally {
    // Always clear local token regardless of backend response
    removeAuthToken();
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Add card to user's account
 */
export async function addCardToUser(cardId: string): Promise<ApiResponse<{ message: string; card: unknown }>> {
  return apiPost<{ message: string; card: unknown }>('/users/cards', { cardId });
}