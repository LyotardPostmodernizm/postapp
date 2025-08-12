import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './User.scss';
import Typography from "@mui/material/Typography";
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import Post from "../components/Post/Post.jsx";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import {makeAuthenticatedRequest} from "../services/ApiService.js";
import Avatar from "@mui/material/Avatar";
import {formatToIstanbulTime} from "../Utility/formatToIstanbulTime.js";
import {Box, Card, CardContent, Chip, CircularProgress, Alert, Fade} from "@mui/material";
import {styled} from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(3),
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: 'none',
}));

const ActivityHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: theme.spacing(3),
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.spacing(0, 0, 3, 3),
    '& .MuiTableHead-root': {
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    },
    '& .MuiTableCell-head': {
        fontWeight: 'bold',
        color: '#333',
        fontSize: '1rem',
    },
    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
            background: 'rgba(102, 126, 234, 0.05)',
            transform: 'scale(1.01)',
        },
    },
}));

const ActivityChip = styled(Chip)(({ theme, activityType }) => ({
    borderRadius: theme.spacing(2),
    fontWeight: 'medium',
    ...(activityType === 'like' && {
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        color: 'white',
    }),
    ...(activityType === 'comment' && {
        background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
        color: 'white',
    }),
}));

const ViewButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    textTransform: 'none',
    fontWeight: 'medium',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
}));

const EmptyState = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(6),
    color: 'text.secondary',
}));

const CustomFullScreenDialog = ({isOpen, postId, setIsOpen}) => {
    const [open, setOpen] = useState(isOpen);
    const [post, setPost] = useState();
    const [loading, setLoading] = useState(true);

    const fetchPost = async () => {
        if (!postId) {
            console.error("Post ID bulunamadı!");
            return;
        }

        try {
            setLoading(true);
            const response = await makeAuthenticatedRequest(`/api/posts/${postId}`, {
                method: "GET"
            });
            setPost(response);
        } catch (error) {
            console.error("Post görüntüleme başarısız!", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setIsOpen(false);
        setPost(null);
    };

    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            slots={{transition: Transition}}
        >
            <AppBar sx={{
                position: 'relative',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon/>
                    </IconButton>
                    <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                        Gönderi Detayı
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : post ? (
                    <Post
                        postId={post.id}
                        title={post.title}
                        content={post.content}
                        authorUsername={post.authorUsername}
                        userId={post.userId}
                        commentCount={post.commentCount}
                        likeCount={post.likeCount}
                        createdAt={post.createdAt}
                        updatedAt={post.updatedAt}
                        currentUserAvatar={1}
                        currentUserUsername={""}
                        avatar={post.avatar}
                    />
                ) : (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Gönderi yüklenemedi!
                    </Alert>
                )}
            </Box>
        </Dialog>
    );
};


function UserActivity({userId}) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState();

    const handleNotification = (postId) => {
        setSelectedPost(postId)
        setIsOpen(true)

    }

    const fetchActivities = async () => {
        setLoading(true);
        setError(false);

        try {
            const result = await makeAuthenticatedRequest(`/api/users/activity/${userId}`, { method: "GET" });
            if (!result || (Array.isArray(result) && result.length === 0)) {
                setActivities([]);
            } else {
                setActivities(result);
            }
        } catch (error) {
            setError(true);
            console.error("error in fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetchActivities();
        }
    }, []);


    if (loading) {
        return (
            <StyledCard>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 3 }}>
                        Bildirimler yükleniyor...
                    </Typography>
                </Box>
            </StyledCard>
        );
    }

    if (error) {
        return (
            <StyledCard>
                <CardContent>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        <Typography variant="h6">
                            Bildirimler yüklenirken bir hata oluştu
                        </Typography>
                    </Alert>
                </CardContent>
            </StyledCard>
        );
    }

    if (activities.length === 0) {
        return (
            <StyledCard>
                <ActivityHeader>
                    <NotificationsIcon sx={{ fontSize: 32 }} />
                    <Typography variant="h5" fontWeight="bold">
                        Son Bildirimler
                    </Typography>
                </ActivityHeader>
                <EmptyState>
                    <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                        Henüz bildirim bulunmuyor
                    </Typography>
                    <Typography variant="body2">
                        Gönderilerinize yapılan etkileşimler burada görünecek
                    </Typography>
                </EmptyState>
            </StyledCard>
        );
    }

    return (
        <Fade in={!loading}>
            <StyledCard>
                <ActivityHeader>
                    <NotificationsIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            Son Bildirimler
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {activities.length} bildirim
                        </Typography>
                    </Box>
                </ActivityHeader>

                {isOpen && (
                    <CustomFullScreenDialog
                        postId={selectedPost}
                        setIsOpen={setIsOpen}
                        isOpen={isOpen}
                    />
                )}

                <StyledTableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Kullanıcı</TableCell>
                                <TableCell>Aktivite</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell align="center">İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activities.map((activity, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={`/public/Avatars/avatar${activity[2]}.png`}
                                                sx={{ width: 48, height: 48 }}
                                            />
                                            <Box>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {activity[3]}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <ActivityChip
                                            icon={activity[0] === "beğendi" ?
                                                <FavoriteIcon fontSize="small" /> :
                                                <CommentIcon fontSize="small" />
                                            }
                                            label={activity[0] === "beğendi" ?
                                                "Postunuzu beğendi" :
                                                "Postunuza yorum yaptı"
                                            }
                                            activityType={activity[0] === "beğendi" ? 'like' : 'comment'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {activity[4] ? formatToIstanbulTime(activity[4]) : 'Tarih bilinmiyor'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <ViewButton
                                            onClick={() => handleNotification(activity[1])}
                                            variant="contained"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                        >
                                            Görüntüle
                                        </ViewButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </StyledCard>
        </Fade>
    );
}

export default UserActivity