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
const erCensusDept = ref([]);
const dashboardCensus = ref('');
const processingCount = ref();
const tempPasswordChanged = ref('');
const userID = ref('');
const password = ref('');
const confPassword = ref('');
const notMatch = ref(false);
const weakPass = ref(false);
const passwordChangeSuccess = ref(false);
const fetching = ref(true);
const fetchingDashStats = ref(false);
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
        case 10:
            return 'Returned to JBLMGH';
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
        case 10:
            return 'p-tag-danger';
        default:
            return 'p-tag-secondary';
    }
};
const getRecentInbound = async () => {
    const response = await api.get(`/fetchInboundPatients?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    inboundPatients.value = response.data;
};
const fetchInboundPatientsOB = async () => {
    fetching.value = true;
    const response = await api.get(`/fetchInboundPatientsOB?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    inboundPatients.value = response.data;
    fetching.value = false;
};
const fetchDashboardCensus = async () => {
    const response = await api.get(`/fetchDashboardCensus?hciID=${hciID.value}`, { headers: header });
    dashboardCensus.value = response.data;
};
const fetchERCensus = async () => {
    fetchingDashStats.value = true;
    const response = await api.get(`/fetchERCount`, { headers: header });
    erCensus.value = response.data[0];
    fetchingDashStats.value = false;
};
const fetchERData = async () => {
    const response = await api.get(`/getDashboardStats`, { headers: header });
    erCensusDept.value = response.data;
};
const fetchProcessingCount = async () => {
    const response = await api.get(`/countProcessing`, { headers: header });
    processingCount.value = response.data;
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
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: 6001,
    wssPort: 70,
    forceTLS: false,
    encrypted: false,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    disableStats: true,
    debug: true,
    log: true,
    enabledTransports: ['ws', 'wss']
});
onMounted(async () => {
    window.Echo.channel('notification').listen('NewNotification', reload);
    // Access the Pusher instance from Echo
    const pusher = window.Echo.connector.pusher;

    fetchERCensus();
    fetching.value = true;
    hciID.value = Cookies.get('hciID');
    userID.value = Cookies.get('uID');
    await fetchProcessingCount();
    tempPasswordChanged.value = Cookies.get('tempPass');
    fetchERData();
    fetchDashboardCensus();
    if (hciID.value == '271' && userID.value == '5') {
        fetchInboundPatientsOB();
    } else {
        getRecentInbound();
    }
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
                        <span v-else class="block text-500 font-medium mb-3">JBL is Processing</span>
                        <Skeleton v-if="fetching" width="8rem" height="2rem"></Skeleton>
                        <div v-else class="text-900 font-medium text-xl">{{ processingCount.processingCount }} Patients</div>
                    </div>
                    <Skeleton v-if="fetching" width="3rem" height="3rem"></Skeleton>
                    <div v-else class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-hourglass text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 xl:col-12">
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
                            <Tag
                                v-if="slotProps.data.inTransit == 1 && slotProps.data.arrived != 1 && slotProps.data.referralStatus == 3"
                                value="In Transit"
                                class="p-tag-info cursor-pointer"
                                tabindex="1"
                                v-tooltip.focus.bottom="'Vehicle Plate #: ' + slotProps.data.vehicleNumber + ' \n \n Vehicle Type: ' + slotProps.data.vehicleType"
                            />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus > 3" value="Deferred - Arrived" class="p-tag-danger" />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus <= 3" value="Arrived" class="p-tag-success" />
                            <Tag v-else :value="getStatus(slotProps.data.referralStatus)" :class="getStatusClass(slotProps.data.referralStatus)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <div class="col-12 xl:col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-5">
                    <Skeleton v-if="fetchingDashStats" class="mb-3" width="10rem" height="2rem"></Skeleton>
                    <h5 v-else>JBLMGH ER Census</h5>
                </div>
                <Skeleton v-if="fetchingDashStats" class="mb-3" width="100%" height="50vh"></Skeleton>
                <DataTable v-else size="small" :value="erCensusDept.data" tableStyle="min-width: 50rem">
                    <Column field="department" header="Department">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.department }}</span>
                        </template>
                    </Column>
                    <!-- <Column class="text-center bg-green-100" field="consultation.lessthan4hrs" header="Less than 4 hrs">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.consultation.lessthan4hrs }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-green-100" field="consultation.morethan4hrs" header="More than 4 hrs">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.consultation.morethan4hrs }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-green-100" field="consultation.ambucare" header="Ambucare">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.consultation.ambucare }}</span>
                        </template>
                    </Column> -->
                    <Column class="text-center bg-green-100" field="consultation.total" header="For Consultations">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.consultation.total }}</span>
                        </template>
                    </Column>
                    <!-- <Column class="text-center bg-blue-100" field="admission.newlyadmitted" header="Newly Admitted">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.newlyadmitted }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-blue-100" field="admission.five_hrs" header="5 Hours">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.five_hrs }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-blue-100" field="admission.ten_hrs" header="10 Hours">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.ten_hrs }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-blue-100" field="admission.twenty_hrs" header="20 Hours">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.twenty_hrs }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-blue-100" field="admission.ambucareunit" header="ACU">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.ambucareunit }}</span>
                        </template>
                    </Column> -->
                    <Column class="text-center bg-blue-100" field="admission.total" header="Admitted (No Room)">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.admission.total }}</span>
                        </template>
                    </Column>
                    <Column class="text-center bg-pink-100" field="totalpatient" header="Total Patients">
                        <template #body="slotProps">
                            <span :class="{ 'summary-row': slotProps.data.department === 'Total' }">{{ slotProps.data.totalpatient }}</span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

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
<style>
.summary-row {
    font-weight: bold;
}
</style>
