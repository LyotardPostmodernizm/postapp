import React, {useEffect, useState} from 'react';
import './Comment.scss';
import {Link} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {Modal, Snackbar, TextField, Tooltip} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Typography from "@mui/material/Typography";
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from "@mui/material/IconButton";
import Commentform from "./Commentform.jsx";
import Box from "@mui/material/Box";
import {makeAuthenticatedRequest} from "../../services/ApiService.js";
import {formatToIstanbulTime} from "../../Utility/formatToIstanbulTime.js";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from "@mui/material/Button";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};


const Comment = ({
                     text:initialText,
                     avatar,
                     postId,
                     userId,
                     userName,
                     createdAt:initialCreatedAt,
                     updatedAt:initialUpdatedAt,
                     commentId,
                     likeCount: initialLikeCount,
                     replyCount = 0,
                     children = [],
                     setCommentsRefresh,
                     isReply = false,
                     depth = 0,
                     onCommentDeleted
                 }) => {
    const [liked, setLiked] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [currentLikeId, setCurrentLikeId] = useState(null);
    const [currentUserAvatar, setCurrentUserAvatar] = useState(1);
    const [currentUserUsername, setCurrentUserUsername] = useState("");
    const [isLikeSent, setIsLikeSent] = useState(false);
    const [isLikeDeleted, setIsLikeDeleted] = useState(false);
    const MAX_DEPTH = 5;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editText, setEditText] = useState(initialText);
    const [isCommentUpdated, setIsCommentUpdated] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);


    const [isCommentDeleted, setIsCommentDeleted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentText, setCurrentText] = useState(initialText);
    const [currentCreatedAt, setCurrentCreatedAt] = useState(initialCreatedAt);
    const [currentUpdatedAt, setCurrentUpdatedAt] = useState(initialUpdatedAt);

    useEffect(() => {
        setCurrentText(initialText);
        setCurrentCreatedAt(initialCreatedAt);
        setCurrentUpdatedAt(initialUpdatedAt);
        setEditText(initialText);
    }, [initialText, initialCreatedAt, initialUpdatedAt]);


    const handleCommentUpdateSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsCommentUpdated(false);
    }

    const handleCommentDeleteSnackbar = (event, reason) => {
        if (reason === 'clickaway' || reason === 'escapeKeyDown') {
            return;
        }
        setIsCommentDeleted(false);
    }

    const handleEditComment = () => {
        setEditText(currentText);
        setIsEditModalOpen(true);
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditText(currentText);
    }

    const handleUpdateComment = async () => {
        if (!editText.trim()) {
            alert('Yorum içeriği boş olamaz!');
            return;
        }

        setIsUpdating(true);

        try {
            const response = await makeAuthenticatedRequest(`/comments/${commentId}`, {
                method: "PUT",
                body: JSON.stringify({
                    text: editText.trim(),
                    userId: parseInt(localStorage.getItem("userId"))
                })
            });

            if (response.ok) {
                const updatedComment = await response.json();
                console.log("Yorum başarıyla güncellendi:", updatedComment);

                setCurrentText(editText.trim());
                setCurrentUpdatedAt(new Date().toISOString());

                setIsEditModalOpen(false);
                setIsCommentUpdated(true);

                setTimeout(() => {
                    if (setCommentsRefresh && typeof setCommentsRefresh === 'function') {
                        setCommentsRefresh();
                    }
                }, 500);

            } else {
                const errorData = await response.text();
                console.error("Yorum güncellenirken bir hata oluştu:", response.status, errorData);
                throw new Error("Yorum güncellenirken bir hata oluştu");
            }
        } catch (error) {
            console.error("Yorum güncellenemedi:", error);
            alert("Yorum güncellenirken bir hata oluştu: " + error.message);

            if (error.message.includes("Authentication")) {
                localStorage.clear();
                window.location.href = "/login";
            }

        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!window.confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await makeAuthenticatedRequest(`/comments/${commentId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                console.log("Yorum başarıyla silindi");
                setIsCommentDeleted(true);

                 //Parent component'e bildiriyoruz
                if (onCommentDeleted && typeof onCommentDeleted === 'function') {
                    onCommentDeleted();
                }


                setTimeout(() => {
                    setCommentsRefresh();
                }, 1500);

            } else {
                throw new Error("Yorum silinirken bir hata oluştu");
            }
        } catch (error) {
            console.error("Yorum silinemedi:", error);
            alert("Yorum silinirken bir hata oluştu: " + error.message);
        } finally {
            setIsDeleting(false);
        }
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


    const getCurrentUserData = async () => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) return;

        try {
            const response = await makeAuthenticatedRequest(`/users/${currentUserId}`, {
                method: "GET"
            });

            if (response.ok) {
                const userData = await response.json();
                setCurrentUserAvatar(userData.avatar);
                setCurrentUserUsername(userData.username);
            }
        } catch (error) {
            console.error("Kullanıcı bilgileri alınırken hata oluştu:", error);
        }
    }


    const checkIfLiked = async () => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId || !commentId) return;

        try {
            const response = await fetch(`/api/likes?userId=${currentUserId}&commentId=${commentId}`, {
                method: "GET",
            });

            if (response.ok) {
                const likeList = await response.json();
                if (likeList.length > 0) {
                    setLiked(true);
                    setCurrentLikeId(likeList[0].id);
                } else {
                    setLiked(false);
                    setCurrentLikeId(null);
                }
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
                    commentId: commentId,
                })
            });

            if (response.ok) {
                const result = await response.json();
                setLiked(true);
                setIsLikeSent(true);
                setCurrentLikeId(result.id);
                setLikeCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Like gönderme hatası:", error);
        }
    };


    const deleteLike = async () => {
        if (!currentLikeId) return;

        try {
            const response = await makeAuthenticatedRequest(`/likes/${currentLikeId}?userId=${localStorage.getItem("userId")}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setLiked(false);
                setIsLikeDeleted(true);
                setCurrentLikeId(null);
                setLikeCount(prev => prev - 1);
            }
        } catch (error) {
            console.error("Beğeni silinemedi:", error);
        }
    };

    const handleLike = async () => {
        if (!localStorage.getItem("userId")) return;

        if (!liked) {
            await saveLike();
        } else {
            await deleteLike();
        }
    };

    useEffect(() => {
        checkIfLiked();
        getCurrentUserData();
    }, [commentId]);


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
                open={isCommentUpdated}
                onClose={handleCommentUpdateSnackbar}
                autoHideDuration={2000}
                message="Yorum Başarıyla Güncellendi"
                sx={{bottom: {xs: 90, sm: 0}}}
            />
            <Snackbar
                open={isCommentDeleted}
                onClose={handleCommentDeleteSnackbar}
                autoHideDuration={2000}
                message="Yorum Başarıyla Silindi"
                sx={{bottom: {xs: 90, sm: 0}}}
            />
            <Modal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-comment-modal"
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" sx={{mb: 2}}>
                        Yorumu Düzenle
                    </Typography>

                    <TextField
                        fullWidth
                        label="Yorum"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
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
                            onClick={handleUpdateComment}
                            variant="contained"
                            disabled={isUpdating || !editText.trim()}
                        >
                            {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <div className={`commentWrapper ${isReply ? 'replyComment' : 'mainComment'}`}
                 style={{marginLeft: depth > 0 ? `${depth * 20}px` : '0px'}}>

                <div className="commentHeader">
                    <Link className="userLink" to={{pathname: "/users/" + userId}}>
                        <Avatar
                            className="commentAvatar"
                            aria-label="user"
                            src={`/public/Avatars/avatar${avatar}.png`}
                            sx={{width: isReply ? 28 : 40, height: isReply ? 28 : 40}}
                        />
                    </Link>
                    <div className="commentInfo">
                        <Typography variant={isReply ? "caption" : "subtitle2"} className="commentAuthor">
                            <Link className="userLink" to={{pathname: "/users/" + userId}}>
                                {userName + " "}
                            </Link>
                        </Typography>
                        <Typography variant="caption" className="commentDate">
                            {formatToIstanbulTime(currentCreatedAt)}
                        </Typography>
                        {currentUpdatedAt && currentCreatedAt && currentUpdatedAt !== currentCreatedAt && (
                            <Typography variant="caption" className="commentDate" sx={{display: 'block', fontStyle: 'italic'}}>
                                (Düzenlendi: {formatToIstanbulTime(currentUpdatedAt)})
                            </Typography>
                        )}
                            </div>
                </div>

                <div className="commentContent">
                    <Typography variant={isReply ? "body2" : "body1"} className="commentText">
                        {currentText}
                    </Typography>
                </div>

                <div className="commentActions">

                    {depth < MAX_DEPTH && localStorage.getItem("userId") && (
                        <Tooltip title="Yoruma cevap ver">
                            <IconButton
                                size="small"
                                onClick={() => setIsReplying(!isReplying)}
                            >
                                <AddCircleIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    )}


                    {replyCount > 0 && (
                        <Tooltip title={showReplies ? "Cevapları gizle" : "Cevapları göster"}>
                            <IconButton
                                size="small"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small"/>}
                                <Typography variant="caption" sx={{ml: 0.5}}>
                                    {replyCount}
                                </Typography>
                            </IconButton>
                        </Tooltip>
                    )}


                    <div className="likeContainer">
                        <Tooltip title={liked ? "Beğeniyi kaldır" : "Yorumu beğen"}>
                            <IconButton
                                size="small"
                                onClick={handleLike}
                                disabled={!localStorage.getItem("userId")}
                            >
                                <FavoriteIcon
                                    style={{color: liked ? "red" : "gray"}}
                                    fontSize="small"
                                />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="caption">
                            {likeCount}
                        </Typography>
                    </div>

                    {localStorage.getItem("userId") !== null && localStorage.getItem("userId") === "" + userId && (
                        <div className="editContainer" style={{display: 'flex', gap: '4px'}}>
                            <Tooltip title="Yorumu Düzenle">
                                <IconButton
                                    size="small"
                                    onClick={handleEditComment}
                                    color="primary"
                                    disabled={isDeleting}

                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Yorumu Sil">
                                <IconButton
                                    size="small"
                                    onClick={handleDeleteComment}
                                    color="error"
                                    disabled={isDeleting}

                                >
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </div>
                    )}
                </div>



                {isReplying && localStorage.getItem("userId") && (
                    <Box className="replyForm" sx={{mt: 1, ml: 2}}>
                        <Commentform
                            userId={localStorage.getItem("userId")}
                            avatar={currentUserAvatar}
                            userName={currentUserUsername}
                            postId={postId}
                            commentId={commentId}
                            text="Yoruma cevap yazın..."
                            setCommentsRefresh={setCommentsRefresh}
                            isReplyToComment={true}
                            isReply={true}
                        />
                    </Box>
                )}


                {replyCount > 0 && (
                    <Collapse in={showReplies} timeout="auto" unmountOnExit>
                        <div className="repliesContainer" style={{marginTop: '8px'}}>
                            {children.map((reply) => (
                                <Comment
                                    key={reply.id}
                                    commentId={reply.id}
                                    text={reply.text}
                                    avatar={reply.authorAvatar}
                                    postId={reply.postId}
                                    userId={reply.userId}
                                    userName={reply.authorUsername}
                                    likeCount={reply.likeCount}
                                    replyCount={reply.replyCount}
                                    children={reply.children}
                                    createdAt={reply.createdAt}
                                    updatedAt={reply.updatedAt}
                                    setCommentsRefresh={setCommentsRefresh}
                                    isReply={true}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    </Collapse>
                )}
            </div>
        </>
    );

}
export default Comment;