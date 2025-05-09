import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/posts")
            .then(response => response.json())
            .then(data => {
                    setPosts(data);
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                })
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
            <div>
                {posts.map(post => (
                    <Container fixed style={{
                        display: "flex"
                        , justifyContent: "center"
                        , alignItems: "center"
                        , height: "100vh",
                        width: "800",
                        flexWrap: "wrap",
                        backgroundColor: "#e5e8e8"
                    }}>
                        <Post
                            key={post.id}
                            title={post.title}
                            content={post.content}
                            authorUsername={post.authorUsername}
                            userId={post.userId}
                            commentCount = {post.commentCount}
                            likeCount = {post.likeCount}
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