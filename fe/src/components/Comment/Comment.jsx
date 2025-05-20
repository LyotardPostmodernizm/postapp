import React from 'react';
import './Comment.scss';
import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {InputAdornment, OutlinedInput, TextField} from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";

const Comment = ({text, userId, userName, createdAt, updatedAt}) => {


    return (
        <>
            <div className="commentContainer">
                <Card className="card">
                    <CardContent>
                        <Typography variant="h6" style={{}}>
                            <IconButton
                            >
                                <Link
                                    className="userLink"
                                    to={{pathname: "/users/" + userId}}>
                                    <Avatar
                                    sx={{bgcolor: red[500], marginRight: "10px"}}
                                    aria-label="recipe">
                                    {userName.charAt(0).toUpperCase()}
                                </Avatar>
                                </Link>
                                <Link className="userLink" to={{pathname: "/users/" + userId}}> <Typography
                                    variant="body2"
                                    color="blue"
                                    fontFamily={"Arial"}
                                    fontStyle={"italic"}
                                    fontSize={"20px"}
                                >
                                    {userName}
                                </Typography></Link>


                            </IconButton>
                        </Typography>


                        <OutlinedInput
                            id="outlined-adornment-amount"
                            multiline
                            fullWidth
                            value={text}
                            disabled
                            style={{
                                backgroundColor: "#e5e8e8",
                                color: "black",
                                border: "none",
                                fontSize: "15px",
                                fontFamily: "Arial",

                            }}

                        />
                        {updatedAt ? (
                                <Typography variant="body2" style={{marginTop: "10px", fontStyle: "italic"}}>
                                    Güncelleme Tarihi: {updatedAt}
                                </Typography>
                            )
                            :
                            <Typography variant="body2" style={{marginTop: "10px", fontStyle: "italic"}}>
                                Oluşturma Tarihi: {createdAt}
                            </Typography>}

                    </CardContent>
                </Card>
            </div>
        </>
    )
}
export default Comment;