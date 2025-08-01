import React from "react";
import {useState, useEffect} from "react";
import {
    CardMedia,
    ListItem,
    Modal,
    Snackbar,
    TextField,
    Grid,
    Paper,
    Divider,
    Chip,
    IconButton,
    Tooltip,
    Avatar as MuiAvatar,
    Badge
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from '@mui/material/List';
import Radio from '@mui/joy/Radio';
import {makeAuthenticatedRequest} from "../../services/ApiService.js";
import {styled} from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const StyledCard = styled(Card)(({theme}) => ({
    borderRadius: theme.spacing(3),
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    overflow: 'visible',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
    }
}));

const ProfileAvatar = styled(MuiAvatar)(({theme}) => ({
    width: 150,
    height: 150,
    border: '6px solid white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
    margin: '0 auto',
    marginTop: '-75px',
}));

const StatsCard = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    }
}));

const InfoItem = styled(Box)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    background: 'rgba(102, 126, 234, 0.05)',
    margin: theme.spacing(1, 0),
    transition: 'all 0.2s ease',
    '&:hover': {
        background: 'rgba(102, 126, 234, 0.1)',
        transform: 'translateX(8px)',
    }
}));

const EditButton = styled(Button)(({theme}) => ({
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontSize: '1rem',
    padding: theme.spacing(1.5, 3),
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
}));

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    maxWidth: '90vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    p: 4,
};

const nameModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    maxWidth: '90vw',
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    p: 4,
};


