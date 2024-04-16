<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import Cookies from 'js-cookie';
import { useLayout } from '@/layout/composables/layout';
import api from '../api';
import { useToast } from 'primevue/usetoast';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
const toast = useToast();
const { isDarkTheme } = useLayout();
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const changepass = ref(false);
const inboundLastName = ref('');
const inboundFirstName = ref('');
const inboundMiddleName = ref('');
const hciID = ref('');
const inboundPatients = ref([]);
const erCensusPie = ref([]);
const erCensus = ref([]);
const dashboardCensus = ref('');
const tempPasswordChanged = ref('');
const userID = ref('');
const password = ref('');
const confPassword = ref('');
const notMatch = ref(false);
const weakPass = ref(false);
const passwordChangeSuccess = ref(false);
const fetching = ref(true);
const tableSkeleton = ref(new Array(5));
const passwordUpdateSuccess = () => {
    if (!passwordChangeSuccess.value) {
        toast.add({ severity: 'success', summary: 'Your password has been successfully changed. You may now continue using JBLMGH - OURS. Thank you!', group: 'bc' });
        passwordChangeSuccess.value = true;
    }
};
const getStatus = (referralStatus) => {
    switch (referralStatus) {
        case 1:
            return 'Pending';
        case 2:
            return 'On-going Assessment';
        case 3:
            return 'Awaiting - Accepted';
        case 4:
            return 'Stay at Referring HCI (Given Management)';
        case 5:
            return 'Stay at Referring HCI (Refused Transfer)';
        case 6:
            return 'Transferred to OPCEN';
        case 7:
            return 'Transferred to other HCI';
        case 8:
            return 'Expired Referral';
        case 9:
            return 'Expired Patient';
        default:
            return 'Unknown';
    }
};

