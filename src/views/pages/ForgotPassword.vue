<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import api from '../../api';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';

const route = useRoute();
const router = useRouter();
const emailAddress = ref('');
const blankEmail = ref(false);
const invalidEmail = ref(false);
const sent = ref(false);

const checkEmailFormat = async (emailAddress) => {
    console.log(emailAddress);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(emailAddress)) {
        const response = await api.post(`/sendResetLinkEmail?email=${emailAddress}`);
        sent.value = true;
    } else {
        console.log('invalid');
        invalidEmail.value = true;
    }
};

const sendEmail = async () => {
    if (emailAddress.value == '') {
        blankEmail.value = true;
        return false;
    } else {
        checkEmailFormat(emailAddress.value);
    }
};

const closeMessages = () => {
    blankEmail.value = false;
    invalidEmail.value = false;
    console.log(blankEmail.value, invalidEmail.value);
};

onMounted(async () => {});
</script>

<template>
    <div v-if="!sent" class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/public/layout/images/jbllogo.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(33, 243, 51, 0.4) 10%, rgba(33, 243, 51, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <span class="text-green-500 font-bold text-3xl mb-5">Forgot Password 😱</span>
                    <div class="text-600 mb-3">Please enter your registered email address.</div>
                    <div class="text-600 mb-5">We will be sending you an email that contains further instructions to reset your password.</div>
                    <Message v-if="blankEmail" @close="closeMessages()" severity="error">Please enter your email address.</Message>
                    <Message v-if="invalidEmail" @close="closeMessages()" severity="error">You have entered an invalid email. Please re-enter your registered email.</Message>
                    <div class="inline-flex gap-2 mb-3">
                        <label for="email" class="font-semibold mt-2">Email Address</label>
                        <InputText id="email" v-model="emailAddress" aria-describedby="email-help" />
                        <Button label="Submit" @click="sendEmail" class="p-3 w-3" />
                    </div>

                    <div class="flex align-items-center mt-2"></div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/public/layout/images/jbllogo.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div v-if="!isVerified" style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(33, 243, 51, 0.4) 10%, rgba(33, 243, 51, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <span class="text-green-500 font-bold text-3xl mb-5">Email Sent! 📨</span>
                    <div class="text-600 mb-3">Please check your email for the password reset link.</div>
                    <div class="text-600 mb-5">Do not forget to check your spam folder if you cannot find it.</div>
                </div>
            </div>
        </div>
    </div>
</template>
