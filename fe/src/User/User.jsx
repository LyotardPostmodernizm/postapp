import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import Avatar from '../components/Avatar/Avatar.jsx';
import Typography from "@mui/material/Typography";
import UserActivity from "./UserActivity.jsx";

function User() {
    const {userId} = useParams();


    return (
        <div>

            <Avatar userId={userId}/>
            {localStorage.getItem("userId") === userId ?  <UserActivity userId={userId}/> :  null}


        </div>
    )
}
export default User