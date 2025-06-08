import react, {useEffect} from 'react';
import {useState} from "react";
import {
    CardMedia,
    Checkbox,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Modal
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from '@mui/material/List';
import Radio from '@mui/joy/Radio';
import React from "react";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "fit-content",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


function Avatar({userId}) {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleOpen2 = () => setOpen(true);
    const handleClose2 = () => setOpen(false);
    const avatars = (Array(30).fill().map((_, i) => i + 1))

    const handleChange = (event) => {
        setAvatar(event.target.value);
    };

    const [fullName, setFullName] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [commentCount, setCommentCount] = React.useState(0);
    const [likeCount, setLikeCount] = React.useState(0);
    const [postCount, setPostCount] = React.useState(0);
    const [avatar, setAvatar] = useState(1);



    const fetchUserResponse = () => {
        fetch("/users/" + userId,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }}
        )
            .then(response => response.json())
            .then(data => {
                setUsername(data.username)
                setFullName(data.fullName)
                setCommentCount(data.commentCount)
                setEmail(data.email)
                setLikeCount(data.likeCount)
                setPostCount(data.postCount)
                setAvatar(data.avatar)
            })
            .catch(error => console.log("error fetching userResponse: " + error))
    }
    const fetchUserResponseMe = () => {
        fetch("/users/me",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                setUsername(data.username)
                setFullName(data.fullName)
                setCommentCount(data.commentCount)
                setEmail(data.email)
                setLikeCount(data.likeCount)
                setPostCount(data.postCount)
                setAvatar(data.avatar)
            })
            .catch(error => console.log("error fetching userResponse: " + error))
    }
    useEffect(() => {
        fetchUserResponse()
        saveAvatar()
    }, [])

    const saveAvatar = () => {
        fetch("/users/" + userId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`

            },
            body: JSON.stringify({
                avatar: avatar,
            })
        }).catch(e => console.log(e))
            .then(data => {
                    console.log(data)
                }
            )
    }


    return (
        <div className="AvatarContainer">

            <Card className="AvatarCard">
                <CardMedia className="AvatarCardMedia"
                           sx={{height: 256, width: 256}}
                           image={`/public/Avatars/avatar${avatar}.png`}
                           style={{marginLeft: "auto", marginRight: "auto", display: "block"}}
                           title="Avatar"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının Adı: {username}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının Adı - Soyadı: {fullName === "null null" ? " " : fullName}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının email adresi: {email}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının Gönderi Sayısı: {postCount}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının yorum sayısı: {commentCount}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="div">
                        Kullanıcının beğeni sayısı: {likeCount}
                    </Typography>
                </CardContent>

                <Button variant={"contained"} onClick={handleOpen}>Avatarı Değiştir</Button>
                <Button style={{marginLeft: "20px"}} variant={"contained"}>Adı - Soyadı Değiştir</Button>
            </Card>

            <div className="AvatarModal">
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography> Lütfen avatarınızı seçin</Typography>
                        <List dense sx={{
                            width: '100%',
                            maxWidth: 360,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 400,
                            '& ul': {padding: 20},
                        }}>

                            {avatars.map((value) => {
                                const labelId = `checkbox-list-secondary-label-${value}`;
                                return (
                                    <ListItem key={value} button secondaryAction={
                                        <Radio
                                            edge="end"
                                            value={value}
                                            onChange={handleChange}
                                            checked={"" + avatar === "" + value}
                                            inputProps={{'aria-labelledby': labelId}}
                                        />}>
                                        <CardMedia
                                            style={{maxWidth: 100}}
                                            component="img"
                                            alt={`Avatar${value}`}
                                            image={`/public/Avatars/avatar${value}.png`}
                                            title={`Avatar-${value}`}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                </Modal>
            </div>

        </div>
    );
}

export default Avatar;