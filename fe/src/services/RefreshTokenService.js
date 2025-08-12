// API Base URL Configuration
const getApiBaseUrl = () => {
    const viteApiUrl = import.meta.env.VITE_API_URL;

    // Production'da boş string veya undefined ise relative paths kullan
    if (import.meta.env.PROD && (!viteApiUrl || viteApiUrl === '')) {
        return ''; // Same origin - nginx proxy'e güven
    }

    // Development'ta full URL veya fallback
    return viteApiUrl || 'http://localhost:8080';
};

class RefreshTokenService {
    constructor() {
        this.baseURL = getApiBaseUrl();
        this.isRefreshing = false;
        this.refreshPromise = null;

        console.log('RefreshTokenService initialized with baseURL:', this.baseURL);
    }

    // Token storage methods
    getToken() {
        return localStorage.getItem('token');
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    getUserId() {
        const userId = localStorage.getItem('userId');
        return userId ? parseInt(userId) : null;
    }

    storeTokens(accessToken, refreshToken, userId) {
        console.log('Storing tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, userId });

        if (accessToken) {
            // Bearer prefix'i varsa temizle, yoksa ekle
            const cleanToken = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
            localStorage.setItem('token', cleanToken);
        }

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }

        if (userId) {
            localStorage.setItem('userId', userId.toString());
        }
    }

    clearTokens() {
        console.log('Clearing all tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
    }

    // Token validation
    isTokenExpired(token) {
        if (!token) return true;

        try {
            // Bearer prefix'i varsa temizle
            const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
            const payload = JSON.parse(atob(cleanToken.split('.')[1]));
            const now = Date.now() / 1000;

            // 5 dakika margin ekle (token süresi dolmadan önce refresh et)
            return payload.exp < (now + 300);
        } catch (error) {
            console.error('Token validation error:', error);
            return true;
        }
    }

    // Main refresh token method
    async refreshAccessToken() {
        // Prevent multiple simultaneous refresh requests
        if (this.isRefreshing) {
            console.log('Refresh already in progress, waiting...');
            return this.refreshPromise;
        }

        const refreshToken = this.getRefreshToken();
        const userId = this.getUserId();

        if (!refreshToken || !userId) {
            console.error('No refresh token or user ID found');
            this.clearTokens();
            throw new Error('No refresh token available');
        }

        this.isRefreshing = true;

        try {
            const url = this.baseURL ? `${this.baseURL}/api/auth/refresh` : '/api/auth/refresh';

            console.log('Refreshing token with URL:', url);
            console.log('Refresh payload:', { userId, refreshToken: refreshToken.substring(0, 10) + '...' });

            this.refreshPromise = fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    refreshToken: refreshToken
                })
            });

            const response = await this.refreshPromise;

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Refresh token failed:', response.status, errorText);

                // Refresh token geçersiz, kullanıcıyı logout yap
                this.clearTokens();
                throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            console.log('Token refresh successful:', {
                accessToken: !!data.accessToken,
                refreshToken: !!data.refreshToken,
                message: data.message
            });

            // Yeni token'ları sakla
            if (data.accessToken) {
                this.storeTokens(data.accessToken, data.refreshToken, data.userId || userId);
                console.log('New tokens stored successfully');
            } else {
                throw new Error('No access token in refresh response');
            }

            return data;

        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearTokens();

            // Login sayfasına yönlendir (sadece browser ortamında)
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            throw error;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    // Ensure valid token (auto-refresh if needed)
    async ensureValidToken() {
        const currentToken = this.getToken();

        if (!currentToken) {
            throw new Error('No access token found');
        }

        // Token geçerli ise refresh etme
        if (!this.isTokenExpired(currentToken)) {
            console.log('Token is still valid');
            return currentToken;
        }

        console.log('Token expired, refreshing...');

        try {
            await this.refreshAccessToken();
            const newToken = this.getToken();

            if (!newToken) {
                throw new Error('Failed to get new token after refresh');
            }

            return newToken;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            throw error;
        }
    }

    // Legacy method for backward compatibility
    async RefreshToken() {
        try {
            const result = await this.refreshAccessToken();

            // Legacy response format döndür
            return {
                ok: true,
                json: async () => ({
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    message: result.message
                })
            };
        } catch (error) {
            console.error('Legacy RefreshToken method failed:', error);
            return {
                ok: false,
                statusText: error.message
            };
        }
    }

    // Logout method - refresh token'ı sunucudan sil
    async logout() {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            try {
                const url = this.baseURL ? `${this.baseURL}/api/auth/logout` : '/api/auth/logout';
                const token = this.getToken();

                await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': token })
                    },
                    body: JSON.stringify({
                        refreshToken: refreshToken
                    })
                });

                console.log('Logout request sent to server');
            } catch (error) {
                console.error('Logout error:', error);
                // Hata olsa da local storage'ı temizle
            }
        }

        this.clearTokens();

        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const refreshToken = this.getRefreshToken();

        // Token varsa ve süresi dolmamışsa authenticated
        if (token && !this.isTokenExpired(token)) {
            return true;
        }

        // Token süresi dolmuş ama refresh token varsa, potansiyel olarak authenticated
        if (refreshToken) {
            return true;
        }

        return false;
    }
}

const refreshTokenService = new RefreshTokenService();
export default refreshTokenService;

// Export individual methods for convenience
export const {
    refreshAccessToken,
    ensureValidToken,
    isTokenExpired,
    clearTokens,
    storeTokens,
    logout,
    isAuthenticated,
    RefreshToken // Legacy method
} = refreshTokenService;

// Fetch with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
    try {
        // Token'ın geçerli olduğundan emin ol
        const validToken = await refreshTokenService.ensureValidToken();

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': validToken,
                ...options.headers
            }
        });

        // 401 hatası alırsa token'ı yenile ve tekrar dene
        if (response.status === 401) {
            console.log('Received 401, attempting token refresh...');

            await refreshTokenService.refreshAccessToken();
            const newToken = refreshTokenService.getToken();

            if (!newToken) {
                throw new Error('Failed to refresh token');
            }

            // Retry with new token
            return fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': newToken,
                    ...options.headers
                }
            });
        }

        return response;
    } catch (error) {
        console.error('fetchWithAuth error:', error);
        throw error;
    }
};