const getStatusClass = (referralStatus) => {
    switch (referralStatus) {
        case 1:
            return 'p-tag-warning';
        case 2:
            return 'p-tag-info';
        case 3:
            return 'p-tag-success';
        case 4:
            return 'p-tag-danger';
        case 5:
            return 'p-tag-danger';
        case 6:
            return 'p-tag-danger';
        case 7:
            return 'p-tag-danger';
        case 8:
            return 'p-tag-danger';
        case 9:
            return 'p-tag-danger';
        default:
            return 'p-tag-secondary';
    }
};
const getRecentInbound = async () => {
    const response = await api.get(`/fetchInboundPatients?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    inboundPatients.value = response.data;
};
const fetchDashboardCensus = async () => {
    const response = await api.get(`/fetchDashboardCensus?hciID=${hciID.value}`, { headers: header });
    dashboardCensus.value = response.data;
};
const fetchERCensus = async () => {
    const response = await api.get(`/fetchERCount`, { headers: header });
    erCensus.value = response.data[0];
};
const checkPasswordRequirements = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
};

const updatePassword = async () => {
    if (password.value !== confPassword.value) {
        notMatch.value = true;
        return false;
    }
    const isPasswordValid = checkPasswordRequirements(password.value);
    if (!isPasswordValid) {
        weakPass.value = true;
    } else {
        const response = await api.post(`/updatePassword`, { userID: userID.value, password: password.value }, { headers: header });
        Cookies.remove('tempPass');
        changepass.value = false;
        passwordUpdateSuccess();
    }
};
const reload = async (e) => {
    if (e.sent_to == hciID.value && e.notificationType != 7) {
        await getRecentInbound();
        await fetchDashboardCensus();
    }
};
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: 6001,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    disableStats: true,
    forceTLS: false
});
onMounted(async () => {
    window.Echo.channel('notification').listen('NewNotification', reload);
    fetching.value = true;
    hciID.value = Cookies.get('hciID');
    tempPasswordChanged.value = Cookies.get('tempPass');
    userID.value = Cookies.get('pID');
    fetchERCensus();
    await fetchDashboardCensus();
    await getRecentInbound();
    fetching.value = false;
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between">
                    <div>
                        <Skeleton v-if="fetching" class="mb-3" width="9rem" height="1rem"></Skeleton>
                        <span v-else class="block text-500 font-medium mb-3">Inbound Referrals</span>
                        <Skeleton v-if="fetching" width="8rem" height="2rem"></Skeleton>
                        <div v-else class="text-900 font-medium text-xl">{{ dashboardCensus.inboundCount }} Patients</div>
                    </div>
                    <Skeleton v-if="fetching" width="3rem" height="3rem"></Skeleton>
                    <div v-else class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-arrow-down text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between">
                    <div>
                        <Skeleton v-if="fetching" class="mb-3" width="9rem" height="1rem"></Skeleton>
                        <span v-else class="block text-500 font-medium mb-3">Outbound Referrals</span>
                        <Skeleton v-if="fetching" width="8rem" height="2rem"></Skeleton>
                        <div v-else class="text-900 font-medium text-xl">{{ dashboardCensus.outboundCount }} Patients</div>
                    </div>
                    <Skeleton v-if="fetching" width="3rem" height="3rem"></Skeleton>
                    <div v-else class="flex align-items-center justify-content-center bg-yellow-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-arrow-up text-yellow-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between">
                    <div>
                        <Skeleton v-if="fetching" class="mb-3" width="9rem" height="1rem"></Skeleton>
                        <span v-else class="block text-500 font-medium mb-3">Accepted Referrals</span>
                        <Skeleton v-if="fetching" width="8rem" height="2rem"></Skeleton>
                        <div v-else class="text-900 font-medium text-xl">{{ dashboardCensus.acceptedCount }} Patients</div>
                    </div>
                    <Skeleton v-if="fetching" width="3rem" height="3rem"></Skeleton>
                    <div v-else class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between">
                    <div>
                        <Skeleton v-if="fetching" class="mb-3" width="9rem" height="1rem"></Skeleton>
                        <span v-else class="block text-500 font-medium mb-3">Deferred Referrals</span>
                        <Skeleton v-if="fetching" width="8rem" height="2rem"></Skeleton>
                        <div v-else class="text-900 font-medium text-xl">{{ dashboardCensus.deferredCount }} Patients</div>
                    </div>
                    <Skeleton v-if="fetching" width="3rem" height="3rem"></Skeleton>
                    <div v-else class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-times text-red-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 xl:col-4">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-5">
                    <h5>JBLMGH ER Census</h5>
                </div>
                <ul class="list-none p-0 m-0">
                    <Skeleton v-if="fetching" class="mb-3" width="auto" height="1rem"></Skeleton>
                    <li v-else class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">On Going Consultations</span>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <span class="text-green-400 ml-3 font-medium">{{ erCensus.ongoing_ED_consultation_total }} Patients</span>
                        </div>
                    </li>
                    <Skeleton v-if="fetching" class="mb-3" width="auto" height="1rem"></Skeleton>
                    <li v-else class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Admitted Patients</span>
                            <div class="mt-1 text-600">Staying in the ER</div>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <span class="text-green-500 ml-3 font-medium">{{ erCensus.admitted_still_at_ED_total }} Patients</span>
                        </div>
                    </li>
                    <Skeleton v-if="fetching" class="mb-3" width="auto" height="1rem"></Skeleton>
                    <li v-else class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Total Number of Patients in the ER</span>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <span class="text-green-600 ml-3 font-bold">{{ erCensus.total_patients_total }} Patients</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col-12 xl:col-8">
            <div class="card">
                <h5>Recent Referrals</h5>
                <DataTable v-if="fetching" :value="tableSkeleton">
                    <Column :style="{ width: '180px' }" field="formatted_created_at" header="Date Referred">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '450px' }" field="fullName" header="Name">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '300px' }" field="referringHospitalDescription" header="Referring Hospital">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '100px' }" field="status" header="Referral Status">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                </DataTable>
                <DataTable v-else :value="inboundPatients.referrals" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" scrollDirection="both" class="mt-3">
                    <Column field="formatted_created_at" header="Date Referred"></Column>
                    <Column class="uppercase" field="fullName" header="Name"></Column>
                    <Column field="referringHospitalDescription" header="Referring Hospital"></Column>
                    <Column header="Referral Status">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.arrived !== 1" :value="getStatus(slotProps.data.referralStatus)" :class="getStatusClass(slotProps.data.referralStatus)" />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus > 3" value="Deferred - Arrived" class="p-tag-danger" />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus <= 3" value="Arrived" class="p-tag-success" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog
            v-model:visible="changepass"
            :closeOnEscape="false"
            modal
            :pt="{
                root: 'border-none',

                mask: {
                    style: 'backdrop-filter: blur(2px)'
                }
            }"
        >
            <template #container="{ closeCallback }">
                <div class="flex flex-column px-5 py-5 gap-4" style="border-radius: 12px; background-color: white">
                    <div class="inline-flex flex-column gap-2">
                        <h4>Change password</h4>
                        <span>Finalize your account setup by changing your password.</span>
                    </div>
                    <Message v-if="notMatch" severity="error">Passwords do not match.</Message>
                    <Message v-if="weakPass" severity="error">Please enter a stronger password</Message>
                    <div class="inline-flex flex-column gap-2">
                        <label for="username" class="font-semibold">Password</label>
                        <Password v-model="password" toggleMask :inputStyle="{ width: '100%' }">
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
                        <label for="password" class="font-semibold">Confirm Password</label>
                        <Password v-model="confPassword" :feedback="false" toggleMask :inputStyle="{ width: '100%' }" />
                    </div>
                    <div class="flex align-items-center gap-3">
                        <Button label="Change Password" @click="updatePassword" class="p-3 w-full" />
                    </div>
                </div>
            </template>
        </Dialog>
        <Toast position="bottom-center" group="bc">
            <template #message="slotProps">
                <div class="flex flex-column align-items-start" style="flex: 1">
                    <div class="flex align-items-center gap-2">
                        <span class="font-bold text-900">Password successfully changed!</span>
                    </div>
                    <div class="font-medium text-lg my-3 text-900">{{ slotProps.message.summary }}</div>
                </div>
            </template>
        </Toast>
    </div>
</template>
