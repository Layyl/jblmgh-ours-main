<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const patients = ref([]);
const loading = ref(false);
const lastName = ref('');
const firstName = ref('');
const middleName = ref('');
const noMatch = ref(false);
const header = { Authorization: `Bearer ${Cookies.get('token')}` };

const redirectToAddPatient = (patientId) => {
    const route = patientId ? `/ours/addPatientForm?id=${patientId}` : `/ours/addPatientForm?id=new`;
    router.push(route);
};

const searchPatient = async () => {
    loading.value = true;
    await axios({
        url: `http://192.163.8.195:90/api/searchPatients?lastName=${lastName.value}&firstName=${firstName.value}&middleName=${middleName.value}`,
        method: 'GET',
        headers: header,
        data: {}
    }).then((res) => {
        patients.value = res.data;
        if (patients.value.patients.length == 0) {
            noMatch.value = true;
            console.log(noMatch.value);
        }
        console.log(patients.value);
        loading.value = false;
    });
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

onMounted(() => {});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 font-">Patient Registration</h3>
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <InputText @keyup.enter="searchPatient" class="mt-1 mx-2 w-full" id="lastName" placeholder="Last Name" type="text" v-model="lastName" />
                    <InputText @keyup.enter="searchPatient" class="mt-1 mx-2 w-full" id="firstName" placeholder="First Name" type="text" v-model="firstName" />
                    <InputText @keyup.enter="searchPatient" class="mt-1 mx-2 w-full" id="middleName" placeholder="Middle Name" type="text" v-model="middleName" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="searchPatient" class="mx-2 w-full" :disabled="lastName == ''" type="button" icon="pi pi-search" label="Search" :loading="loading" />
                        <Button @click="clear" class="mx-2 w-full" severity="danger" type="button" icon="pi pi-times" label="Clear" :loading="loading" />
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <DataTable :value="patients.patients" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" :loading="loading" scrollDirection="both" class="mt-3">
                    <Column field="lastName" header="Last Name"></Column>
                    <Column field="firstName" header="First Name"></Column>
                    <Column field="middleName" header="Middle Name"></Column>
                    <Column field="gender" header="Gender">
                        <template #body="{ data }">
                            {{ data.gender === 1 ? 'Male' : data.gender === 2 ? 'Female' : 'Unknown' }}
                        </template>
                    </Column>
                    <Column field="birthDate" header="Date of Birth">
                        <template #body="{ data }">
                            {{ formatDate(data.birthDate) }}
                        </template>
                    </Column>
                    <Column header="Action" :style="{ width: '200px' }">
                        <template #body="slotProps">
                            <Button @click="redirectToAddPatient(slotProps.data.patientID)" icon="pi pi-user-plus" severity="primary" size="small" label="Add Referral"></Button>
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
    </div>
</template>
