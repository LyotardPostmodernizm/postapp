
import React from 'react';
import {Box, Typography, Container} from '@mui/material';
import {styled, keyframes} from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Gradient animasyonu
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Kalp atışı animasyonu
const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
`;

const FooterContainer = styled(Box)(({ theme }) => ({

    background: "radial-gradient(circle,rgba(237, 221, 83, 1) 20%, rgba(237, 221, 83, 1) 29%, rgba(237, 221, 83, 1) 39%, rgba(165, 207, 91, 1) 52%, rgba(50, 184, 105, 1) 85%, rgba(10, 86, 163, 1) 91%)",
    backgroundSize: '400% 400%',
    animation: `${gradientShift} 8s ease infinite`,
    color: 'white',
    padding: theme.spacing(4, 0),
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        boxShadow: '0 0 20px rgba(255,255,255,0.4)',
    },
}));

const FooterContent = styled(Container)(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const DeveloperText = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& .developer-name': {
        background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
        backgroundSize: '200% 200%',
        animation: `${gradientShift} 3s ease infinite`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        textShadow: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    }
}));

const HeartIcon = styled(FavoriteIcon)(({ theme }) => ({
    color: '#ff6b6b',
    fontSize: '1.3rem',
    animation: `${heartbeat} 2s ease infinite`,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
}));

const SubText = styled(Typography)(({ theme }) => ({
    fontSize: '0.9rem',
    opacity: 0.85,
    fontWeight: 400,
    letterSpacing: '0.3px',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    maxWidth: 400,
    lineHeight: 1.5,
}));

const Divider = styled(Box)(({ theme }) => ({
    width: 80,
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
    borderRadius: 1,
    margin: theme.spacing(1, 0),
}));

function Footer() {
    return (
        <FooterContainer>
            <FooterContent maxWidth="md">
                <DeveloperText>
                    Developed with <HeartIcon /> by{' '}
                    <span className="developer-name">M. Onur Aysel</span>
                </DeveloperText>

                <Divider />

                <SubText>
                    Jr. Fullstack Web Developer
                </SubText>
            </FooterContent>
        </FooterContainer>
    );
}

export default Footer;