import React, {useEffect} from 'react';
import {useState} from 'react';
import './Post.scss';
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {formatToIstanbulTime} from "../../Utility/formatToIstanbulTime.js";
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import {Link} from "react-router-dom";
import {Container, Modal, Snackbar, TextField, Tooltip} from "@mui/material";
import Comment from "../Comment/Comment.jsx";
import Commentform from "../Comment/Commentform.jsx";
import CommentIcon from '@mui/icons-material/Comment';
import {makeAuthenticatedRequest} from "../../services/ApiService.js";
import EditIcon from '@mui/icons-material/Edit';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};


function Post(props) {
    const {
        postId,
        avatar,
        title,
        content,
        authorUsername,
        userId,
        commentCount,
        likeCount,
        createdAt,
        updatedAt,
        currentUserAvatar = 1,
        currentUserUsername = "",
        onPostDeleted,
        onPostUpdated,
    } = props;
    const [likecount, setLikecount] = useState(likeCount);
    const [expanded, setExpanded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [iconClicked, setIconClicked] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [isLikeSent, setIsLikeSent] = useState(false);
    const [isLikeDeleted, setIsLikeDeleted] = useState(false);
    const [currentLikeId, setCurrentLikeId] = useState(null);
    const [isPostDeleted, setIsPostDeleted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editContent, setEditContent] = useState(content);
    const [isPostUpdated, setIsPostUpdated] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);



    const setCommentsRefresh = () => {
        setRefresh(true)
    }

    const handleCloseLikeSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsLikeSent(false);
    }

    const handleCloseLikeDeletedSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsLikeDeleted(false);
    }

    const handlePostDeleteSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsPostDeleted(false);
    }

    const handlePostUpdateSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsPostUpdated(false);
    }

    const handleEditPost = () => {
        setEditTitle(title);
        setEditContent(content);
        setIsEditModalOpen(true);
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditTitle(title);
        setEditContent(content);
    };


    //Sadece postlara ait yorumları,yani parenti olmayan ana yorumları getiriyoruz
    const loadAllComments = () => {
        fetch("/api/comments?postId=" + postId + "&parentId=0", {method: "GET"})
            .then(response => response.json())
            .then(data => {
                    setComments(data);
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                    console.log("Yorumlar yüklenirken hata oluştu:" + error)
                })
        setRefresh(false)
    }

    const checkIfLiked = async () => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
            return;
        }

        try {
            const response = await fetch(`/api/likes?userId=${currentUserId}&postId=${postId}`, {
                method: "GET",
            });
            const likeList = await response.json();

            if (likeList.length > 0) {
                setLiked(true);
                setCurrentLikeId(likeList[0].id);
            } else {
                setLiked(false);
                setCurrentLikeId(null);
            }
        } catch (error) {
            console.error("Like durumu kontrol edilirken hata oluştu:", error);
        }
    };


    const saveLike = async () => {
        try {
            const response = await makeAuthenticatedRequest("/likes", {
                method: "POST",
                body: JSON.stringify({
                    postId: postId,
                })
            });
            if (response.ok) {
                const result = await response.json();
                console.log("Gönderiye beğeni başarıyla gönderildi:", result);
                setLiked(true);
                setIsLikeSent(true);
                setCurrentLikeId(result.id);
                setLikecount(prev => prev + 1);
            }

        } catch (error) {
            console.error("Beğeni gönderme hatası:", error);
        }
    }

    const handleLike = async () => {
        if (!localStorage.getItem("userId")) {
            return;
        }

        if (!liked) {
            await saveLike();
        } else {
            await deleteLike();
        }
    };

    function handleExpandClick() {
        setExpanded(!expanded);
        loadAllComments()
    }


    const deleteLike = async () => {
        if (!currentLikeId) {
            console.error("Like ID bulunamadı");
            return;
        }

        try {
            const response = await makeAuthenticatedRequest(`/likes/${currentLikeId}?userId=${localStorage.getItem("userId")}`, {
                method: "DELETE",
            });

            if (response.ok) {
                console.log("Beğeni başarıyla silindi.");
                setLiked(false);
                setCurrentLikeId(null);
                setLikecount(prev => prev - 1);
                setIsLikeDeleted(true);
            } else {
                throw new Error("Beğeniyi silerken bir hata oluştu.");
            }
        } catch (error) {
            console.error("Beğeni silinemedi:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) {
            return;
        }

        try {
            const response = await makeAuthenticatedRequest(`/posts/${postId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                console.log("Gönderi başarıyla silindi");
                setIsPostDeleted(true);
                setIsDeleting(true);


                setTimeout(() => {
                    if (onPostDeleted) {
                        onPostDeleted(postId);
                    }
                }, 1500);

            } else {
                throw new Error("Gönderi silinirken bir hata oluştu");
            }
        } catch (error) {
            console.error("Gönderi silinemedi:", error);
            alert("Gönderi silinirken bir hata oluştu");
        }
    };

    const handleUpdatePost = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            alert('Başlık ve içerik boş olamaz!');
            return;
        }

        setIsUpdating(true);

        try {
            const response = await makeAuthenticatedRequest(`/posts/${postId}`, {
                method: "PUT",
                body: JSON.stringify({
                    title: editTitle.trim(),
                    content: editContent.trim(),
                    userId: parseInt(localStorage.getItem("userId"))

                })
            });

            if (response.ok) {
                const updatedPost = await response.json();
                console.log("Gönderi başarıyla güncellendi:", updatedPost);

                setIsEditModalOpen(false);
                setIsPostUpdated(true);


                if (onPostUpdated) {
                    onPostUpdated(postId, updatedPost);
                }

            } else {
                throw new Error("Gönderi güncellenirken bir hata oluştu");
            }
        } catch (error) {
            console.error("Gönderi güncellenemedi:", error);
            alert("Gönderi güncellenirken bir hata oluştu");
        } finally {
            setIsUpdating(false);
        }
    };





    const ExpandMore = styled((props) => {
        const {expand, ...other} = props;
        return <IconButton {...other} />;
    })(({theme}) => ({
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),

    }));

    useEffect(() => {
        checkIfLiked();
    }, [postId]);

    useEffect(() => {

        loadAllComments()

    }, [refresh])


    return (
        <>
            <Snackbar
                open={isLikeSent}
                onClose={handleCloseLikeSnackbar}
                autoHideDuration={1000}
                message="Beğeni Gönderme Başarılı"
                action
                sx={{bottom: {xs: 90, sm: 0}}}
            />
            <Snackbar
                open={isLikeDeleted}
                onClose={handleCloseLikeDeletedSnackbar}
                autoHideDuration={1000}
                message="Beğeniyi Silme Başarılı"
                action
                sx={{bottom: {xs: 90, sm: 0}}}
            />
            <Snackbar
                open={isPostDeleted}
                onClose={handlePostDeleteSnackbar}
                autoHideDuration={1000}
                message="Gönderi Başarıyla Silindi"
                sx={{bottom: {xs: 90, sm: 0}}}
            />
            <Snackbar
                open={isPostUpdated}
                onClose={handlePostUpdateSnackbar}
                autoHideDuration={2000}
                message="Gönderi Başarıyla Güncellendi"
                sx={{bottom: {xs: 90, sm: 0}}}
            />

            <Modal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-post-modal"
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" sx={{mb: 2}}>
                        Gönderiyi Düzenle
                    </Typography>

                    <TextField
                        fullWidth
                        label="Başlık"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        margin="normal"
                        multiline
                        rows={2}
                    />

                    <TextField
                        fullWidth
                        label="İçerik"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        margin="normal"
                        multiline
                        rows={6}
                    />

                    <Box sx={{mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end'}}>
                        <Button
                            onClick={handleCloseEditModal}
                            variant="outlined"
                            disabled={isUpdating}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleUpdatePost}
                            variant="contained"
                            disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </Box>
                </Box>
            </Modal>


            <div className="postContainer">
                <Card
                    className={`card ${isDeleting ? 'deleting' : ''}`}
                    style={{
                        opacity: isDeleting ? 0.3 : 1,
                        transform: isDeleting ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.5s ease-out'
                    }}
                >

                <CardHeader
                        avatar={
                            <Link className="userLink" to={{pathname: "/users/" + userId}}>
                                <Avatar className="userLink"
                                        aria-label="recipe"
                                        src={`/public/Avatars/avatar${avatar}.png`}>
                                </Avatar>
                            </Link>

                        }
                        action={

                            localStorage.getItem("userId") !== null && localStorage.getItem("userId") === "" + userId ? (
                                <Box sx={{display: 'flex', gap: 1}}>

                                    <Tooltip title="Gönderiyi Düzenle">
                                        <IconButton
                                            onClick={handleEditPost}
                                            aria-label="edit post"
                                            color="primary"
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Gönderiyi Sil">
                                        <IconButton
                                            onClick={handleDeletePost}
                                            aria-label="delete post"
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : null

                        }

                        subheader={<h1>{editTitle || title}</h1>}
                        title={
                            <Typography
                                variant={"body2"}
                                fontFamily={"Arial"}
                                fontSize={"20px"}
                                fontWeight={"bold"}
                                color={"blue"}
                                fontStyle={"italic"}>
                                <Link className={"userLink"} to={/users/ + userId}>{authorUsername}</Link>

                            </Typography>}
                    />

                    <CardContent>
                        <Typography
                            variant="body2"
                            className="typography"
                            sx={{color: 'text.secondary'}}
                        >
                            <h2>{editContent || content}</h2>
                        </Typography>
                    </CardContent>

                    <CardContent>
                        <>
                            <Typography variant="body2" color="text.secondary" component="div">
                                Oluşturma Tarihi: {formatToIstanbulTime(createdAt)}
                            </Typography>
                            {updatedAt !== null && updatedAt !== createdAt && (
                                <Typography variant="body2" color="text.secondary" component="div">
                                    Güncelleme Tarihi: {formatToIstanbulTime(updatedAt)}
                                </Typography>
                            )}
                        </>
                    </CardContent>
                    <CardActions disableSpacing>
                        <Tooltip title={!liked ? "Gönderiyi beğen" : "Gönderiden beğeniyi çek"}>
                            <IconButton onClick={handleLike} aria-label="Postu favorilere ekle"
                                        disabled={localStorage.getItem("userId") == null}>
                                <FavoriteIcon style={{color: liked ? "red" : "gray"}}/>
                            </IconButton>
                        </Tooltip>
                        <Typography variant={"subtitle2"}>{likecount}</Typography>
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show more"
                        >
                            <Tooltip title={"Yorumları gör"}>
                                <CommentIcon color={iconClicked ? "disabled" : "black"} onClick={() => {
                                    setIconClicked(iconClicked => !iconClicked)
                                }} style={{
                                    color: iconClicked ? "black" : undefined,
                                }}/>
                            </Tooltip>
                        </ExpandMore>
                        <Typography variant={"subtitle2"}>{commentCount}</Typography>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Container className="commentContainer"

                        >
                            {error ? <div>Error!!</div>
                                : !loading ? comments.map((comment) => (
                                        <Comment
                                            key={comment.id}
                                            commentId={comment.id}
                                            text={comment.text}
                                            avatar={comment.authorAvatar}
                                            postId={comment.postId}
                                            userId={comment.userId}
                                            userName={comment.authorUsername}
                                            likeCount={comment.likeCount}
                                            replyCount={comment.replyCount}
                                            children={comment.children}
                                            createdAt={comment.createdAt}
                                            updatedAt={comment.updatedAt}
                                            setCommentsRefresh={setCommentsRefresh}
                                        />

                                    ))
                                    :
                                    "Loading..."
                            }
                            {localStorage.getItem("userId") != null ?
                                <Commentform userId={localStorage.getItem("userId")}
                                             postId={postId}
                                             avatar={currentUserAvatar}
                                             userName={currentUserUsername}
                                             text={" Gönderiye yorum yap"}
                                             setCommentsRefresh={setCommentsRefresh}
                                             isReplyToComment={false}/> : null}
                        </Container>
                    </Collapse>
                </Card>
            </div>
        </>
    );
}

export default Post;