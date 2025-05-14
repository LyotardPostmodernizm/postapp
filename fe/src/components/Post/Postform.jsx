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

function Postform(props) {
    const {authorUsername, userId, refreshPosts} = props;
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = () => {
        savePost();
        setIsSent(true);
        setTitle("")
        setContent("")
        refreshPosts();
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsSent(false);
    }
    const savePost = () => {
        fetch("/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content,
            })
        }).then(r => r.json())
            .catch(e => console.log(e))
            .then(data => {
                    console.log(data)
                }
            )
    }

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
                            <Avatar sx={{bgcolor: red[500]}}
                                    aria-label="recipe">
                                {authorUsername.charAt(0).toUpperCase()}
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
                            onChange={(e) => {setContent(e.target.value)
                                              setIsSent(false)}}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton
                                        onClick={handleSubmit}
                                        aria-label="send">
                                        <SendIcon color="primary"/>
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