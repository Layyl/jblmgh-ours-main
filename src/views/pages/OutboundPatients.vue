<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();
const inboundPatients = ref([]);
const outboundPatients = ref([]);
const hciID = ref('');
const outboundLastName = ref('');
const outboundFirstName = ref('');
const outboundMiddleName = ref('');
const loading = ref(false);
const loadingHeader = ref('');
const loadingText = ref('');
const forCancel = ref('');
const cancelModal = ref(false);
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

const redirectToViewPatient = (referralID, referralHistoryID) => {
    router.push(`/ours/viewPatientForm?rid=${referralID}&rhid=${referralHistoryID}`);
};

const showCancelButton = (referralHistory) => {
    return referralHistory.some((history) => history.referralStatus <= 2);
};

const fetchOutboundPatients = async () => {
    fetching.value = true;
    const response = await api.get(`/fetchOutboundPatients?lastName=${outboundLastName.value}&firstName=${outboundFirstName.value}&middleName=${outboundMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    outboundPatients.value = response.data;
    fetching.value = false;
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
    await api.post(`/cancelReferral`, { referralID: referralID }, { headers: header });
    fetchOutboundPatients();
};

const setLoadingState = async (header, text) => {
    loading.value = true;
    loadingHeader.value = header;
    loadingText.value = text;
};

const hideLoadingModal = (header, text) => {
    loadingHeader.value = header;
    loadingText.value = text;
    loadingProgress.value = false;
    setTimeout(() => {
        loading.value = false;
        location.reload();
    }, 1000);
};

const handleCancelButton = (referralID) => {
    forCancel.value = referralID;
    cancelModal.value = true;
};

const handleCancelClick = async () => {
    await setLoadingState('Cancelling...', 'Cancelling referral. Please wait');
    cancelReferral(forCancel.value);
    hideLoadingModal('Successfully Cancelled!🎉', 'Referral is successfully cancelled.');
};

const cancel = () => {
    cancelModal.value = false;
};

onMounted(async () => {
    hciID.value = Cookies.get('hciID');
    console.log(hciID.value);
    await fetchOutboundPatients();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 m-0 font-">Outbound Patients List</h3>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <InputText @keyup.enter="fetchOutboundPatients" class="w-full mt-1 mx-2" id="lastName" placeholder="Last Name" type="text" v-model="outboundLastName" />
                    <InputText @keyup.enter="fetchOutboundPatients" class="w-full mt-1 mx-2" id="firstName" placeholder="First Name" type="text" v-model="outboundFirstName" />
                    <InputText @keyup.enter="fetchOutboundPatients" class="w-full mt-1 mx-2" id="middleName" placeholder="Middle Name" type="text" v-model="outboundMiddleName" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="fetchOutboundPatients" class="w-full mx-2" type="button" icon="pi pi-search" label="Search" />
                        <Button @click="clear(2)" class="w-full mx-2" severity="danger" type="button" icon="pi pi-times" label="Clear" />
                    </div>
                </div>
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
                    <Column :style="{ width: '50px' }" field="referringHospitalDescription" header="Actions">
                        <template #body>
                            <Skeleton></Skeleton>
                        </template>
                    </Column>
                </DataTable>

                <DataTable v-else v-model:expandedRows="expandedRows" :value="outboundPatients.referrals" dataKey="referralID" tableStyle="min-width: 60rem">
                    <Column expander style="width: 5rem" />
                    <Column class="uppercase" field="formatted_created_at" header="Date Referred"></Column>
                    <Column class="uppercase" field="fullName" header="Name"></Column>
                    <Column class="uppercase" field="gender" header="Gender">
                        <template #body="slotProps">
                            {{ slotProps.data.gender === 1 ? 'Male' : slotProps.data.gender === 2 ? 'Female' : 'Other' }}
                        </template>
                    </Column>
                    <Column class="uppercase" header="Actions" :style="{ width: '150px' }">
                        <template #body="slotProps">
                            <Button v-if="showCancelButton(slotProps.data.referralHistory)" @click="handleCancelButton(slotProps.data.referralID)" icon="pi pi-times" label="Cancel" class="p-button p-button-danger"></Button>
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <div class="pt-5">
                            <h5>Referral History</h5>

                            <Timeline
                                :value="slotProps.data.referralHistory"
                                class="customized-timeline"
                                :pt="{
                                    opposite: {
                                        style: 'display:none;'
                                    }
                                }"
                            >
                                <template #marker="slotProps">
                                    <span class="flex w-1rem h-1rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" :class="getStatusClassTL(slotProps.item.referralStatus)"></span>
                                </template>
                                <template #content="slotProps">
                                    <Card
                                        class="mt-3"
                                        style="width: 65vw"
                                        :pt="{
                                            root: {
                                                style: 'box-shadow:none; border:1px #e6e6e6 solid;'
                                            },
                                            title: {
                                                style: 'font-size:1.2rem;'
                                            }
                                        }"
                                    >
                                        <template #title>
                                            {{ slotProps.item.receivingHospitalDescription }}
                                        </template>
                                        <template #subtitle>
                                            {{ slotProps.item.formatted_created_at }}
                                        </template>
                                        <template #content>
                                            <p>
                                                Status: <span v-if="slotProps.item.arrived != 1" class="font-bold" :class="getStatusClassText(slotProps.item.referralStatus)">{{ getStatus(slotProps.item.referralStatus) }}</span>
                                                <span v-else-if="slotProps.item.arrived == 1 && slotProps.item.referralStatus > 3" class="font-bold" :class="getStatusClassText(slotProps.item.referralStatus)">Defferred - Arrived</span>
                                                <span v-else-if="slotProps.item.arrived == 1 && slotProps.item.referralStatus <= 3" class="font-bold" :class="getStatusClassText(slotProps.item.referralStatus)">Accepted - Arrived</span>
                                            </p>
                                            <Button @click="redirectToViewPatient(slotProps.item.encryptedReferralID, slotProps.item.encryptedReferralHistoryID)" v-if="slotProps.item.referralStatus <= 3" label="View Referral"></Button>
                                        </template>
                                    </Card>
                                </template>
                            </Timeline>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- LOADING  -->
    <Dialog v-model:visible="loading" modal :header="loadingHeader" :closable="false" :style="{ width: '25rem' }">
        <div class="flex align-items-center gap-3 mb-3">
            <p>{{ loadingText }}</p>
        </div>
        <ProgressBar v-if="loadingProgress" mode="indeterminate" style="height: 6px"></ProgressBar>
    </Dialog>

    <!-- CANCEL REFERRAL -->
    <Dialog closable v-model:visible="cancelModal" modal header="Defer Patient" :closable="false" :style="{ width: '26rem' }">
        <div class="align-items-center gap-3 mb-3">
            <p>Are you sure you want to cancel referral?</p>
        </div>
        <div class="flex justify-content-end gap-2">
            <Button @click="handleCancelClick" type="button" label="Submit" severity="primary"></Button>
            <Button @click="cancel" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
        </div>
    </Dialog>
</template>
