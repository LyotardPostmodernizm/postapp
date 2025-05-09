import React from 'react';
import './Post.scss';

function Post(props) {
    const {title,content} = props;
    return (
        <div className={"postContainer"}>
            <h1>{title}</h1>
            <p>{content}</p>
        </div>
    )

}

export default Post;