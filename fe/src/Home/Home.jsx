import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';
import {Container} from "@mui/material";
import Postform from "../components/Post/Postform.jsx";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const refreshPosts = () => {
        fetch("/posts")
            .then(response => response.json())
            .then(data => {
                    setPosts(data);
                    console.log("posts:"+data)
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                    console.log(error)
                }
            )
    }

    useEffect(() => {
        refreshPosts();
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
                {posts.map((post, index) => (
                    <Container className={"home"} fixed style={{
                        display: "flex"
                        , justifyContent: "center"
                        , alignItems: "center"
                        , height: "auto",
                        width: "800",
                        flexWrap: "wrap",
                        backgroundColor: "#e5e8e8",
                        marginBottom: "1rem"

                    }}
                               key={index}>
                        { /* <Postform
                                  authorUsername={post.authorUsername}
                                  userId={post.userId}
                                  refreshPosts={refreshPosts}
                        /> */}
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