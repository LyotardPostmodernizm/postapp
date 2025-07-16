import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";
import Postform from "../components/Post/Postform.jsx";
import {AnimatedBackground} from 'animated-backgrounds';
import {makeAuthenticatedRequest} from "../services/ApiService.js";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("");
    const [avatar, setAvatar] = useState(1);


    const refreshPosts = () => {
        fetch("/posts")
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
            <div>
                Error!!!
            </div>
        )
    } else if (loading) {
        return (
            <div>
                Loading...
            </div>
        )
    } else {
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
                        />
                    </Container>
                ))}
            </div>
        );
    }
}


export default Home;