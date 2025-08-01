import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import Avatar from '../components/Avatar/Avatar.jsx';
import Typography from "@mui/material/Typography";
import UserActivity from "./UserActivity.jsx";
import {makeAuthenticatedRequest} from "../services/ApiService.js";
import {AnimatedBackground} from 'animated-backgrounds';
import {styled} from "@mui/material/styles";
import {Alert, Container, Fade} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {CircularProgress} from "@mui/joy";

const StyledContainer = styled(Container)(({theme}) => ({
    minHeight: '100vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const LoadingBox = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: theme.spacing(4),
}));

const ErrorBox = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: theme.spacing(4),
}));

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

    useEffect(() => {
        if (userId) {
            getUser();
        }
    }, [userId]);

    if (loading) {
        return (
            <StyledContainer maxWidth="lg">
                <Fade in={loading}>
                    <LoadingBox>
                        <CircularProgress size={"60"} thickness={4}/>
                        <Typography variant="h6" sx={{mt: 3, color: 'text.secondary'}}>
                            Kullanıcı bilgileri yükleniyor...
                        </Typography>
                    </LoadingBox>
                </Fade>
            </StyledContainer>
        );
    }

    if (error) {
        return (
            <StyledContainer maxWidth="lg">
                <ErrorBox>
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6" component="div">
                            {error}
                        </Typography>
                    </Alert>
                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center'}}>
                        <Button
                            onClick={() => getUser()}
                            variant="contained"
                            size="large"
                            sx={{borderRadius: 3}}
                        >
                            Tekrar Dene
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outlined"
                            size="large"
                            sx={{borderRadius: 3}}
                        >
                            Ana Sayfaya Dön
                        </Button>
                    </Box>
                </ErrorBox>
            </StyledContainer>
        );
    }

    if (!user) {
        return (
            <StyledContainer maxWidth="lg">
                <ErrorBox>
                    <Alert
                        severity="warning"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="h6">
                            Kullanıcı bulunamadı!
                        </Typography>
                    </Alert>
                    <Button
                        onClick={() => navigate('/')}
                        variant="contained"
                        size="large"
                        sx={{borderRadius: 3}}
                    >
                        Ana Sayfaya Dön
                    </Button>
                </ErrorBox>
            </StyledContainer>
        );
    }


    const currentUserId = localStorage.getItem("userId");
    const isOwnProfile = currentUserId && user.id === parseInt(currentUserId);

    return (
        <>
        <AnimatedBackground animationName="fireflyForest"
                            blendMode="normal"/>
        <StyledContainer maxWidth="lg">
            <Fade in={!loading}>
                <Box>
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
                        isOwnProfile={isOwnProfile}
                    />
                    {isOwnProfile && (
                        <Box sx={{mt: 4}}>
                            <UserActivity userId={user.id}/>
                        </Box>
                    )}
                </Box>
            </Fade>
        </StyledContainer>
        </>
    )
}

export default User;