import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    textAlign: 'center',
    borderRadius: theme.spacing(3),
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
}));

const ErrorNumber = styled(Typography)(({ theme }) => ({
    fontSize: '8rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(2),
    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
    [theme.breakpoints.down('sm')]: {
        fontSize: '6rem',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontSize: '1.1rem',
    padding: theme.spacing(1.5, 3),
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
}));

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <StyledContainer maxWidth={false}>
            <StyledPaper elevation={0}>
                <Box sx={{ mb: 4 }}>
                    <ErrorNumber variant="h1">
                        404
                    </ErrorNumber>

                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 2
                        }}
                    >
                        Sayfa Bulunamadı!
                    </Typography>

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            mb: 4,
                            lineHeight: 1.6,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Üzgünüz, aradığınız sayfa mevcut değil!
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4
                    }}
                >
                    <StyledButton
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={handleGoHome}
                        size="large"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                        }}
                    >
                        Ana Sayfaya Dön
                    </StyledButton>

                    <StyledButton
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleGoBack}
                        size="large"
                        sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                                borderColor: '#5a6fd8',
                                color: '#5a6fd8',
                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                            }
                        }}
                    >
                        Geri Dön
                    </StyledButton>
                </Box>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Yardıma mı ihtiyacınız var?
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Link
                            to="/"
                            style={{ textDecoration: 'none' }}
                        >
                            <Button
                                startIcon={<SearchIcon />}
                                color="primary"
                                sx={{ textTransform: 'none' }}
                            >
                                Gönderilere Göz At
                            </Button>
                        </Link>
                    </Box>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default NotFound;