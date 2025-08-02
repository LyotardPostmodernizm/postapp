export const RefreshToken = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            refreshToken: localStorage.getItem("refreshToken")
        })
    });
};