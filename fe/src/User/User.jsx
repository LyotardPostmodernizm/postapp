import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import Avatar from '../components/Avatar/Avatar.jsx';
import Typography from "@mui/material/Typography";
import UserActivity from "./UserActivity.jsx";
import {makeAuthenticatedRequest} from "../services/ApiService.js";

function User() {
    const {userId} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getUser = async () => {
        try {
            setLoading(true);
            setError(null);


            const response = await fetch(`/api/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Kullanıcı bulunamadı!');
                } else if (response.status === 401) {
                    throw new Error('Bu sayfaya erişim izniniz yok!');
                } else {
                    throw new Error(`Kullanıcı bilgileri alınamadı! (${response.status})`);
                }
            }

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Kullanıcı bilgileri getirilirken hata oluştu:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const refreshUser = () => {
        getUser();
    };

    const getUserWithAuth = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/users/${userId}`, {
                method: "GET"
            });

            if (!response || !response.ok) {
                throw new Error('Kimlik doğrulamalı kullanıcı bilgileri alınamadı!');
            }

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Kimlik doğrulamalı kullanıcı bilgileri alınırken hata:", error);
            // Fallback olarak public endpoint'i dene
            await getUser();
        }
    }

    useEffect(() => {
        if (userId) {
            getUser();
        }
    }, [userId]);

    if (loading) {
        return (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <Typography variant="h6">Kullanıcı bilgileri yükleniyor...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <Typography variant="h6" color="error">
                    Hata: {error}
                </Typography>
                <button onClick={() => getUser()} style={{marginTop: '10px'}}>
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <Typography variant="h6">Kullanıcı bulunamadı!</Typography>
            </div>
        );
    }

    const currentUserId = localStorage.getItem("userId");
    const isOwnProfile = currentUserId && user.id === parseInt(currentUserId);

    if (!isOwnProfile) {
        return (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <Typography variant="h6">Bu kullanıcı profiline erişim izniniz yok!</Typography>
                <button onClick={() => navigate('/')} style={{marginTop: '10px'}}>
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    return (
        <div>
            <Avatar
                userId={user.id}
                avatarId={user.avatar}
                username={user.username}
                fullName={user.fullName}
                email={user.email}
                commentCount={user.commentCount}
                postCount={user.postCount}
                likeCount={user.likeCount}
                onUserUpdated={refreshUser}
            />

            {isOwnProfile && <UserActivity userId={user.id}/>}
        </div>
    )
}

export default User;