import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";
import Postform from "../components/Post/Postform.jsx";
import {AnimatedBackground} from 'animated-backgrounds';
import {makeAuthenticatedRequest} from "../services/ApiService.js";
import {styled, keyframes} from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {CircularProgress} from "@mui/joy";
import Button from "@mui/material/Button";

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(90deg,rgba(67, 144, 222, 1) 100%, rgba(87, 199, 133, 1) 78%, rgba(237, 221, 83, 1) 100%);',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    }
}));

const LoadingContent = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    color: 'white',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
    animation: `${pulse} 2s ease-in-out infinite`,
    marginBottom: theme.spacing(3),
    '& .MuiCircularProgress-circle': {
        strokeLinecap: 'round',
    },
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    }
}));

const ErrorContent = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    color: 'white',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    maxWidth: 500,
    margin: '0 auto',
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
    fontSize: 80,
    marginBottom: theme.spacing(2),
    animation: `${pulse} 2s ease-in-out infinite`,
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
}));

const RetryButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    },
}));

const LoadingDots = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    '& .dot': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.7)',
        animation: `${pulse} 1.5s ease-in-out infinite`,
        '&:nth-of-type(1)': { animationDelay: '0s' },
        '&:nth-of-type(2)': { animationDelay: '0.2s' },
        '&:nth-of-type(3)': { animationDelay: '0.4s' },
    }
}));


function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("");
    const [avatar, setAvatar] = useState(1);


    const refreshPosts = () => {
        fetch("/api/posts")
            .then(response => response.json())
            .then(data => {
                    setPosts(data);
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                    console.log(error)
                }
            )
    }
    const addNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    const removePost = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
    const updatePost = (postId, updatedPostData) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, ...updatedPostData }
                    : post
            )
        );
    }

    const retrieveUserData = async (userId) => {
        try {
            const response = await makeAuthenticatedRequest(`/users/${userId}`,
                {method: "GET"})

            if(!response){
                console.log("Kullanıcı bilgileri null olarak alındı. Kullanıcı, çıkış yapmış olabilir.")
            }

            if (response.ok) {
                const data = await response.json();
                setUserName(data.username);
                setAvatar(data.avatar);
            }
            else {
                console.log("Error Home avatar - Response status:", response.status);
                const errorData = await response.json();
                console.log("Error details:", errorData);
            }

        }
        catch (e) {
            console.log("Username fetch hatası:",e)
            setError(e)
            setLoading(false)
        }
    };

    useEffect(() => {
        refreshPosts();
        {
            if (localStorage.getItem("userId") != null) {
                retrieveUserData(localStorage.getItem("userId"));
            }

        }

    }, [])


    if (error) {
        return (
            <ErrorContainer>
                <ErrorContent>
                    <ErrorIcon />
                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
                        Oops! Bir Hata Oluştu
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                        Gönderiler yüklenirken bir sorun yaşandı
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
                        Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin
                    </Typography>

                    <RetryButton
                        onClick={refreshPosts}
                        startIcon={<RefreshIcon />}
                        size="large"
                    >
                        Tekrar Dene
                    </RetryButton>
                </ErrorContent>
            </ErrorContainer>
        );
    }

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingContent>
                    <HomeIcon sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />

                    <StyledCircularProgress
                        size={"80"}
                        thickness={4}
                        sx={{ color: 'white' }}
                    />

                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                        Ana Sayfa Yükleniyor
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                        En son gönderiler getiriliyor...
                    </Typography>

                    <LoadingDots>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </LoadingDots>
                </LoadingContent>
            </LoadingContainer>
        );
    }
    else {
        return (

            <div className={"homeContainer"}>
                <AnimatedBackground animationName="fireflyForest"
                                    blendMode="normal"/>

                <Container className={"home"} fixed>
                    {localStorage.getItem("userId") != null ? <Postform
                        authorUsername={userName}
                        authorAvatar={avatar}
                        userId={localStorage.getItem("userId")}
                        refreshPosts={refreshPosts}
                        addNewPost={addNewPost}
                    /> : null}

                </Container>

                {posts.map((post, index) => (
                    <Container className={"home"} fixed
                               key={post.id}>
                        <Post
                            key={post.id}
                            postId={post.id}
                            avatar={post.avatar}
                            title={post.title}
                            content={post.content}
                            authorUsername={post.authorUsername}
                            userId={post.userId}
                            commentCount={post.commentCount}
                            likeCount={post.likeCount}
                            createdAt={post.createdAt}
                            updatedAt={post.updatedAt}
                            currentUserAvatar={avatar}
                            currentUserUsername={userName}
                            onPostDeleted={removePost}
                            onPostUpdated={updatePost}

                        />
                    </Container>
                ))}
            </div>
        );
    }
}


export default Home;