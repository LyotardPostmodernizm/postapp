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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const customFullScreenDialog = ({isOpen, postId, setIsOpen}) => {
    const [open, setOpen] = useState(isOpen);
    const [post, setPost] = useState();

    const fetchPost = () => {
        fetch("/posts/" + postId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    setPost(result);
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    const handleClose = () => {
        setOpen(false);
        setIsOpen(false);
    };


    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        fetchPost();
    }, [postId])

    return (
        <Dialog fullScreen open={open} onClose={handleClose} slots={{
            transition: Transition,
        }}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Kapat
                    </Typography>
                </Toolbar>
            </AppBar>
            {post ? <Post postId={post.id} title={post.title} content={post.content} authorUsername={post.authorUsername} userId={post.userId}
                           commentCount={post.commentCount} likeCount={post.likeCount} createdAt={post.createdAt} updatedAt={post.updatedAt}></Post> : "loading"}
        </Dialog>
    )
}

function UserActivity({userId}) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState();

    const handleNotification = (postId) => {
        setSelectedPost(postId)
        setIsOpen(true)

    }

    const fetchActivities = () => {
        fetch("/users/activity/" + userId, {
            method: "GET",
            headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
        })
            .then(response => response.json())
            .then(data => {
                    setActivities(data);
                    console.log("activities:" + data)
                    setLoading(false);
                },
                error => {
                    setError(error);
                    setLoading(false);
                    console.log(error)
                }
            )
    }
    useEffect(() => {
        fetchActivities();
    }, [])

    return (
        loading ? <div>Loading...</div> : error ? <div>Error...</div> :
        <>
            <Typography className={"UserActivityTypography"} variant="h6">Kullanıcı Faaliyetleri</Typography>
            {isOpen ? <customFullScreenDialog postId={selectedPost} setIsOpen={setIsOpen} isOpen={isOpen}/> : null}
            <TableContainer className="TableContainer" component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            Kullanıcı Bildirimleri
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.map((activity) => (
                            <Button onClick={() => handleNotification(activity[1])} variant="contained" color="primary">
                                <TableRow hover role="checkbox" tabIndex={-1} key={activity.id}>

                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                    {activity[0] === "beğendi" ? activity[3] + " kullanıcısı, postunuzu " + activity[0]
                                        : activity[3] + " kullanıcısı, postunuza " + activity[0]}
                                </TableRow>
                            </Button>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default UserActivity