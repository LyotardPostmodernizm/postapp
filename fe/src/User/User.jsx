import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import Avatar from '../components/Avatar/Avatar.jsx';
import Typography from "@mui/material/Typography";

function User() {
    const {userId} = useParams();


    return (
        <div>

            <Avatar/>


        </div>
    )
}
export default User