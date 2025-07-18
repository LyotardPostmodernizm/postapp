import React from 'react';
import {useState} from 'react';
import './Post.scss';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {red} from '@mui/material/colors';
import {Link} from "react-router-dom";
import {InputAdornment, Snackbar, TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import {makeAuthenticatedRequest} from "../../services/ApiService.js";

function Postform(props) {
    const {authorAvatar, userId, refreshPosts, addNewPost} = props;
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("Başlık ve içerik boş olamaz!");
            return;
        }
        setIsLoading(true);

        try {
            const newPost = await savePost();
            if (newPost) {

                addNewPost(newPost);
                setIsSent(true);
                setTitle("");
                setContent("");
                refreshPosts();
            }
        } catch (error) {
            console.error("Post gönderme hatası:", error);
            alert("Post gönderilirken bir hata oluştu!");
        } finally {
            setIsLoading(false);
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsSent(false);
    }
    const savePost = async () => {
        try {
            const response = await makeAuthenticatedRequest("/posts", {
                method: "POST",
                body: JSON.stringify({
                    title: title,
                    content: content,
                    userId:parseInt(userId),
                })
            });

            if (response && response.ok) {
                const result = await response.json();
                console.log("Post başarıyla gönderildi:", result);
                return result;
            }
            else{
                console.log("Post gönderme hatası:",response?.status);
            }
        } catch (error) {
            console.error("Post gönderme hatası:", error);
            throw error;
        }

    };


    return (
        <>
        <Snackbar
            open={isSent}
            onClose={handleClose}
            autoHideDuration={1000}
            message="Gönderi Başarılı"
            action
            sx={{ bottom: { xs: 90, sm: 0 } }}
        />
        <div className="postContainer">
            <Card className="card">
                <CardHeader
                    avatar={
                        <Link className="userLink" to={{pathname: "/users/" + userId}}>
                            <Avatar
                                    aria-label="recipe"
                                    src={`/public/Avatars/avatar${authorAvatar}.png`}>
                            </Avatar>
                        </Link>
                    }
                    action
                    subheader={
                        <TextField
                            label="Başlık Gereklidir"
                            id="outlined-start-adornment"
                            multiline
                            fullWidth
                            required
                            value={title}
                            disabled={isLoading}
                            onChange={(e) => {setTitle(e.target.value)
                                             setIsSent(false)}}
                        />
                    }
                />

                <CardContent>
                    <Typography
                        variant="body2"
                        className="typography"
                        sx={{color: 'text.secondary'}}
                    >
                        {<TextField
                            label="İçerik Gereklidir"
                            id="outlined-start-adornment"
                            multiline
                            fullWidth
                            required
                            value={content}
                            disabled={isLoading}
                            onChange={(e) => {setContent(e.target.value)
                                              setIsSent(false)}}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        aria-label="send">
                                        <SendIcon color={isLoading? "disabled":"primary"}/>
                                    </IconButton>
                                    </InputAdornment>
                                }
                            }}
                        />}
                    </Typography>
                </CardContent>

            </Card>
        </div>
        </>
    );


}

export default Postform;