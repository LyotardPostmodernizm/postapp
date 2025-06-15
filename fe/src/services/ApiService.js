import {RefreshToken} from "./RefreshTokenService.js";


    export const makeAuthenticatedRequest = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        // Attempt token refresh if token is missing but refreshToken exists
        if (!token && refreshToken) {
            try {
                const refreshResponse = await RefreshToken();
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    localStorage.setItem("token", refreshData.accessToken);

                    // Add this critical line to persist the new refresh token
                    if (refreshData.refreshToken) {
                        localStorage.setItem("refreshToken", refreshData.refreshToken);
                    }
                } else {
                    logout();
                    return;
                }
            } catch (error) {
                console.error("Token refresh error:", error);
                logout();
                return;
            }
        }

        // Proceed with request
        const finalToken = localStorage.getItem("token");
        try {
            let response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": finalToken,
                    ...options.headers
                }
            });

            // Handle 401 Unauthorized responses
            if (response.status === 401 && refreshToken) {
                const refreshResponse = await RefreshToken();
                if (!refreshResponse.ok) {
                    logout();
                    return;
                }

                const refreshData = await refreshResponse.json();
                localStorage.setItem("token", refreshData.accessToken);

                // Persist new refresh token if provided
                if (refreshData.refreshToken) {
                    localStorage.setItem("refreshToken", refreshData.refreshToken);
                }

                // Retry original request with new token
                response = await fetch(url, {
                    ...options,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": refreshData.accessToken,
                        ...options.headers
                    }
                });
            }

            return response;
        } catch (error) {
            console.error("Request failed:", error);
            throw error;
        }
    };

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login"; // Kullanıcıyı login sayfasına yönlendiriyoruz
};