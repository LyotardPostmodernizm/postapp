import {RefreshToken} from "./RefreshTokenService.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


export const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // Eğer token yoksa ama refreshToken varsa, refresh deniyoruz
    if (!token && refreshToken) {
        try {
            const refreshResponse = await RefreshToken();
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem("token", refreshData.accessToken);

                if (refreshData.refreshToken) {
                    localStorage.setItem("refreshToken", refreshData.refreshToken);
                }
            } else {
                logout();
                return null;
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            logout();
            return null;
        }
    }



    const finalToken = localStorage.getItem("token");

    // Token'dan Bearer prefix'ini temizliyoruz ve tekrar ekliyoruz
    const cleanToken = finalToken ? finalToken.replace('Bearer ', '') : null;
    const authHeader = cleanToken ? `Bearer ${cleanToken}` : null;

    const fullUrl = url.startsWith('/api') ? url : `${API_BASE_URL}${url}`;

    try {
        let response = await fetch(fullUrl, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
                ...options.headers
            }
        });

        // 401 durumunda refresh token deniyoruz
        if (response.status === 401 && refreshToken) {

            const refreshResponse = await RefreshToken();
            if (!refreshResponse.ok) {
                logout();
                return null;
            }

            const refreshData = await refreshResponse.json();
            localStorage.setItem("token", refreshData.accessToken);

            if (refreshData.refreshToken) {
                localStorage.setItem("refreshToken", refreshData.refreshToken);
            }

            // Yeni token ile tekrar deniyoruz
            const newCleanToken = refreshData.accessToken.replace('Bearer ', '');
            const newAuthHeader = `Bearer ${newCleanToken}`;

            response = await fetch(fullUrl, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": newAuthHeader,
                    ...options.headers
                }
            });
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    console.log("Çıkış yapılıyor...");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
};