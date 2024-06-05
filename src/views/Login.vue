<template>
    <section class="container">
        <div class="lgn">
            <div class="lgn-form">
                <div class="logo">
                    <img src="../assets/img/jblimslogo.png" alt="logo" />
                    <h3 class="font-medium">JOSE B. LINGAD MEMORIAL GENERAL HOSPITAL</h3>
                    <h2 class="font-bold font-primary">ONE UNIFIED REFERRAL SYSTEM</h2>
                </div>
                <div class="frm-input pt-1">
                    <h5 class="text-center text-secondary">Please log in to your account to continue</h5>
                    <label for="username" class="pt-5"> Username</label>
                    <input class="lgn-txt" @keyup.enter="login" v-model="username" placeholder="Enter your username" type="text" />
                    <label for="password"> Password</label>
                    <input class="lgn-txt" @keyup.enter="login" v-model="password" placeholder="Enter your password" type="password" />
                    <button class="btn-lgn cursor-pointer" @click="login">Log In</button>
                    <p class="text-center text-sm mt-3 text-green-600 cursor-pointer" @click="forgetPassword">Forgot password?</p>
                </div>
            </div>
            <div class="lgn-img"></div>
        </div>
    </section>
    <Dialog v-model:visible="visible" modal :closable="false" header="Login Error" :style="{ width: '25rem', textAlign: 'center' }">
        <span class="p-text-secondary block mb-5">Invalid Credentials. Please enter proper username and password.</span>
        <div class="flex justify-content-end gap-2">
            <Button type="button" label="OK" class="btn-primary" @click="visible = false"></Button>
        </div>
    </Dialog>
</template>

<style>
:root {
    --clr-primary: #12372a;
    --clr-secondary: hsl(0, 0%, 24%);
    --clr-accent: #70ba74;
    --clr-accent-500: #436850;
    --clr-white: #ffffff;
}
*,
*:focus,
*:hover {
    outline: none;
}
.prevent-select {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.text-center {
    text-align: center;
}
.text-primary {
    color: var(--clr-primary);
}
.text-secondary {
    color: var(--clr-secondary);
}
.text-accent-light {
    color: var(--clr-accent);
}
.text-accent-dark {
    color: var(--clr-accent-500);
}
.pt-1 {
    padding-top: 1rem;
}
.pt-2 {
    padding-top: 2rem;
}
.pt-3 {
    padding-top: 3rem;
}
.pt-4 {
    padding-top: 4rem;
}
.container {
    overflow: hidden;
    position: relative;
    display: flex;
    background-color: var(--clr-accent-500);
    height: 100vh;
    align-items: center;
    justify-content: center;
}
.lgn {
    position: relative;
    background-color: var(--clr-white);
    width: 1366px;
    max-height: 658px;
    border-radius: 20px;
    display: flex;
    height: 100vh;
    overflow: hidden;
    flex-direction: row;
    bottom: 10px;
    box-shadow: 10px 10px 31px -1px rgba(0, 0, 0, 0.52);
    -webkit-box-shadow: 10px 10px 31px -1px rgba(0, 0, 0, 0.52);
    -moz-box-shadow: 10px 10px 31px -1px rgba(0, 0, 0, 0.52);
}
.lgn-form {
    height: 100%;
    width: 35%;
    padding: 7rem;
}

.logo {
    text-align: center;
    align-items: center;
}

.logo img {
    margin-right: 1.5rem;
    width: 140px;
}
.logo h2 {
    font-size: 1.3rem;
    color: var(--clr-accent-500);
    margin-top: 0;
}
.logo h3 {
    font-size: 0.7rem;
    color: var(--clr-primary);
    margin-bottom: 0.5rem;
}

.lgn-form h1 {
    font-size: 4rem;
    margin-bottom: 0;
    color: var(--clr-primary);
}
.lgn-form p {
    font-size: 0.8rem;
    font-weight: 400;
    margin: 0 0 2rem 0;
    color: var(--clr-secondary);
}
.lgn-form span {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--clr-accent-500);
}

.frm-input {
    display: flex;
    flex-direction: column;
}

.formChanger {
    cursor: pointer;
}

.frm-input h5 {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
}
.frm-input label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.frm-input input {
    padding: 1rem;
    border: 0.6px solid var(--clr-accent);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-family: 'Poppins', sans-serif;
}
.frm-input select {
    padding: 1.3rem;
    border: 0.6px solid var(--clr-accent);
    border-radius: 8px;
    margin-bottom: 2rem;
    font-family: 'Poppins', sans-serif;
}
.frm-input input:focus {
    border: 0.6px solid var(--clr-accent-500);
    box-shadow: 0px 3px 12px -4px var(--clr-accent);
    -webkit-box-shadow: 0px 3px 12px -4px var(--clr-accent);
    -moz-box-shadow: 0px 3px 12px -4px var(--clr-accent);
}

.frm-input button {
    border: none;
    background-color: var(--clr-accent-500);
    color: var(--clr-white);
    padding: 1rem;
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
}

.frm-input button:hover {
    background-color: var(--clr-accent);
    transition: all 0.2s ease-in-out;
}
.frm-input button:active {
    background-color: #8eacbc;
}

.lgn-img {
    height: 100%;
    width: 75%;
    background-image: url('../assets/img/bg2.png');
    background-size: 120%;
    background-position: center left;
    background-repeat: no-repeat;
    overflow: autos;
}

@media (max-width: 850px) {
    .lgn {
        max-width: 550px;
        height: auto;
        border-radius: 20px;
    }
    .lgn-form {
        text-align: center;
        width: 100%;
        padding: 1.5rem;
    }
    .lgn-form label {
        display: none;
    }
    .lgn-form h1 {
        font-size: 3.5rem;
    }
    .lgn-img {
        display: none;
    }
}

@media (max-width: 530px) {
    .lgn {
        max-width: 350px;
        height: auto;
        border-radius: 20px;
    }
    .lgn-form {
        text-align: center;
        width: 100%;
        padding: 1.5rem;
    }
    .lgn-form label {
        display: none;
    }
    .lgn-form h1 {
        font-size: 3.5rem;
    }
    .lgn-img {
        display: none;
    }
}
</style>

<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
import Swal from 'sweetalert2';

const username = ref('');
const password = ref('');
const response = ref([]);
const visible = ref(false);

const forgetPassword = () => {
    router.push('/forgot-password-assistance');
};

const login = async () => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
            username: username.value,
            password: password.value
        });
        if (response.data.status) {
            Cookies.set('token', response.data.token);
            Cookies.set('hciID', response.data.user.hciID);
            Cookies.set('uname', response.data.user.username);
            Cookies.set('pID', response.data.user.personID);
            Cookies.set('uID', response.data.user.id);
            Cookies.set('tempPass', response.data.user.tempPassChanged);
            localStorage.setItem('sessionID', response.data.token);
            router.push('/ours/dashboard');
        }
    } catch (error) {
        visible.value = true;
    }
};
</script>
