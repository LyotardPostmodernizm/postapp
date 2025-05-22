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

const Comment = ({text, userId, userName, createdAt, updatedAt}) => {
    const [liked,setLiked] = useState(false);


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
                <Tooltip title="Yoruma cevap verin">
                <AddCircleIcon
                    onClick={() => console.log("Icon clicked")}
                    className="absoluteIcon"
                />
                </Tooltip>
                <Tooltip title={liked ? "Beğeniyi kaldır" : "Yorumu beğen"}>
                    <FavoriteIcon
                        style={{color: liked ? "red" : undefined}}
                        onClick={() =>setLiked(liked => !liked)}
                        className="absoluteIcon2"
                    />
                </Tooltip>

            </div>



        </>)

}
export default Comment;