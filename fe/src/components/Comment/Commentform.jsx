import React, {useState} from 'react';
import './Comment.scss';

import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {red} from "@mui/material/colors";
import {FormControl, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import IconButton from "@mui/material/IconButton";

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


        <OutlinedInput className={"commentInput"}
                       id="outlined-required"
                       multiline
                       fullWidth
                       value={content}
                       placeholder={"Gönderiye Yorum Yapın"}
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
                           </InputAdornment>}

                       endAdornment={<InputAdornment position="end">
                           <IconButton>
                               <SendIcon/>
                           </IconButton>
                       </InputAdornment>}
        />


    )
}
export default Commentform;