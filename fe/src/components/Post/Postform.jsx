import React from 'react';
import {useState} from 'react';
import './Post.scss';
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {red} from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentIcon from '@mui/icons-material/AddComment';
import {Link} from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput'
import {Container, FormControl, InputAdornment, InputLabel, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SendIcon from '@mui/icons-material/Send';

function Postform(props) {
    const {authorUsername, userId, commentCount, likeCount, createdAt, updatedAt} = props;
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const handleSubmit = () => {
        savePost()

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
                        <OutlinedInput
                            sx={{marginBottom: "30px"}}
                            id={"outlined-adornment-amount"}
                            multiline
                            fullWidth
                            placeholder={"Başlık"}
                            required
                            slotProps={{input: {maxLength: 50}}}
                            label={"Gerekli"}
                            onChange={(e) => setTitle(e.target.value)}
                        >
                        </OutlinedInput>
                    }
                />

                <CardContent>
                    <Typography
                        variant="body2"
                        className="typography"
                        sx={{color: 'text.secondary'}}
                    >
                        {<OutlinedInput
                            id={"outlined-adornment-amount"}
                            multiline
                            fullWidth
                            placeholder={"İçerik"}
                            required
                            slotProps={{input: {maxLength: 200}}}
                            label={"Gerekli"}
                            onChange={(e) => setContent(e.target.value)}
                            endAdornment=
                                {<InputAdornment
                                    position={"end"}
                                >
                                    <IconButton
                                        onClick={handleSubmit}
                                        aria-label="send">
                                        <SendIcon color="primary"/>
                                    </IconButton>
                                </InputAdornment>}>
                        </OutlinedInput>}
                    </Typography>
                </CardContent>

            </Card>
        </div>
    );


}

export default Postform;