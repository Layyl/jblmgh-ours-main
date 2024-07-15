<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import api from '../../api';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';

const password = ref('');
const password_confirmation = ref('');
const notMatch = ref(false);
const blankpass = ref(false);
const weakPass = ref(false);
const route = useRoute();
const router = useRouter();
const encryptedEmail = ref('');
const token = ref('');
const isVerified = ref(false);
const saving = ref(false);
const savingHeader = ref('');
const savingText = ref('');
const savingProgress = ref(true);

const verifyEmail = async () => {
    const response = await api.get(`/emailVerification?hash=${route.query.hash}&id=${route.query.id}`);
    if (response.data.success == false) {
        isVerified.value = true;
    }
};

const checkPasswordRequirements = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
};

const updatePassword = async () => {
    if (password.value == '' || password_confirmation.value == '') {
        blankpass.value = true;
        return false;
    }
    if (password.value !== password_confirmation.value) {
        notMatch.value = true;
        return false;
    }
    const isPasswordValid = checkPasswordRequirements(password.value);
    if (!isPasswordValid) {
        weakPass.value = true;
    } else {
        const response = await api.post(`/setPassword`, { token: token.value, email: encryptedEmail.value, password: password.value, password_confirmation: password_confirmation.value });
        await verifyEmail();
    }
};

const handleUpdatePassword = async () => {
    await setLoadingState('Setting your password', 'Please wait while we set things up for you.');
    await updatePassword();
    await hideLoadingModal('Password Changed Successfully!🥳', 'You have successfully finalized your account. You may now use it to access OURS.');
    router.push(`/success`);
};

const setLoadingState = async (header, text) => {
    saving.value = true;
    savingHeader.value = header;
    savingText.value = text;
};

const hideLoadingModal = (header, text) => {
    savingHeader.value = header;
    savingText.value = text;
    savingProgress.value = false;
    setTimeout(() => {
        saving.value = false;
        closeModal();
        searchPatient();
    }, 1000);
};

onMounted(async () => {
    encryptedEmail.value = route.query.em;
    token.value = route.query.token;
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img src="/public/layout/images/jbllogo.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div v-if="!isVerified" style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(33, 243, 51, 0.4) 10%, rgba(33, 243, 51, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <span class="text-green-500 font-bold text-3xl mb-5">Finalize Account Setup</span>
                    <div class="text-600 mb-3">Your email is successfully verified! 🥳</div>
                    <div class="text-600 mb-5">Please set your new password to finish setting up your account.</div>
                    <Message v-if="blankpass" severity="error">Please enter your password.</Message>
                    <Message v-if="notMatch" severity="error">Passwords do not match.</Message>
                    <Message v-if="weakPass" severity="error">Please enter a stronger password</Message>
                    <div class="inline-flex flex-column gap-2">
                        <label for="username" class="font-semibold mb-2">Password</label>
                        <Password class="font-semibold mb-2" v-model="password" toggleMask :inputStyle="{ width: '100%' }">
                            <template #footer>
                                <Divider />
                                <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                                    <li>At least one lowercase</li>
                                    <li>At least one uppercase</li>
                                    <li>At least one numeric</li>
                                    <li>Minimum 8 characters</li>
                                </ul>
                            </template>
                        </Password>
                    </div>

                    <div class="inline-flex flex-column gap-2">
                        <label for="password" class="font-semibold mb-2">Confirm Password</label>
                        <Password class="font-semibold mb-2" v-model="password_confirmation" :feedback="false" toggleMask :inputStyle="{ width: '100%' }" />
                    </div>
                    <div class="flex align-items-center mt-2">
                        <Button label="Change Password" @click="handleUpdatePassword" class="p-3 w-full" />
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-column align-items-center justify-content-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(233, 30, 99, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                        <div class="grid flex flex-column align-items-center">
                            <div class="flex justify-content-center align-items-center bg-pink-500 border-circle" style="height: 3.2rem; width: 3.2rem">
                                <i class="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
                            </div>
                            <h1 class="text-900 font-bold text-5xl mb-2">Error Occured</h1>
                            <span class="text-600 mb-5">Your email is already verified.</span>
                            <img src="/public/layout/images/asset-error.svg" alt="Error" class="mb-5" width="80%" />
                            <div class="col-12 mt-5 text-center">
                                <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align: center"></i>
                                <router-link to="/" class="text-blue-500">Go to Login</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog v-model:visible="saving" modal :header="savingHeader" :closable="false" :style="{ width: '25rem' }">
                <div class="flex align-items-center gap-3 mb-3">
                    <p>{{ savingText }}</p>
                </div>
                <ProgressBar v-if="savingProgress" mode="indeterminate" style="height: 6px"></ProgressBar>
            </Dialog>
        </div>
    </div>
</template>
