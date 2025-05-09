import React from 'react';
import {Link} from "react-router-dom";
function Navbar() {
    let userId = 1; //Değişecek!!! Current User'in userID'sini alacak
    return (
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to={{pathname: "/users/" + userId}}>User</Link></li>
            </ul>
        </div>
    )
}
export default Navbar;