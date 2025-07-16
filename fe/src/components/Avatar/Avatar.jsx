import React from "react";
import {useState,useEffect} from "react";
import {CardMedia, ListItem, Modal, Snackbar, TextField} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from '@mui/material/List';
import Radio from '@mui/joy/Radio';
import {makeAuthenticatedRequest} from "../../services/ApiService.js";

//Avatar Modalı için
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
//Ad - Soyad Modalı için
const style2 = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    gap:'10px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


function Avatar({userId, avatarId, fullName, username, email, commentCount, likeCount, postCount,onUserUpdated}) {

    const [open, setOpen] = useState(false); //Avatar için
    const [open2, setOpen2] = useState(false); //Ad - soyad için
    const [avatar, setAvatar] = useState(avatarId);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        saveAvatar();
    }
    const parseFullName = (fullName) => {
        if (!fullName || fullName === "null null") {
            return ["", ""];
        }
        const parts = fullName.split(" ");
        return [parts[0] || "", parts[1] || ""];
    };

    const [firstName, lastName] = parseFullName(fullName);
    const [name, setName] = useState(firstName);
    const [surname, setSurname] = useState(lastName);

    const handleOpen2 = () => setOpen2(true);
    const handleClose2 = () => {
        setOpen2(false);
        updateFullName();
    }

    const avatars = (Array(30).fill().map((_, i) => i + 1))
    const handleChange = (event) => {
        setAvatar(event.target.value);
    };
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isNameChanged,setIsNameChanged] = useState(false);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsAvatarChanged(false);
    }
    const handleCloseSnackbar2 = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsNameChanged(false);
    }



    const saveAvatar = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")

                },
                body: JSON.stringify({
                    avatar: avatar,
                })
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Avatar başarıyla güncellendi", data);
                setIsAvatarChanged(true);

                if(onUserUpdated){
                    onUserUpdated();
                }
            }

        } catch (e) {
            console.error("Avatar güncellenirken hata ile karşılaşıldı: " + e);
        }
    }
    const updateFullName = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({
                    firstName: name,
                    lastName: surname

                })
            })
            if(response.ok){
                const data = await response.json();
                console.log("Ad - Soyad başarıyla güncellendi", data);
                setIsNameChanged(true);

                if(onUserUpdated){
                    onUserUpdated();
                }

            }
        }
        catch (e) {
            console.error("Ad - Soyad güncellenirken hata ile karılaşıldı:" + e)
        }
    }

    useEffect(() => {
        setAvatar(avatarId);
        const [firstName, lastName] = parseFullName(fullName);
        setName(firstName);
        setSurname(lastName);
    }, [avatarId, fullName]);




    return (
        <>
            <Snackbar
                open={isAvatarChanged}
                onClose={handleCloseSnackbar}
                autoHideDuration={1000}
                message="Avatar Başarıyla Güncellendi"
                action
                sx={{bottom: {xs: 90, sm: 0}}}
            />

            <Snackbar
                open={isNameChanged}
                onClose={handleCloseSnackbar2}
                autoHideDuration={1000}
                message="Ad - Soyad Başarıyla Güncellendi"
                action
                sx={{bottom: {xs: 90, sm: 0}}}
            />


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
                            Kullanıcı Adı: {username}
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
                    {parseInt(localStorage.getItem("userId")) === userId ?
                        <>
                            <Button
                                variant={"contained"}
                                onClick={handleOpen}>
                                Avatarı Değiştir
                            </Button>
                            <Button style={{marginLeft: "20px"}}
                                    variant={"contained"}
                                    onClick={handleOpen2}>
                                Adı - Soyadı Değiştir
                            </Button>
                        </>
                        :
                        null}

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
                <div className="NameModal">
                    <Modal
                        open={open2}
                        onClose={handleClose2}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style2}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Adınız ve Soyadınız
                            </Typography>
                            <TextField id="outlined-basic"
                                       label="Adınız" variant="outlined"
                                       placeholder={name==="null"? "Boş" : name}
                                       value={name}
                                       onChange={(e) => setName(e.target.value)}
                            />

                            <TextField id="outlined-basic"
                                       label="Soyadınız"
                                       variant="outlined"
                                       placeholder={surname==="null"? "Boş" : surname}
                                       value={surname}
                                       onChange={(e) => setSurname(e.target.value)}
                            />
                        </Box>
                    </Modal>
                </div>

            </div>
        </>
    )
}

export default Avatar;