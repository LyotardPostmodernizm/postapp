import React, {useState} from 'react';
import './Comment.scss';

import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {InputAdornment, OutlinedInput, TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import IconButton from "@mui/material/IconButton";
import {makeAuthenticatedRequest} from "../../services/ApiService.js";

const Commentform = ({userId, avatar, postId, commentId, text, setCommentsRefresh, isReplyToComment,isReply=false}) => {

    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        if (!content.trim()) {
            return;
        }

        if (isReplyToComment) {
            await handleSubmitOnComment(commentId, content);
        } else {
            await handleSubmitOnPost(postId, content);
        }
    };



    //Posta yorum yazma
    const handleSubmitOnPost = async (postId, content) => {
        try {
            const response = await makeAuthenticatedRequest(`/comments/posts/${postId}`, {
                method: "POST", body: JSON.stringify({
                    text: content,
                })
            });
            if (response.ok) {
                const result = await response.json();
                console.log("Gönderiye yorum başarıyla gönderildi:", result);
                setContent("");
                setCommentsRefresh();
            }

        } catch (error) {
            console.error("Yorum gönderme hatası:", error);
        }

    }

    // Commente yorum yazma
    const handleSubmitOnComment = async (commentId, content) => {
        try {
            const response = await makeAuthenticatedRequest(`/comments/${commentId}/replies`, {
                method: "POST", body: JSON.stringify({
                    text: content,
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Yoruma cevap başarıyla gönderildi:", result);
                setContent("");
                setCommentsRefresh();
            }
        } catch (error) {
            console.error("Yorum gönderme hatası:", error);
        }
    };


    return (
        <OutlinedInput
            className={isReply ? "commentInput replyInput" : "commentInput mainInput"}
            id="outlined-required"
            multiline
            fullWidth
            value={content}
            placeholder={text}
            size={isReply ? "small" : "medium"}
            onChange={(e) => {
                setContent(e.target.value)
            }}
            inputProps={{maxLength: 250}}
            startAdornment={
                <InputAdornment position="start">
                    <Link className="userLink" to={{pathname: "/users/" + userId}}>
                        <Avatar
                            aria-label="recipe"
                            src={`/public/Avatars/avatar${avatar}.png`}
                            sx={{width: isReply ? 32 : 40, height: isReply ? 32 : 40}}
                        />
                    </Link>
                </InputAdornment>
            }
            endAdornment={
                <InputAdornment position="end">
                    <IconButton onClick={handleSubmit} aria-label="send" size={isReply ? "small" : "medium"}>
                        <SendIcon color={"primary"} fontSize={isReply ? "small" : "medium"} />
                    </IconButton>
                </InputAdornment>
            }
        />
    )

}
export default Commentform;