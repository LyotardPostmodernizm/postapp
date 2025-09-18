import refreshTokenService from './RefreshTokenService.js';

const getApiBaseUrl = () => {
    const viteApiUrl = import.meta.env.VITE_API_URL;

    if (import.meta.env.PROD && (!viteApiUrl || viteApiUrl === '')) {
        return '';
    }

    return viteApiUrl || 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Public API call
    async publicApiCall(endpoint, options = {}) {
        const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const responseText = await response.text();

            if (!response.ok) {
                // JSON formatında hata mesajı olup olmadığını kontrol ediyoruz önce
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    // JSON değilse, metin olarak kullanıyoruz
                    errorMessage = responseText || errorMessage;
                }
                console.error(`HTTP Error ${response.status}:`, errorMessage);
                throw new Error(errorMessage);
            }

            // Başarılı yanıtı JSON'a çevir
            try {
                return JSON.parse(responseText);
            } catch (e) {
                return responseText;
            }
        } catch (error) {
            console.error('Public API call failed:', error);
            throw error;
        }
    }

    // Authenticated API call
    async authenticatedApiCall(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!token && refreshToken) {
            try {
                await refreshTokenService.refreshAccessToken();
            } catch (error) {
                console.error("Token refresh error:", error);
                this.logout();
                throw new Error('Authentication required');
            }
        }

        const finalToken = localStorage.getItem("token");
        if (!finalToken) {
            throw new Error('No authentication token available');
        }

        const cleanToken = finalToken.replace('Bearer ', '');
        const authHeader = `Bearer ${cleanToken}`;

        const url = this.baseURL
            ? `${this.baseURL}${endpoint}`
            : endpoint;

        try {
            let response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader,
                    ...options.headers
                }
            });

            if (response.status === 401 && refreshToken) {
                console.log('Received 401, attempting token refresh...');

                try {
                    await refreshTokenService.refreshAccessToken();
                    const newToken = localStorage.getItem("token");
                    const newCleanToken = newToken.replace('Bearer ', '');
                    const newAuthHeader = `Bearer ${newCleanToken}`;

                    response = await fetch(url, {
                        ...options,
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": newAuthHeader,
                            ...options.headers
                        }
                    });
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    this.logout();
                    throw new Error('Authentication failed');
                }
            }

            if (!response.ok) {
                const responseText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = responseText || errorMessage;
                }
                console.error(`HTTP Error ${response.status}:`, errorMessage);
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('Authenticated API call failed:', error);
            throw error;
        }
    }

    // Logout helper
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    // ===== Public API Methods =====
    async healthCheck() {
        return this.publicApiCall('/api/health');
    }

    async getAllPostsPublic() {
        return this.publicApiCall('/api/posts', { method: 'GET' });
    }

    async getPostByIdPublic(postId) {
        return this.publicApiCall(`/api/posts/${postId}`);
    }

    // ===== Auth (No Authentication Required for these) =====
    async login(credentials) {
        return this.publicApiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        return this.publicApiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async refreshToken(refreshTokenData) {
        return this.publicApiCall('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify(refreshTokenData)
        });
    }

    // ===== Authenticated API Methods =====
    async getCurrentUser() {
        return this.authenticatedApiCall('/api/users/me');
    }

    async getUserById(userId) {
        return this.authenticatedApiCall(`/api/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.authenticatedApiCall(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.authenticatedApiCall(`/api/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async getUserActivity(userId) {
        return this.authenticatedApiCall(`/api/users/activity/${userId}`);
    }

    async createPost(postData) {
        return this.authenticatedApiCall('/api/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(postId, postData) {
        return this.authenticatedApiCall(`/api/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(postId) {
        return this.authenticatedApiCall(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
    }

    async getPostsByUserId(userId) {
        return this.authenticatedApiCall(`/api/posts?userId=${userId}`);
    }

    async createCommentOnPost(postId, commentData) {
        return this.authenticatedApiCall(`/api/comments/posts/${postId}`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    async createReplyToComment(commentId, replyData) {
        return this.authenticatedApiCall(`/api/comments/${commentId}/reply`, {
            method: 'POST',
            body: JSON.stringify(replyData)
        });
    }

    async loadComments(postId) {
        return this.publicApiCall(`/api/comments?postId=${postId}&parentId=0`, { method: 'GET' });
    }

    async updateComment(commentId, commentData) {
        return this.authenticatedApiCall(`/api/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    }

    async deleteComment(commentId) {
        return this.authenticatedApiCall(`/api/comments/${commentId}`, {
            method: 'DELETE'
        });
    }

    async createLike(likeData) {
        return this.authenticatedApiCall('/api/likes', {
            method: 'POST',
            body: JSON.stringify(likeData)
        });
    }

    async deleteLike(likeId, userId) {
        return this.authenticatedApiCall(`/api/likes/${likeId}?userId=${userId}`, {
            method: 'DELETE'
        });
    }

    async getLikesByUserIdAndPostId(userId, postId) {
        return this.authenticatedApiCall(`/api/likes?userId=${userId}&postId=${postId}`, { method: 'GET' });
    }

    async getLikesByUserIdAndCommentId(userId, commentId) {
        return this.authenticatedApiCall(`/api/likes?userId=${userId}&commentId=${commentId}`, { method: 'GET' });
    }
}

const apiService = new ApiService();
export default apiService;

export const makeAuthenticatedRequest = (url, options = {}) => {
    return apiService.authenticatedApiCall(url, options);
};
