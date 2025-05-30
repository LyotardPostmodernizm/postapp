import React, {useState} from 'react';
import {FormControl, InputLabel, Input, InputAdornment, AlertTitle, Alert} from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from "@mui/material/Button";
import {FormHelperText} from "@mui/material";
import Link from "@mui/material/Link";
import {useNavigate} from 'react-router-dom';

function AuthRegister() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [validationError, setValidationError] = useState("");
    const navigate = useNavigate();

    const handleUsernameChange = (input) => {
        const value = input.target.value;

        if (value.length > 30) {
            setErrorMsg("Kullanıcı adı 30 karakterden uzun olamaz");
        } else {
            // Eğer hata yoksa temizle
            setErrorMsg("");
        }
        setUsername(value);
    };


    const handleRegister = () => {
        const handleRegister = () => {
            if (errorMsg) {
                return;
            }

            setShowSuccess(false);
            setShowError(false);
            setValidationError("");

            if (username.length > 28) {
                setValidationError("Kullanıcı adı en fazla 28 karakter olabilir.");
                return;
            }


            sendRequest("register")
                .then(() => {
                    setShowSuccess(true);
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                })
                .catch(e => {
                    console.error(e)
                    setShowError(true);
                });
            setUsername("");
            setPassword("");
        };


        const sendRequest = async (path) => {
            const response = await fetch("/auth/" + path, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Kayıt sırasında bir hata oluştu");
            }

            const data = await response.json();
            localStorage.setItem("token", data.message);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", data.username);
            return data;
        };


        return (
            <FormControl variant={"outlined"} sx={{marginTop: "10px", marginBottom: "10px"}}>
                {showSuccess && (
                    <Alert severity="success" style={{marginBottom: "20px"}}>
                        <AlertTitle>Kayıt Başarılı!</AlertTitle>
                        Login Sayfasına Yönlendiriliyorsunuz.
                    </Alert>
                )}
                {showError && (
                    <Alert severity="error" style={{marginBottom: "20px"}}>
                        <AlertTitle>Error</AlertTitle>
                        This is an error Alert with a scary title.
                    </Alert>
                )}
                {validationError && (
                    <Alert severity="error" style={{marginBottom: "20px"}}>
                        <AlertTitle>Validation Hatası</AlertTitle>
                        {validationError}
                    </Alert>
                )}


                <InputLabel htmlFor="outlined-adornment-amount">
                    Kullanıcı Adı
                </InputLabel>
                <Input inputProps={{minLength: 6, maxLength: 30}} onChange={(input) => {
                    setUsername(input.target.value)
                }}
                       id="outlined-adornment-amount"
                       startAdornment={
                           <InputAdornment position="start">
                               <AccountCircle/>
                           </InputAdornment>
                       }
                />
                <InputLabel style={{marginTop: "80px"}} htmlFor="outlined-adornment-amount">
                    Parola
                </InputLabel>
                <Input style={{marginTop: "50px"}}
                       onChange={(input) => {
                           setUsername(input.target.value)
                       }}
                       id="outlined-adornment-amount"
                       startAdornment={
                           <InputAdornment position="start">
                               <HttpsIcon/>
                           </InputAdornment>
                       }
                />
                <Button style={{marginTop: "50px"}} variant={"contained"} color={"primary"} onClick={
                    handleRegister
                }>
                    Kayıt ol
                </Button>
                <FormHelperText style={{marginTop: "50px"}}>
                    Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
                </FormHelperText>
            </FormControl>
        )
    }
}
    export default AuthRegister