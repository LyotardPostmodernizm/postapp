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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Link} from "react-router-dom";
import {Container, Snackbar, Tooltip} from "@mui/material";
import Comment from "../Comment/Comment.jsx";
import Commentform from "../Comment/Commentform.jsx";
import CommentIcon from '@mui/icons-material/Comment';
import {makeAuthenticatedRequest} from "../../services/ApiService.js";


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
        currentUserUsername = ""
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
    const [isLikeDeleted,setIsLikeDeleted] = useState(false);
    const [currentLikeId, setCurrentLikeId] = useState(null);


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

    //Sadece postlara ait yorumları,yani parenti olmayan ana yorumları getiriyoruz
    const loadAllComments = () => {
        fetch("/api/comments?postId=" + postId + "&parentId=0", {method: "GET"})
            .then(response => response.json())
            .then(data => {
                    setComments(data);
                    console.log('=== FRONTEND DEBUG ===');
                    console.log('Ana yorumlar yüklendi:', data);
                    console.log('Ana yorum sayısı:', data.length);

                    data.forEach((comment, index) => {
                        console.log(`Ana yorum ${index + 1}:`, {
                            id: comment.id,
                            text: comment.text,
                            replyCount: comment.replyCount,
                            childrenLength: comment.children ? comment.children.length : 0,
                            children: comment.children
                        });
                    });

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
            <div className="postContainer">
                <Card className="card">
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
                            <IconButton aria-label="settings">
                                <MoreVertIcon/>
                            </IconButton>
                        }
                        subheader={<h1>{title}</h1>}
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
                            {<h2>{content}</h2>}
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