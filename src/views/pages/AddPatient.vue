<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
const router = useRouter();
const patients = ref([]);
const unpostedReferrals = ref([]);
const showMedixSearch = ref(false);
const loading = ref(false);
const lastName = ref('');
const firstName = ref('');
const middleName = ref('');
const mLastName = ref('');
const mFirstName = ref('');
const mMiddleName = ref('');
const announcement = ref('');
const erCensus = ref([]);
const noMatch = ref(false);
const hciID = ref('');
const header = { Authorization: `Bearer ${Cookies.get('token')}` };

const redirectToAddPatient = (patientId) => {
    const route = patientId ? `/ours/addPatientForm?id=${patientId}` : `/ours/addPatientForm?id=new`;
    router.push(route);
};
const fetchERCensus = async () => {
    const response = await api.get(`/fetchERCount`, { headers: header });
    erCensus.value = response.data[0];
};
const searchPatient = async () => {
    loading.value = true;
    await axios({
        url: `${import.meta.env.VITE_API_BASE_URL}/searchPatients?lastName=${mLastName.value}&firstName=${mFirstName.value}&middleName=${mMiddleName.value}`,
        method: 'GET',
        headers: header,
        data: {}
    }).then((res) => {
        patients.value = res.data;
        if (patients.value.patients.length == 0) {
            noMatch.value = true;
        }
        loading.value = false;
    });
};

const fetchUnpostedReferrals = async () => {
    loading.value = true;
    await axios({
        url: `${import.meta.env.VITE_API_BASE_URL}/fetchUnpostedReferrals?lastName=${lastName.value}&firstName=${firstName.value}&middleName=${middleName.value}&hciID=${hciID.value}`,
        method: 'GET',
        headers: header,
        data: {}
    }).then((res) => {
        unpostedReferrals.value = res.data;
        if (unpostedReferrals.value.length == 0) {
            noMatch.value = true;
        }
        loading.value = false;
    });
};

const redirectToEditPatient = (referralID, referralHistoryID) => {
    router.push(`/ours/editPatient?rid=${referralID}&rhid=${referralHistoryID}`);
};

