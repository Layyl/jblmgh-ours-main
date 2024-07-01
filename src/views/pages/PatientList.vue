<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const router = useRouter();
const inboundPatients = ref([]);
const hciID = ref('');
const userID = ref('');
const inboundLastName = ref('');
const inboundFirstName = ref('');
const inboundMiddleName = ref('');
const inboundDepartment = ref('');
const services = ref([]);
const tableSkeleton = ref(new Array(5));
const expandedRows = ref([]);
const fetching = ref(false);
const header = { Authorization: `Bearer ${Cookies.get('token')}` };

const getStatus = (referralStatus) => {
    switch (referralStatus) {
        case 1:
            return 'Pending';
        case 2:
            return 'On-going Assessment';
        case 3:
            return 'Awaiting - Accepted';
        case 4:
            return 'Given Management';
        case 5:
            return 'Px Refused Transfer';
        case 6:
            return 'Trans. to OPCEN';
        case 7:
            return 'Trans. to other HCI';
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
const getStatusClassTL = (referralStatus) => {
    switch (referralStatus) {
        case 1:
            return 'bg-yellow-500';
        case 2:
            return 'bg-cyan-600';
        case 3:
            return 'bg-primary-600';
        case 4:
            return 'bg-red-600';
        case 5:
            return 'bg-red-600';
        case 6:
            return 'bg-red-600';
        case 7:
            return 'bg-red-600';
        case 8:
            return 'bg-red-600';
        case 9:
            return 'bg-red-600';
        case 10:
            return 'bg-red-600';
        default:
            return 'p-tag-secondary';
    }
};
const getStatusClassText = (referralStatus) => {
    switch (referralStatus) {
        case 1:
            return 'text-yellow-500';
        case 2:
            return 'text-cyan-600';
        case 3:
            return 'text-primary-600';
        case 4:
            return 'text-red-600';
        case 5:
            return 'text-red-600';
        case 6:
            return 'text-red-600';
        case 7:
            return 'text-red-600';
        case 8:
            return 'text-red-600';
        case 9:
            return 'text-red-600';
        default:
            return 'p-tag-secondary';
    }
};

const redirectToViewPatient = (referralID, referralHistoryID, safru) => {
    console.log(safru);
    if (safru == 1) {
        router.push(`/ours/viewPatientFormSafru?rid=${referralID}&rhid=${referralHistoryID}`);
    } else {
        router.push(`/ours/viewPatientForm?rid=${referralID}&rhid=${referralHistoryID}`);
    }
};

const showCancelButton = (referralHistory) => {
    return referralHistory.some((history) => history.referralStatus <= 2);
};

const searchPatient = async () => {
    if (hciID.value == '271' || userID.value == '5') {
        await fetchInboundPatientsOB();
    } else {
        await fetchInboundPatientsOB();
    }
};

const fetchInboundPatients = async () => {
    fetching.value = true;
    const response = await api.get(`/fetchInboundPatients?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}&department=${inboundDepartment.value}&hciID=${hciID.value}`, { headers: header });
    inboundPatients.value = response.data;
    fetching.value = false;
};

const fetchInboundPatientsOB = async () => {
    fetching.value = true;
    const response = await api.get(`/fetchInboundPatientsOB?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    inboundPatients.value = response.data;
    fetching.value = false;
};

const fetchDepartments = async () => {
    const response = await api.get(`/fetchServiceTypes`, { headers: header });
    services.value = response.data;
    console.log(services.value);
};

const clear = async (tab) => {
    if (tab == '1') {
        inboundLastName.value = '';
        inboundFirstName.value = '';
        inboundMiddleName.value = '';
        fetchInboundPatients();
    } else {
        outboundLastName.value = '';
        outboundFirstName.value = '';
        outboundMiddleName.value = '';
        fetchOutboundPatients();
    }
};

const cancelReferral = async (referralID) => {
    await api.post(`/cancelReferral?`, { referralID: referralID }, { headers: header });
    fetchOutboundPatients();
};

const reload = async (e) => {
    if (e.sent_to == hciID.value && e.notificationType != 7) {
        await fetchInboundPatients();
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
    enabledTransports: ['ws', 'wss']
});
onMounted(async () => {
    window.Echo.channel('notification').listen('NewNotification', reload);
    hciID.value = Cookies.get('hciID');
    userID.value = Cookies.get('uID');
    await fetchDepartments();
    if (hciID.value == '271' && userID.value == '5') {
        await fetchInboundPatientsOB();
    } else {
        await fetchInboundPatients();
    }
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 m-0 font-">Inbound Patients List</h3>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row gap-2 align-items-center">
                    <InputText @keyup.enter="fetchInboundPatients" class="w-full mt-1 mx-2" id="lastName" placeholder="Last Name" type="text" v-model="inboundLastName" />
                    <InputText @keyup.enter="fetchInboundPatients" class="w-full mt-1 mx-2" id="firstName" placeholder="First Name" type="text" v-model="inboundFirstName" />
                    <InputText @keyup.enter="fetchInboundPatients" class="w-full mt-1 mx-2" id="middleName" placeholder="Middle Name" type="text" v-model="inboundMiddleName" />
                    <Dropdown :disabled="userID == 14" v-model="inboundDepartment" :options="services" optionLabel="Description" optionValue="ServiceTypeID" placeholder="Select Department" class="w-full mt-1 mx-2" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="searchPatient" class="w-full mx-2" type="button" icon="pi pi-search" label="Search" />
                        <Button @click="clear(1)" class="w-full mx-2" severity="danger" type="button" icon="pi pi-times" label="Clear" />
                    </div>
                </div>
                <DataTable v-if="fetching" :value="tableSkeleton">
                    <Column :style="{ width: '180px' }" field="formatted_created_at" header="">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
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
                    <Column :style="{ width: '450px' }" field="fullName" header="Gender">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '300px' }" field="referringHospitalDescription" header="Age">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '100px' }" field="status" header="Referring Hospital">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '100px' }" field="status" header="Intended Department">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '50px' }" field="referringHospitalDescription" header="Referral Status">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                    <Column :style="{ width: '50px' }" field="referringHospitalDescription" header="Actions">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                </DataTable>
                <DataTable v-else :value="inboundPatients.referrals" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" scrollDirection="both" class="mt-3">
                    <Column class="uppercase" field="" header="">
                        <template #body="slotProps"><i v-tooltip.left="'Urgent Referral'" v-if="slotProps.data.isCritical == 1" class="pi pi-exclamation-triangle text-red-400" style="font-size: 1.4rem"></i></template
                    ></Column>
                    <Column class="uppercase" field="formatted_created_at" header="Date Referred"></Column>
                    <Column class="uppercase" field="fullName" header="Name"></Column>
                    <Column class="uppercase" field="gender" header="Gender">
                        <template #body="slotProps">
                            {{ slotProps.data.gender === 1 ? 'Male' : slotProps.data.gender === 2 ? 'Female' : 'Other' }}
                        </template>
                    </Column>
                    <Column class="uppercase" field="Age" header="Age"></Column>
                    <Column class="uppercase" field="referringHospitalDescription" header="Referring Hospital"></Column>
                    <Column class="uppercase" field="serviceType" header="Intended Department"></Column>
                    <Column class="uppercase" header="Referral Status">
                        <template #body="slotProps">
                            <Tag
                                v-if="slotProps.data.inTransit == 1 && slotProps.data.arrived != 1 && slotProps.data.referralStatus == 3"
                                value="In Transit"
                                class="p-tag-info cursor-pointer"
                                tabindex="1"
                                v-tooltip.focus.bottom="
                                    'Vehicle Plate #: ' +
                                    slotProps.data.vehicleNumber +
                                    ' \n \n Vehicle Type: ' +
                                    slotProps.data.vehicleType +
                                    ' \n \n In Transit Since: ' +
                                    slotProps.data.inTransitDateTime +
                                    ' \n \n ETA: ' +
                                    slotProps.data.eta +
                                    ' hour(s)'
                                "
                            />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus > 3" value="Deferred - Arrived" class="p-tag-danger" />
                            <Tag v-else-if="slotProps.data.arrived == 1 && slotProps.data.referralStatus <= 3" value="Arrived" class="p-tag-success" />
                            <Tag v-else :value="getStatus(slotProps.data.referralStatus)" :class="getStatusClass(slotProps.data.referralStatus)" />
                        </template>
                    </Column>
                    <Column class="uppercase" header="Actions" :style="{ width: '150px' }">
                        <template #body="slotProps">
                            <Button @click="redirectToViewPatient(slotProps.data.encryptedReferralID, slotProps.data.encryptedReferralHistoryID, slotProps.data.safru)" icon="pi pi-file" label="View" class="p-button p-button-green"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
