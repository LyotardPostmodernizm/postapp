import React, {useEffect, useState} from 'react';
import Post from "../components/Post/Post.jsx";
import './Home.scss';

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
                    <Post 
                        key={post.id}
                        title={post.title}
                        content={post.content}
                    />
                ))}
            </div>
        );
    }
}


export default Home