function Avatar({userId, avatarId, fullName, username, email, commentCount, likeCount, postCount, onUserUpdated}) {

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
    const [isNameChanged, setIsNameChanged] = useState(false);

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

                if (onUserUpdated) {
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
            if (response.ok) {
                const data = await response.json();
                console.log("Ad - Soyad başarıyla güncellendi", data);
                setIsNameChanged(true);

                if (onUserUpdated) {
                    onUserUpdated();
                }

            }
        } catch (e) {
            console.error("Ad - Soyad güncellenirken hata ile karılaşıldı:" + e)
        }
    }

    useEffect(() => {
        setAvatar(avatarId);
        const [firstName, lastName] = parseFullName(fullName);
        setName(firstName);
        setSurname(lastName);
    }, [avatarId, fullName]);

    const displayName = fullName === "null null" || !fullName ? "Ad Soyad Belirtilmemiş" : fullName;


    return (
        <>
            <Snackbar
                open={isAvatarChanged}
                onClose={handleCloseSnackbar}
                autoHideDuration={3000}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#4caf50',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    <CheckCircleIcon sx={{mr: 1}}/>
                    Avatar Başarıyla Güncellendi
                </Box>
            </Snackbar>

            <Snackbar
                open={isNameChanged}
                onClose={handleCloseSnackbar2}
                autoHideDuration={3000}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#4caf50',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    <CheckCircleIcon sx={{mr: 1}}/>
                    İsim Başarıyla Güncellendi
                </Box>
            </Snackbar>

            <Box sx={{maxWidth: 1200, mx: 'auto', p: 3}}>
                <StyledCard>
                    <Box sx={{height: 120}}/>

                    <CardContent sx={{pt: 0, pb: 4}}>
                        <Box sx={{textAlign: 'center', mb: 4}}>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                badgeContent={
                                    parseInt(localStorage.getItem("userId")) === userId ? (
                                        <Tooltip title="Avatar Değiştir">
                                            <IconButton
                                                onClick={handleOpen}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    width: 40,
                                                    height: 40,
                                                    '&:hover': {
                                                        bgcolor: 'primary.dark',
                                                    }
                                                }}
                                            >
                                                <PhotoCameraIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    ) : null
                                }
                            >
                                <ProfileAvatar
                                    src={`/public/Avatars/avatar${avatar}.png`}
                                    alt={username}
                                />
                            </Badge>

                            <Typography variant="h4" sx={{mt: 2, mb: 1, fontWeight: 'bold', color: '#333'}}>
                                {username}
                            </Typography>

                            <Typography variant="h6" sx={{color: 'text.secondary', mb: 3}}>
                                {displayName}
                            </Typography>

                            {parseInt(localStorage.getItem("userId")) === userId && (
                                <EditButton
                                    variant="outlined"
                                    startIcon={<EditIcon/>}
                                    onClick={handleOpen2}
                                    sx={{mb: 3}}
                                >
                                    Profil Bilgilerini Düzenle
                                </EditButton>
                            )}
                        </Box>

                        <Divider sx={{mb: 4}}/>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{mb: 3, fontWeight: 'bold', color: '#333'}}>
                                    Kişisel Bilgiler
                                </Typography>

                                <InfoItem>
                                    <PersonIcon sx={{mr: 2, color: 'primary.main'}}/>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Kullanıcı Adı
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {username}
                                        </Typography>
                                    </Box>
                                </InfoItem>

                                <InfoItem>
                                    <EmailIcon sx={{mr: 2, color: 'primary.main'}}/>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            E-posta Adresi
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {email}
                                        </Typography>
                                    </Box>
                                </InfoItem>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{mb: 3, fontWeight: 'bold', color: '#333'}}>
                                    Aktivite İstatistikleri
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <StatsCard>
                                            <ArticleIcon sx={{fontSize: 40, color: 'primary.main', mb: 1}}/>
                                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                                {postCount}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Gönderi
                                            </Typography>
                                        </StatsCard>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <StatsCard>
                                            <CommentIcon sx={{fontSize: 40, color: 'info.main', mb: 1}}/>
                                            <Typography variant="h4" fontWeight="bold" color="info.main">
                                                {commentCount}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Yorum
                                            </Typography>
                                        </StatsCard>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <StatsCard>
                                            <FavoriteIcon sx={{fontSize: 40, color: 'error.main', mb: 1}}/>
                                            <Typography variant="h4" fontWeight="bold" color="error.main">
                                                {likeCount}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Beğeni
                                            </Typography>
                                        </StatsCard>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* Avatar Modal */}
                <Modal open={open} onClose={handleClose}>
                    <Box sx={modalStyle}>
                        <Typography variant="h5" sx={{mb: 3, textAlign: 'center', fontWeight: 'bold'}}>
                            Avatar Seçin
                        </Typography>
                        <List dense sx={{
                            width: '100%',
                            maxWidth: 600,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 500,
                            borderRadius: 2,
                        }}>
                            {avatars.map((value) => {
                                const labelId = `avatar-${value}`;
                                return (
                                    <ListItem
                                        key={value}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 1,
                                            border: avatar == value ? '2px solid #1976d2' : '2px solid transparent',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                marginRight: 16
                                            }}
                                            component="img"
                                            alt={`Avatar${value}`}
                                            image={`/public/Avatars/avatar${value}.png`}
                                            title={`Avatar-${value}`}
                                        />
                                        <Box sx={{flexGrow: 1}}>
                                            <Typography variant="body1">
                                                Avatar {value}
                                            </Typography>
                                        </Box>
                                        <Radio
                                            edge="end"
                                            value={value}
                                            onChange={handleChange}
                                            checked={"" + avatar === "" + value}
                                            inputProps={{'aria-labelledby': labelId}}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Modal>

                {/* Name Modal */}
                <Modal open={open2} onClose={handleClose2}>
                    <Box sx={nameModalStyle}>
                        <Typography variant="h5" sx={{mb: 4, textAlign: 'center', fontWeight: 'bold'}}>
                            Profil Bilgilerini Düzenle
                        </Typography>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <TextField
                                fullWidth
                                label="Adınız"
                                variant="outlined"
                                value={name === "null" ? "" : name}
                                onChange={(e) => setName(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Soyadınız"
                                variant="outlined"
                                value={surname === "null" ? "" : surname}
                                onChange={(e) => setSurname(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </>
    );

}

export default Avatar;