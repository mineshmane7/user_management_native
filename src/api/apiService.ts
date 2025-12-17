import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import BASE_URL from './api';

// Types
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Logger utility
class Logger {
  private static formatLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, data || '');
  }

  static info(message: string, data?: any) {
    this.formatLog('INFO', message, data);
  }

  static error(message: string, data?: any) {
    this.formatLog('ERROR', message, data);
  }

  static warn(message: string, data?: any) {
    this.formatLog('WARN', message, data);
  }

  static debug(message: string, data?: any) {
    if (__DEV__) {
      this.formatLog('DEBUG', message, data);
    }
  }
}

// API Service Class
class ApiService {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Setup request and response interceptors
  private setupInterceptors() {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        Logger.info('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
        });

        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        return config;
      },
      (error: AxiosError) => {
        Logger.error('Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        Logger.info('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        Logger.error('API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });

        // Handle 401 Unauthorized - Token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            Logger.info('Attempting to refresh token...');
            const newToken = await this.refreshAuthToken();
            
            if (newToken) {
              this.setAuthToken(newToken);
              originalRequest.headers!.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            Logger.error('Token refresh failed:', refreshError);
            // Clear token and redirect to login
            this.clearAuthToken();
            // You can emit an event here to navigate to login screen
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Handle errors consistently
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: (error.response.data as any)?.message || error.message,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your internet connection.',
        status: 0,
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Token management
  setAuthToken(token: string) {
    this.authToken = token;
    Logger.info('Auth token set');
  }

  clearAuthToken() {
    this.authToken = null;
    Logger.info('Auth token cleared');
  }

  private async refreshAuthToken(): Promise<string | null> {
    // Implement your token refresh logic here
    // This is a placeholder - customize based on your auth flow
    try {
      // Example: Call refresh token endpoint
      // const response = await this.post('/auth/refresh', { refreshToken });
      // return response.data.accessToken;
      
      Logger.warn('Token refresh not implemented');
      return null;
    } catch (error) {
      throw error;
    }
  }

  // GET Request
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // POST Request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // PUT Request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // PATCH Request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // DELETE Request
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Generic request method for custom configurations
  async request<T = any>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

export { apiService, ApiService, Logger };
export type { ApiResponse, ApiError };
