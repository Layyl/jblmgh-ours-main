<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();
const masterfile = ref([]);
const hciID = ref('');
const masterfileLastName = ref('');
const masterfileFirstName = ref('');
const masterfileMiddleName = ref('');
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
const redirectToViewPatient = (referralID, referralHistoryID, safru) => {
    if (safru == 1) {
        router.push(`/ours/viewPatientFormSafru?rid=${referralID}&rhid=${referralHistoryID}`);
    } else {
        router.push(`/ours/ViewPatientMasterfile?rid=${referralID}&rhid=${referralHistoryID}`);
    }
};
const showCancelButton = (referralHistory) => {
    return referralHistory.some((history) => history.referralStatus <= 2);
};
const fetchMasterfile = async () => {
    fetching.value = true;
    const response = await api.get(`/fetchMasterfile?lastName=${masterfileLastName.value}&firstName=${masterfileFirstName.value}&middleName=${masterfileMiddleName.value}&hciID=${hciID.value}`, { headers: header });
    masterfile.value = response.data;
    fetching.value = false;
};
const clear = async (tab) => {
    masterfileLastName.value = '';
    masterfileFirstName.value = '';
    masterfileMiddleName.value = '';
    fetchMasterfile();
};
const cancelReferral = async (referralID) => {
    await api.post(`/cancelReferral?`, { referralID: referralID }, { headers: header });
    fetchMasterfile();
};
onMounted(async () => {
    if (Cookies.get('hciID') != '1') {
        hciID.value = Cookies.get('hciID');
        console.log(hciID.value);
    } else {
        hciID.value = 271;
        console.log(hciID.value);
    }
    await fetchMasterfile();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 m-0 font-">Referrals Masterlist</h3>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <InputText @keyup.enter="fetchMasterfile" class="w-full mt-1 mx-2" id="lastName" placeholder="Last Name" type="text" v-model="masterfileLastName" />
                    <InputText @keyup.enter="fetchMasterfile" class="w-full mt-1 mx-2" id="firstName" placeholder="First Name" type="text" v-model="masterfileFirstName" />
                    <InputText @keyup.enter="fetchMasterfile" class="w-full mt-1 mx-2" id="middleName" placeholder="Middle Name" type="text" v-model="masterfileMiddleName" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="fetchMasterfile" class="w-full mx-2" type="button" icon="pi pi-search" label="Search" />
                        <Button @click="clear(2)" class="w-full mx-2" severity="danger" type="button" icon="pi pi-times" label="Clear" />
                    </div>
                </div>
                <DataTable paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" v-if="fetching" :value="tableSkeleton">
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

                <DataTable paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" v-else v-model:expandedRows="expandedRows" :value="masterfile.referrals" dataKey="referralID" tableStyle="min-width: 60rem">
                    <Column expander style="width: 5rem" />
                    <Column class="uppercase" field="formatted_created_at" header="Date Referred"></Column>
                    <Column class="uppercase" field="fullName" header="Name"></Column>
                    <Column field="Age" header="Age"></Column>
                    <Column class="uppercase" field="gender" header="Gender">
                        <template #body="slotProps">
                            {{ slotProps.data.gender === 1 ? 'Male' : slotProps.data.gender === 2 ? 'Female' : 'Other' }}
                        </template>
                    </Column>
                    <Column class="uppercase" field="referringHospitalDescription" header="Referred By"></Column>
                    <Column class="uppercase" header="Actions" :style="{ width: '150px' }">
                        <template #body="slotProps">
                            <Button @click="redirectToViewPatient(slotProps.data.EncryptedReferralID, slotProps.data.referralHistory[0].encryptedReferralHistoryID, slotProps.data.safru)" label="View"></Button>
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
                                                Status: <span class="font-bold" :class="getStatusClassText(slotProps.item.referralStatus)">{{ getStatus(slotProps.item.referralStatus) }}</span>
                                            </p>
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
</template>
