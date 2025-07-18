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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CustomFullScreenDialog = ({isOpen, postId, setIsOpen}) => {
    const [open, setOpen] = useState(isOpen);
    const [post, setPost] = useState();

    const fetchPost = async () => {
        try {
            const response = await makeAuthenticatedRequest(`/posts/${postId}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Post fetch failed');
            }

            const result = await response.json();
            setPost(result);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    };

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


    return (<Dialog fullScreen open={open} onClose={handleClose} slots={{
            transition: Transition,
        }}>
            <AppBar sx={{position: 'relative'}}>
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
                        Kapat
                    </Typography>
                </Toolbar>
            </AppBar>
            {post ?
                <Post postId={post.id}
                      title={post.title}
                      content={post.content}
                      authorUsername={post.authorUsername}
                      userId={post.userId}
                      commentCount={post.commentCount}
                      likeCount={post.likeCount}
                      createdAt={post.createdAt}
                      updatedAt={post.updatedAt}
                      currentUserAvatar={1}
                      currentUserUsername={""}>
                </Post> : "loading"}
        </Dialog>)
}

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
        try {
            const response = await makeAuthenticatedRequest(`/users/activity/${userId}`, {method: "GET"});

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                setActivities([]);
                setLoading(false);
                return;
            }

            const result = JSON.parse(text);
            setActivities(result);
            setLoading(false);
        } catch (error) {
            setError(true);
            setLoading(false);
            console.log("error in fetching activities:", error);
        }
    }
    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetchActivities();
        }
    }, []);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Veriler yüklenirken bir hata oluştu</div>;
    if (activities.length === 0) {
        return <div className="ActivitiesInfo">Bu kullanıcıya ait herhangi bir faaliyet bulunmamaktadır.</div>;
    }

    return (<div className="UserActivityContainer">
            <Typography className={"UserActivityTypography"} variant="h6">Kullanıcı Faaliyetleri</Typography>
            {isOpen && <CustomFullScreenDialog postId={selectedPost} setIsOpen={setIsOpen} isOpen={isOpen}/>}
            <TableContainer className="TableContainer" component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="simple table">
                    <TableHead>
                    </TableHead>
                    <TableBody>
                        {activities.map((activity) => (
                            <Button onClick={() => handleNotification(activity[1])} variant="contained" color="primary">
                                <TableRow hover role="checkbox" tabIndex={-1} key={activity.id}

                                          sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    {activity[0] === "beğendi" ? activity[3] + " kullanıcısı, postunuzu " + activity[0] : activity[3] + " kullanıcısı, postunuza " + activity[0]}
                                </TableRow>
                            </Button>))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>);
}

export default UserActivity