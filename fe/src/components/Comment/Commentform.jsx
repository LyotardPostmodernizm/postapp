import React, {useState} from 'react';
import './Comment.scss';

import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {InputAdornment, OutlinedInput, TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import IconButton from "@mui/material/IconButton";

const Commentform = ({userId, postId, userName, text}) => {

    const [content, setContent] = useState("");

    const handleSubmitOnPost = () => {
        fetch("/comments/posts/" + (postId), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: content,
                userId: userId,
                postId: postId,
            })
        }).then(r => r.json())
            .catch(e => console.log(e))
            .then(data => {
                    console.log(data)
                }
            )
        setContent("");
    }


    return (
        <OutlinedInput
            className={"commentInput"}
            id="outlined-required"
            multiline
            fullWidth
            value={content}
            placeholder={text}
            onChange={(e) => {
                setContent(e.target.value)
            }}
            inputProps={{maxLength: 250}}
            startAdornment={
                <InputAdornment position="start">
                    <Link className="userLink" to={{pathname: "/users/" + userId}}>
                        <Avatar
                            sx={{bgcolor: red[500]}}
                            aria-label="recipe">
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Link>
                </InputAdornment>}

            endAdornment={
                <InputAdornment position="end">
                    <IconButton onClick={handleSubmitOnPost} aria-label="send">
                        <SendIcon color={"primary"}/>
                    </IconButton>
                </InputAdornment>}
        />


    )
}
export default Commentform;