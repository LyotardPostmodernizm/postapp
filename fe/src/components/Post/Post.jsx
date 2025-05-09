import React from 'react';
import {useState} from 'react';
import './Post.scss';
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {red} from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentIcon from '@mui/icons-material/AddComment';
import {Link} from "react-router-dom";

function Post(props) {
    const {title, content, authorUsername, userId, commentCount, likeCount, createdAt, updatedAt} = props;
    const [expanded, setExpanded] = useState(false);
    const [liked,setLiked] =useState(false);

    function handleLike() {
        setLiked(liked => !liked)
    }

    function handleExpandClick() {
        setExpanded(!expanded);
    }

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
                            {authorUsername.charAt(0).toUpperCase()}
                        </Avatar></Link>

                    }
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon/>
                        </IconButton>
                    }
                    subheader={<h1>{title}</h1>}
                    title={authorUsername}
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
                    <IconButton onClick={handleLike} aria-label="add to favorites">
                        <FavoriteIcon style={{color: liked ? "red" : undefined}}/>
                    </IconButton>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <AddCommentIcon/>
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>

                    </CardContent>
                </Collapse>
            </Card>
        </div>
    );
}

export default Post;