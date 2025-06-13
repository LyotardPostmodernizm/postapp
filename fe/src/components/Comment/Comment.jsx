import React, {useState} from 'react';
import './Comment.scss';
import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {InputAdornment, OutlinedInput, TextField, Tooltip} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Typography from "@mui/material/Typography";
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from "@mui/material/IconButton";
import Commentform from "./Commentform.jsx";
import Box from "@mui/material/Box";

const Comment = ({text, userId,postId, userName, createdAt, updatedAt}) => {
    const [liked, setLiked] = useState(false);
    const [isReplying, setIsReplying] = useState(false);


    return (
        <>
            <Typography className={"userInfoRow"} variant="h6">
                <IconButton>
                    <Link
                        className="userLink"
                        to={{pathname: "/users/" + userId}}>
                        <Avatar
                            sx={{bgcolor: red[500], marginRight: "10px"}}
                            aria-label="recipe">
                            {userName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Link>
                    <Link className="userLink" to={{pathname: "/users/" + userId}}>
                        <Typography
                            variant="body2"
                            color="blue"
                            fontFamily={"Arial"}
                            fontStyle={"italic"}
                            fontSize={"20px"}
                        >
                            {userName}
                        </Typography></Link>
                </IconButton>

                {updatedAt ? (
                        <Typography variant="subtitle1" style={{marginTop: "10px", fontStyle: "italic"}}>
                            Güncelleme Tarihi: {updatedAt}
                        </Typography>
                    )
                    :
                    <Typography variant="subtitle1" style={{marginTop: "10px", fontStyle: "italic"}}>
                        Oluşturma Tarihi: {createdAt}
                    </Typography>}
            </Typography>

            <div className="relativeContainer">
                <OutlinedInput
                    id="outlined-adornment-amount"
                    multiline
                    fullWidth
                    value={text}
                    disabled
                    style={{
                        backgroundColor: "white",
                        color: "black",
                        border: "none",
                        fontSize: "15px",
                        fontFamily: "Arial",
                    }}
                />
                <Tooltip title="Yoruma cevap ver">
                    <AddCircleIcon color={isReplying ? "disabled" : "default"}
                        onClick={() => {
                            setIsReplying(isReplying => !isReplying)
                        }}
                        className="absoluteIcon"
                    />
                </Tooltip>
                <Tooltip title={liked ? "Beğeniyi kaldır" : "Yorumu beğen"}>
                    <FavoriteIcon
                        style={{color: liked ? "red" : undefined}}
                        onClick={() => setLiked(liked => !liked)}
                        className="absoluteIcon2"
                    />
                </Tooltip>
            </div>
            {isReplying && (
                localStorage.getItem("userId") != null ?
                <Box className="replyForm">
                    <Commentform
                        userId={userId}
                        postId={postId}
                        userName={userName}
                        text={"Yoruma cevap yazın..."}
                        setCommentsRefresh={setCommentsRefresh}
                        isReplyToComment={true}

                    />
                </Box> : null
            )}


        </>)
}
export default Comment;