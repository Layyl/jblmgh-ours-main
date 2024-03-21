<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
const router = useRouter();
const patients = ref([]);

const patientNumber = ref('');
const inboundLastName = ref('');
const inboundFirstName = ref('');
const inboundMiddleName = ref('');
const outboundLastName = ref('');
const outboundFirstName = ref('');
const outboundMiddleName = ref('');
const header = { Authorization: `Bearer ${Cookies.get('token')}` };

const getStatus = (status) => {
    switch (status) {
        case 1:
            return 'Pending';
        case 2:
            return 'Awaiting';
        case 3:
            return 'Awaiting - Accepted';
        case 4:
            return 'Arrived';
        default:
            return 'Unknown';
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 1:
            return 'p-tag-warning';
        case 2:
            return 'p-tag-info';
        case 3:
            return 'p-tag-info';
        case 4:
            return 'p-tag-success';
        default:
            return 'p-tag-secondary';
    }
};
const redirectToAddPatient = (referralID) => {
    router.push(`/ours/viewPatientForm?id=${referralID}`);
};
const fetchReferrals = async () => {
    const response = await api.get(`/fetchReferrals?lastName=${inboundLastName.value}&firstName=${inboundFirstName.value}&middleName=${inboundMiddleName.value}`, { headers: header });
    patients.value = response.data;
};
const clear = async () => {
    lastName.value = '';
    firstName.value = '';
    middleName.value = '';
    fetchReferrals();
};

onMounted(() => {
    fetchReferrals();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 m-0 font-">Patient Referrals List</h3>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <TabView>
                    <TabPanel header="Inbound Patients">
                        <div class="flex flex-column md:flex-row gap-2 align-items-center">
                            <InputText class="mt-1 mx-2" id="lastName" placeholder="Last Name" type="text" v-model="inboundLastName" />
                            <InputText class="mt-1 mx-2" id="firstName" placeholder="First Name" type="text" v-model="inboundFirstName" />
                            <InputText class="mt-1 mx-2" id="middleName" placeholder="Middle Name" type="text" v-model="inboundMiddleName" />
                            <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                                <Button @click="fetchReferrals" type="button" icon="pi pi-search" label="Search" />
                                <Button @click="clear" class="mx-2" severity="danger" type="button" icon="pi pi-times" label="Clear" />
                            </div>
                        </div>
                        <DataTable :value="patients.referrals" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" scrollDirection="both" class="mt-3">
                            <Column field="formatted_created_at" header="Date Referred"></Column>
                            <Column field="fullName" header="Name"></Column>
                            <Column field="gender" header="Gender">
                                <template #body="slotProps">
                                    {{ slotProps.data.gender === 1 ? 'Male' : slotProps.data.gender === 2 ? 'Female' : 'Other' }}
                                </template>
                            </Column>
                            <Column field="description" header="Referring Hospital"></Column>
                            <Column header="Referral Status">
                                <template #body="slotProps">
                                    <Tag :value="getStatus(slotProps.data.status)" :class="getStatusClass(slotProps.data.status)" />
                                </template>
                            </Column>
                            <Column header="Actions" :style="{ width: '150px' }">
                                <template #body="slotProps">
                                    <Button @click="redirectToAddPatient(slotProps.data.referralID)" icon="pi pi-file" label="View" class="p-button p-button-green"></Button>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Outbound Patients">
                        <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                            <InputText class="mt-1 mx-2" id="lastName" placeholder="Last Name" type="text" v-model="outboundLastName" />
                            <InputText class="mt-1 mx-2" id="firstName" placeholder="First Name" type="text" v-model="outboundFirstName" />
                            <InputText class="mt-1 mx-2" id="middleName" placeholder="Middle Name" type="text" v-model="outboundMiddleName" />
                            <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                                <Button @click="fetchReferrals" type="button" icon="pi pi-search" label="Search" />
                                <Button @click="clear" class="mx-2" severity="danger" type="button" icon="pi pi-times" label="Clear" />
                            </div>
                        </div>
                        <DataTable :value="patients.referrals" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" scrollDirection="both" class="mt-3">
                            <Column field="formatted_created_at" header="Date Referred"></Column>
                            <Column field="fullName" header="Name"></Column>
                            <Column field="gender" header="Gender">
                                <template #body="slotProps">
                                    {{ slotProps.data.gender === 1 ? 'Male' : slotProps.data.gender === 2 ? 'Female' : 'Other' }}
                                </template>
                            </Column>
                            <Column field="description" header="Destination Hospital"></Column>
                            <Column header="Referral Status">
                                <template #body="slotProps">
                                    <Tag :value="getStatus(slotProps.data.status)" :class="getStatusClass(slotProps.data.status)" />
                                </template>
                            </Column>
                            <Column header="Actions" :style="{ width: '150px' }">
                                <template #body="slotProps">
                                    <Button @click="redirectToAddPatient(slotProps.data.referralID)" icon="pi pi-file" label="View" class="p-button p-button-green"></Button>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
</template>
