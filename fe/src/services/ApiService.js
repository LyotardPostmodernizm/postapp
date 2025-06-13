
import { RefreshToken } from "./RefreshTokenService.js"; // Bu satırı ekleyin

export const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    // Eğer token yoksa, önce refresh token deniyoruz
    if (!token) {
        console.log("Token yok, refresh token deneniyor...");
        try {
            const refreshResponse = await RefreshToken();
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem("token", refreshData.accessToken);
                console.log("Token başarıyla yenilendi");
            } else {
                console.log("Refresh token başarısız, login'e yönlendiriliyor");
                logout();
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.log("Refresh token hatası:", error);
            logout();
            throw error;
        }
    }

    // Şimdi token ile normal isteği gönderiyoruz
    const finalToken = localStorage.getItem("token");
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${finalToken}`,
            ...options.headers
        }
    });

    // Eğer yine 401 alıyorsak, yine refresh token deniyoruz.
    if (response.status === 401) {
        try {
            const refreshResponse = await RefreshToken();
            if (!refreshResponse.ok) {
                logout();
                throw new Error('Authentication failed');
            }

            const refreshData = await refreshResponse.json();
            localStorage.setItem("token", refreshData.accessToken);

            // Yeni token ile tekrar deniyoruz
            return await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${refreshData.accessToken}`,
                    ...options.headers
                }
            });
        } catch (error) {
            logout();
            throw error;
        }
    }

    return response;
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
};