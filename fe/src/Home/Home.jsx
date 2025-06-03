import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";
import Postform from "../components/Post/Postform.jsx";
import {AnimatedBackground} from 'animated-backgrounds';

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
    const retrieveUsername = (userId) => {
        fetch("/users/" + userId)
            .then(response => response.json())
            .then(data => {
                    console.log("username:" + data.username)
                    setUserName(data.username);
                },
                error => {
                    setError(error);
                    setLoading(false);
                }
            )
    }

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
                    /> : null}

                </Container>

                {posts.map((post, index) => (
                    <Container className={"home"} fixed
                               key={index}>
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