import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import Avatar from '../components/Avatar/Avatar.jsx';
import Typography from "@mui/material/Typography";
import UserActivity from "./UserActivity.jsx";
import {makeAuthenticatedRequest} from "../services/ApiService.js";

function User() {
    const {userId} = useParams();
    const [user, setUser] = React.useState(null);


    const getUser = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/users/${userId}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Kullanıcı bilgileri alınamadı!');
            }

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error("Kullanıcı bilgileri getirilirken bir hata ile karşılaşıldı:", error);
        }
    }
    //Daha sonra, güvenlik iyileştirme için kullanılabilir bu method.
    const getUserResponseMe = async () => {
        try {
            const response = await fetch("/users/me", {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Kullanıcı bilgileri başarıyla çekildi", data);
                setUser(data);
            } else {
                console.error("Kullanıcı bilgileri alınamadı:", response.statusText);
            }
        } catch (e) {
            console.error("Kullanıcı bilgileri çekilirken hata ile karşılaşıldı: " + e);
        }
    }

    useEffect(() => {
        if (localStorage.getItem("token")) {
            getUser();
        }
    }, [userId]);

    if (!user) {
        return <Typography variant="h6">Kullanıcı bilgileri yükleniyor...</Typography>;
    }
    if (user.id !== parseInt(userId)) {
        return <Typography variant="h6">Bu kullanıcıya erişim izniniz yok!</Typography>;
    }
    return (
        <div>
            <Avatar userId={user.id} avatarId={user.avatar} username={user.username} fullName={user.fullName} email={user.email}
                    commentCount={user.commentCount}
                    postCount={user.postCount} likeCount={user.likeCount}/>

            {localStorage.getItem("userId") === userId ? <UserActivity userId={user.id}/> : null}


        </div>
    )
}

export default User