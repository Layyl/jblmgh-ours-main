<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import api from '../../api';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
const router = useRouter();

const redirectToLogin = async () => {
    router.push(`/`);
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/public/layout/images/jbllogo.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(33, 243, 51, 0.4) 10%, rgba(33, 243, 51, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <span class="text-green-500 font-bold text-3xl mb-5">You're all set! 🥳</span>
                    <div class="text-600 mb-3">Your have finished setting up your account and may now use JBLMGH - OURS</div>
                    <div class="text-600 mb-5">You may now login using the username we sent and the password you have just created.</div>
                    <div class="flex align-items-center mt-2">
                        <Button label="Go to Login" @click="redirectToLogin" class="p-3 w-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
