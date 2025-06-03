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
import {red} from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Link} from "react-router-dom";
import {Container, Tooltip} from "@mui/material";
import Comment from "../Comment/Comment.jsx";
import Commentform from "../Comment/Commentform.jsx";
import CommentIcon from '@mui/icons-material/Comment';


function Post(props) {
    const {postId, title, content, authorUsername, userId, commentCount, likeCount, createdAt, updatedAt} = props;
    const [likecount, setLikecount] = useState(likeCount);
    const [expanded, setExpanded] = useState(false);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [iconClicked, setIconClicked] = useState(false);

    const loadAllComments = () => {
        fetch("/comments?postId=" + postId)
            .then(response => response.json())
            .then(data => {
                    setComments(data);
                    console.log('Yorumlar yüklendi:', data)
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                    console.log("Yorumlar yüklenirken hata oluştu:" + error)
                }
            )
    }
    const saveLike = () => {
        fetch("/likes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({
                postId: postId,
                userId: localStorage.getItem("userId"),
            })
        }).then(r => r.json())
            .catch(e => console.log(e))
            .then(data => {
                    console.log(data)
                }
            )
    }

    const checkIfLiked = async () => {
        try {
            const response = await fetch(`/likes?userId=${userId}&postId=${postId}`);
            const likeList = await response.json();
            console.log("likelist:", likeList);

            const isPostLiked = likeList.some(
                (like) => ""+like.userId === localStorage.getItem("userId") && like.postId === postId
            );
            setLiked(isPostLiked);
        } catch (error) {
            console.error("Like durumu kontrol edilirken hata oluştu:", error);
        }
    };


    useEffect(() => {
        checkIfLiked();
    }, []);


    async function handleLike() {
        setLiked(liked => !liked)
        if (!liked) {
            setLikecount(likecount => likecount + 1)
            saveLike()
        } else {

            const likeId = await fetchLikeId(userId, postId);
            if (likeId) {
                await deleteLike(likeId);
            } else {
                console.error("Beğeni ID alınamadı.");
            }
        }
    }


    function handleExpandClick() {
        setExpanded(!expanded);
        loadAllComments()
    }

    const fetchLikeId = async (userId, postId) => {
        try {
            const response = await fetch(`/likes?userId=${userId}&postId=${postId}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });

            const likeList = await response.json();

            if (likeList.length > 0) {
                return likeList[0].id; // İlk beğeninin ID'sini döndür
            } else {
                return null;
            }
        } catch (error) {
            console.error("Beğeni bilgisi alınırken hata oluştu:", error);
            return null;
        }
    };


    const deleteLike = async (likeId) => {
        try {
            const response = await fetch(`/likes/${likeId}`, {
                method: "DELETE",
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });

            if (!response.ok) {
                throw new Error("Beğeniyi silerken bir hata oluştu.");
            }

            console.log("Beğeni başarıyla silindi.");

            setLiked(false);
            setLikecount((prev) => prev - 1);
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

    return (
        <div className="postContainer">
            <Card className="card">
                <CardHeader
                    avatar={
                        <Link className="userLink" to={{pathname: "/users/" + userId}}> <Avatar sx={{bgcolor: red[500]}}
                                                                                                aria-label="recipe">
                            {
                                <Typography
                                    variant={"body2"}
                                    fontFamily={"Arial"}
                                    fontSize={"20px"}
                                    fontWeight={"bold"}
                                    fontStyle={"italic"}
                                >{authorUsername.charAt(0).toUpperCase()}</Typography>}
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
                            Oluşturma Tarihi: {createdAt}
                        </Typography>
                        {updatedAt !== null && updatedAt !== createdAt && (
                            <Typography variant="body2" color="text.secondary" component="div">
                                Güncelleme Tarihi: {updatedAt}
                            </Typography>
                        )}
                    </>
                </CardContent>
                <CardActions disableSpacing>
                    <Tooltip title={!liked ? "Gönderiyi beğen" : "Gönderiden beğeniyi çek"}>
                        <IconButton onClick={handleLike} aria-label="Postu favorilere ekle"
                                    disabled={localStorage.getItem("userId") == null}>
                            <FavoriteIcon style={{color: liked ? "red" : undefined}}/>
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
                            : !loading ? comments.map((comment, index) => (
                                    <Comment
                                        text={comment.text}
                                        userId={comment.userId}
                                        userName={comment.authorUsername}
                                        key={index}
                                        createdDAt={comment.createdAt}
                                        updatedAt={comment.updatedAt}/>
                                ))
                                :
                                "Loading..."
                        }
                        {localStorage.getItem("userId") != null ?
                            <Commentform userId={userId} postId={postId} userName={authorUsername}
                                         text={" Gönderiye yorum yap"}/> : null}
                    </Container>
                </Collapse>
            </Card>
        </div>
    );
}

export default Post;