import React, {useState} from 'react';
import {FormControl, InputLabel, Input, InputAdornment, AlertTitle, Alert} from "@mui/material";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import Button from "@mui/material/Button";
import {FormHelperText} from "@mui/material";
import Link from "@mui/material/Link";
import {useNavigate} from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from "@mui/material/IconButton";
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Paper from '@mui/material/Paper';
import { AnimatedBackground } from 'animated-backgrounds';
import './AuthLogin.scss'


const schema = yup.object().shape({
    password: yup
        .string()
        .required("Şifre gerekli!")
        .min(6, "Şifre en az 6 karakter olmalıdır.")
        .max(20, "Şifre en fazla 20 karakter olabilir."),
    email: yup
        .string()
        .required("Email gerekli!")
        .matches(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Geçerli bir email adresi giriniz"
        )

});

function AuthLogin() {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };
    const {
        handleSubmit,
        control,
        formState: {errors},
    } = useForm({resolver: yupResolver(schema),});

    const onSubmit = (data) => {
        setShowSuccess(false);
        setShowError(false);

        sendRequest("login", data)
            .then(() => {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate(`/users/${localStorage.getItem("userId")}`);
                }, 2000);
            })
            .catch(e => {
                console.error(e)
                setShowError(true);
                setTimeout(() => setShowError(false), 2000);
            });
    };
    const sendRequest = async (path, data) => {
        const response = await fetch("http://localhost:8080/auth/" + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: data.password,
                email: data.email
            })
        })
        if (!response.ok) {
            const data = await response.json();
            setAlertMessage(data.message)
            throw new Error(data.message || "Giriş işlemi sırasında bir hata oluştu!");
        }

        const responseData = await response.json();
        setAlertMessage(responseData.message)
        localStorage.setItem("token", responseData.message);
        localStorage.setItem("userId", responseData.userId);
        return responseData;
    };

    return (
        <div className="loginContainer">
            <AnimatedBackground animationName="floatingBubbles"
                                blendMode="normal"/>
            <Paper className="loginPaper" elevation={3}>
                <form onSubmit={handleSubmit(onSubmit)} className="loginFormContainer">


                    <FormControl variant={"outlined"} className="emailForm">
                        <InputLabel htmlFor="email">
                            Email
                        </InputLabel>
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            render={({field}) => (
                                <Input
                                    {...field}
                                    id="email"
                                    error={!!errors.email}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <AlternateEmailIcon/>
                                        </InputAdornment>
                                    }
                                    type="email"
                                    placeholder="Email"
                                />
                            )}
                        />
                        <FormHelperText error={!!errors.email}>
                            {errors.email ? errors.email.message : ""}
                        </FormHelperText>
                    </FormControl>


                    <FormControl variant={"outlined"} className="passwordForm">

                        <InputLabel htmlFor="password">
                            Parola
                        < /InputLabel>
                        <Controller
                            name="password"
                            control={control}
                            defaultValue=""
                            render={({field}) => (

                                <Input {...field}
                                       id="password"
                                       error={!!errors.password}
                                       startAdornment={
                                           <InputAdornment position="start">
                                               <LockIcon/>
                                           </InputAdornment>
                                       }
                                       type={showPassword ? 'text' : 'password'}

                                       placeholder="Parola"
                                       endAdornment={
                                           <InputAdornment position="end">
                                               <IconButton
                                                   aria-label={
                                                       showPassword ? 'Parolayı gizle' : 'Parolayı göster'
                                                   }
                                                   onClick={handleClickShowPassword}
                                                   onMouseDown={handleMouseDownPassword}
                                                   onMouseUp={handleMouseUpPassword}
                                                   edge="end"
                                               >
                                                   {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                               </IconButton>
                                           </InputAdornment>
                                       }

                                />
                            )}
                        />
                        <FormHelperText error={!!errors.password}>
                            {errors.password ? errors.password.message : ""}
                        </FormHelperText>

                        <FormHelperText style={{marginTop: "50px"}}>
                            <Link style={{textDecoration:"none"}} href="/auth">Kayıt ekranına dön </Link>
                        </FormHelperText>

                    </FormControl>
                    <Button type="submit" style={{marginTop: "50px"}} variant={"contained"} color={"primary"}>
                        Giriş Yap
                    </Button>
                    {showSuccess && (
                        <Alert severity="success">
                            <AlertTitle>Giriş Başarılı!</AlertTitle>
                            Kullanıcı Profilinize Yönlendiriliyorsunuz.
                        </Alert>
                    )}
                    {showError && (
                        <Alert severity="error">
                            <AlertTitle>Hata!</AlertTitle>
                            {alertMessage}
                        </Alert>
                    )}

                </form>
            </Paper>
        </div>
                )

                }

                export default AuthLogin;

