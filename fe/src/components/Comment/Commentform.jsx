import React, {useState} from 'react';
import './Comment.scss';
import CardHeader from "@mui/material/CardHeader";
import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {InputAdornment, OutlinedInput, TextField} from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";

const Commentform = ({text, userId, userName}) => {

    const [content, setContent] = useState("");

    const handleSubmit = () => {
        fetch("/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                userId: userId,
                userName: userName,
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
            <div className="commentContainer">
                <Card className="card">
                    <CardContent>
                        <OutlinedInput
                            label="Yorum Gereklidir"
                            id="outlined-adornment-amount"
                            multiline
                            fullWidth
                            required
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value)
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <Link className="userLink" to={{pathname: "/users/" + userId}}>
                                        <Avatar
                                            sx={{bgcolor: red[500]}}
                                            aria-label="recipe">
                                            {userName.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Link>
                                </InputAdornment>
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
export default Commentform;