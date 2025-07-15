export const RefreshToken = () => {
    return fetch("http://localhost:8080/auth/refresh", {
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