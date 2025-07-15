import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";
import Postform from "../components/Post/Postform.jsx";
import {AnimatedBackground} from 'animated-backgrounds';
import {logout, makeAuthenticatedRequest} from "../services/ApiService.js";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState("");


    const refreshPosts = () => {
        fetch("/posts")
            .then(response => response.json())
            .then(data => {
                    setPosts(data);
                    console.log("posts:" + data)
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

    const retrieveUsername = async (userId) => {
    try {
        const response = makeAuthenticatedRequest(`/users/${userId}`,
            {method: "GET"})

        if (response.ok) {
            const data = await response.json();
            console.log("username: ", data.username)
            setUserName(data.username);
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
                retrieveUsername(localStorage.getItem("userId"));
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


export default Home