const addPatientRedirect = async () => {
    if (hciID.value !== '271') {
        router.push('/ours/AddPatientForm?id=new');
    } else {
        showMedixSearch.value = true;
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};
const clear = async () => {
    lastName.value = '';
    firstName.value = '';
    middleName.value = '';
};
const getAnnouncement = async () => {
    const response = await api.get(`/fetchActiveAnnouncements`, { headers: header });
    announcement.value = response.data;
};
onMounted(async () => {
    hciID.value = Cookies.get('hciID');
    console.log(hciID.value);
    loading.value = true;
    getAnnouncement();
    await fetchERCensus();
    await fetchUnpostedReferrals();
    loading.value = false;
});
</script>

<template>
    <Message v-if="announcement.announcement" severity="info" :closable="false"
        >Announcement: <span class="font-bold font-itali">{{ announcement.announcement }} </span></Message
    >
    <Message severity="warn" :closable="false" v-if="!loading"
        >NOTE: There are currently <span class="font-bold font-italic">{{ erCensus.ongoing_ED_consultation_total }} On-going ED Consultations</span> and
        <span class="font-bold font-italic">{{ erCensus.admitted_still_at_ED_total }} Admitted patients still in the ER</span> for a total of
        <span class="font-bold font-italic">{{ erCensus.total_patients_total }} patients in the ER</span>
    </Message>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 font-">Patient Registration</h3>
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <InputText :disabled="loading" @keyup.enter="fetchUnpostedReferrals" class="mt-1 mr-1 w-full" id="lastName" placeholder="Last Name" type="text" v-model="lastName" />
                    <InputText :disabled="loading" @keyup.enter="fetchUnpostedReferrals" class="mt-1 mr-1 w-full" id="firstName" placeholder="First Name" type="text" v-model="firstName" />
                    <InputText :disabled="loading" @keyup.enter="fetchUnpostedReferrals" class="mt-1 mr-1 w-full" id="middleName" placeholder="Middle Name" type="text" v-model="middleName" />

                    <Button @click="fetchUnpostedReferrals" class="mx-1 w-5" size="small" :disabled="lastName == ''" type="button" icon="pi pi-search" label="Search Patients" :loading="loading" />
                    <Button v-if="hciID.value == '271'" @click="clear" size="small" class="mx-2 w-5" severity="danger" type="button" icon="pi pi-times" label="Clear" :loading="loading" />
                    <Button v-else @click="addPatientRedirect" size="small" class="mx-2 w-5" severity="info" type="button" icon="pi pi-plus" label="Add Referrals" :loading="loading" />
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <DataTable :value="unpostedReferrals.referrals" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" :loading="loading" scrollDirection="both" class="mt-3">
                    <Column field="lastName" header="Last Name"></Column>
                    <Column field="firstName" header="First Name"></Column>
                    <Column field="middleName" header="Middle Name"></Column>
                    <Column field="gender" header="Gender">
                        <template #body="{ data }">
                            {{ data.gender == '1' ? 'Male' : data.gender == '2' ? 'Female' : 'Unknown' }}
                        </template>
                    </Column>
                    <Column field="BirthDate" header="Date of Birth">
                        <template #body="{ data }">
                            {{ formatDate(data.birthDate) }}
                        </template>
                    </Column>
                    <Column header="Action" :style="{ width: '200px' }">
                        <template #body="slotProps">
                            <Button
                                v-tooltip.top="'Edit Referral'"
                                @click="redirectToEditPatient(slotProps.data.referralHistory[0].encryptedReferralID, slotProps.data.referralHistory[0].encryptedReferralHistoryID)"
                                icon="pi pi-pencil"
                                label="Finalize"
                                class="p-button mr-3"
                            ></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <p v-if="patients.patients && patients.patients.length !== 0" class="text-base select-none">
                No matches? <span @click="redirectToAddPatient()" class="text-sm select-none cursor-pointer font-bold text-green-600 bg-primary p-2 border-round">Add New Patient</span>
            </p>
        </div>
        <Dialog v-model:visible="noMatch" modal :closable="false" header="No Match Found" :style="{ width: '25rem', textAlign: 'center' }">
            <span class="p-text-secondary block mb-5">No patient data was found. Do you want to add a new patient?</span>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Add New" class="btn-primary" @click="redirectToAddPatient()"></Button>
                <Button type="button" label="Cancel" severity="danger" @click="noMatch = false"></Button>
            </div>
        </Dialog>
        <Dialog v-model:visible="showMedixSearch" modal header="Search JBLMGH Patients" :style="{ width: '90rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="row flex flex-column md:flex-row">
                <div class="col-12 md:col-3">
                    <InputText :disabled="loading" @keyup.enter="searchPatient" class="mt-1 mr-1 w-full" id="lastName" placeholder="Last Name" type="text" v-model="mLastName" />
                </div>
                <div class="col-12 md:col-3">
                    <InputText :disabled="loading" @keyup.enter="searchPatient" class="mt-1 mr-1 w-full" id="lastName" placeholder="First Name" type="text" v-model="mFirstName" />
                </div>
                <div class="col-12 md:col-3">
                    <InputText :disabled="loading" @keyup.enter="searchPatient" class="mt-1 mr-1 w-full" id="lastName" placeholder="Middle Name" type="text" v-model="mMiddleName" />
                </div>
                <div class="col-12 md:col-3">
                    <Button @click="searchPatient" class="mx-1 w-full" :disabled="lastName == ''" type="button" icon="pi pi-search" label="Search" :loading="loading" />
                </div>
            </div>
            <div class="row">
                <DataTable :value="patients.patients" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" :loading="loading" scrollDirection="both" class="mt-3">
                    <Column field="lastName" header="Last Name"></Column>
                    <Column field="firstName" header="First Name"></Column>
                    <Column field="middleName" header="Middle Name"></Column>
                    <Column field="gender" header="Gender">
                        <template #body="{ data }">
                            {{ data.gender == 'M' ? 'Male' : data.gender == 'F' ? 'Female' : 'Unknown' }}
                        </template>
                    </Column>
                    <Column field="BirthDate" header="Date of Birth">
                        <template #body="{ data }">
                            {{ formatDate(data.BirthDate) }}
                        </template>
                    </Column>
                    <Column header="Action" :style="{ width: '200px' }">
                        <template #body="slotProps">
                            <Button @click="redirectToAddPatient(slotProps.data.encryptedPatientID)" icon="pi pi-user-plus" severity="primary" size="small" label="Add Referral"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </Dialog>
    </div>
</template>
