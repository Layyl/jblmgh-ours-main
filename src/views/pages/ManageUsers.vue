<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
const router = useRouter();
const users = ref([]);
const loading = ref(false);
const lastName = ref('');
const firstName = ref('');
const middleName = ref('');
const hciID = ref('');
const verificationStatus = ref('');
const hciList = ref([]);
const selectedHCI = ref([]);
const addNew = ref(false);
const saving = ref(false);
const savingHeader = ref('');
const savingText = ref('');
const savingProgress = ref(true);
const deleteModal = ref(false);
const idToDelete = ref('');
const newEmail = ref('');
const newNumber = ref('');
const userToChangeEmail = ref('');
const editUser = ref(false);
const changeEmail = ref(false);
const changeNumber = ref(false);
const modalTitleResponse = ref('');
const modalMessageResponse = ref('');
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const verificationStat = ref([
    { status: 'For Verification', value: 1 },
    { status: 'Verified', value: 2 }
]);
const newUser = ref({
    username: '',
    hciID: '',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    contactNo: '',
    emailAddress: ''
});

const redirectToAddPatient = (patientId) => {
    const route = patientId ? `/ours/addPatientForm?id=${patientId}` : `/ours/addPatientForm?id=new`;
    router.push(route);
};

const searchPatient = async () => {
    loading.value = true;
    await axios({
        url: `${import.meta.env.VITE_API_BASE_URL}/fetchUsers?hospital=${hciID.value}&verification=${verificationStatus.value}`,
        method: 'GET',
        headers: header,
        data: {}
    }).then((res) => {
        users.value = res.data;
        loading.value = false;
    });
};

const fetchReferringHCIs = async () => {
    const response = await api.get(`/fetchHealthCareInstitution`, { headers: header });
    hciList.value = response.data;
};

const fetchSelectedReferringHCI = async () => {
    const response = await api.get(`/fetchHealthCareInstitution?HealthFacilityCodeShort=${newUser.value.hciID}`, { headers: header });
    selectedHCI.value = response.data[0];

    const facilityName = selectedHCI.value.FacilityName;
    const facilityCodeShort = selectedHCI.value.HealthFacilityCodeShort;
    const facilityInitials = facilityName
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
    const username = `${facilityInitials}-${facilityCodeShort}`;
    newUser.value.username = username;
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const clear = async () => {
    lastName.value = '';
    firstName.value = '';
    middleName.value = '';
    hospital.value = '';
    searchPatient();
};

const validateRequiredFields = () => {
    let error = false;
    let firstErrorField = null; // Reference to the first unfilled required field
    const fields = document.querySelectorAll("input[required], select[required], input[type='radio'][required], textarea[required]");

    fields.forEach((field) => {
        if (field.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name='${field.name}']`);
            const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
            if (!isChecked) {
                error = true;
                if (!firstErrorField) {
                    firstErrorField = radioGroup[0];
                }
                radioGroup[0].classList.add('p-invalid');
            } else {
                radioGroup.forEach((radio) => radio.classList.remove('p-invalid'));
            }
        } else if (field.tagName.toLowerCase() === 'select' && field.classList.contains('p-dropdown')) {
            // Validation for PrimeVue dropdown
            const dropdown = Dropdown.getDropdown(field);
            if (!dropdown.value) {
                error = true;
                if (!firstErrorField) {
                    firstErrorField = dropdown.$el;
                }
                dropdown.$el.classList.add('p-invalid');
            } else {
                dropdown.$el.classList.remove('p-invalid');
            }
        } else {
            if (field.value === '') {
                error = true;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
                field.classList.add('p-invalid');
            } else {
                field.classList.remove('p-invalid');
            }
        }
    });

    if (error) {
        validation.value = true;
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
        return false;
    }
    return true;
};

const createAccount = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/createAccount`, newUser.value, { headers: header });
};

const resendVerification = async (userEmail) => {
    const response = await api.post(`/resendVerificationEmail`, { email: userEmail }, { headers: header });
};

const closeModal = async () => {
    addNew.value = false;
    deleteModal.value = false;
    newUser.value.username = '';
    newUser.value.hciID = '';
    newUser.value.lastName = '';
    newUser.value.firstName = '';
    newUser.value.middleName = '';
    newUser.value.suffix = '';
    newUser.value.contactNo = '';
    newUser.value.emailAddress = '';
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
    }, 2000);
};

const handleCreateAccount = async () => {
    await setLoadingState('Signing up', 'Creating new account. Please Wait.');
    await createAccount();
    await hideLoadingModal('Account Created Successfully!🥳', 'You have successfully created the account. An email will be sent to the indicated user regarding the account creation.');
    await closeModal();
};
const handleUpdateEmail = async () => {
    await setLoadingState('Updating', 'Updating email address. Please wait.');
    await updateEmail();
    await hideLoadingModal(modalTitleResponse.value, modalMessageResponse.value);
    await closeModal();
};
const handleUpdateNumber = async () => {
    await setLoadingState('Updating', 'Updating phone number. Please wait.');
    await updateNumber();
    await hideLoadingModal(modalTitleResponse.value, modalMessageResponse.value);
    await closeModal();
};

const handleResendVerification = async (email) => {
    await setLoadingState('Emailing user', 'Resending email verification. Please Wait.');
    await resendVerification(email);
    await hideLoadingModal('Email Sent!🥳', 'Verification email has been re-sent to the user.');
    await closeModal();
};

const handleDeleteClick = async (ID) => {
    idToDelete.value = ID;
    deleteModal.value = true;
};

const handleEditProfile = async (user) => {
    userToChangeEmail.value = user;
    editUser.value = true;
};

const handleChangeEmail = async () => {
    changeEmail.value = true;
    editUser.value = false;
};

const handleChangNumber = async () => {
    changeNumber.value = true;
    editUser.value = false;
};

const removeUser = async () => {
    const response = await api.post(`/removeUser`, { userID: idToDelete.value }, { headers: header });
    searchPatient();
};

const updateNumber = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/updateNumber`, { userID: userToChangeEmail.value.id, contactno: newNumber.value }, { headers: header });
    changeNumber.value = false;
    newNumber.value = '';
    modalTitleResponse.value = response.data.title;
    modalMessageResponse.value = response.data.message;
    searchPatient();
};

const updateEmail = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/updateEmail`, { userID: userToChangeEmail.value.id, email: newEmail.value }, { headers: header });
    changeEmail.value = false;
    newEmail.value = '';
    modalTitleResponse.value = response.data.title;
    modalMessageResponse.value = response.data.message;
    searchPatient();
};

const handleRemoveUser = async () => {
    await setLoadingState('Updating Users List', 'Removing User. Please Wait.');
    await removeUser();
    await hideLoadingModal('Users List Updated!🥳', 'You have successfully removed User. ');
    await closeModal();
};

onMounted(async () => {
    await fetchReferringHCIs();
    await searchPatient();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 font-">User Management</h3>
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <InputText @keyup.enter="searchPatient" id="username" v-model="hciID" placeholder="Type Hospital Name" class="flex-auto" autocomplete="off" />
                    <Dropdown @keyup.enter="searchPatient" @change="searchPatient" class="mt-1 mx-1 w-100" :options="verificationStat" optionLabel="status" optionValue="value" placeholder="Select Verification Status" v-model="verificationStatus" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="searchPatient" class="mx-1" type="button" icon="pi pi-search" label="Search" :loading="loading" />
                        <Button @click="addNew = true" class="mx-1" severity="info" type="button" icon="pi pi-plus" label="Add" :loading="loading" />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <DataTable :value="users" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" :loading="loading" scrollDirection="both" class="mt-3 text-center">
                    <Column class="uppercase" field="id" header="User ID "></Column>
                    <Column class="uppercase" field="username" header="Username"></Column>
                    <Column class="uppercase" field="FacilityName" header="Hospital"></Column>
                    <Column class="uppercase" field="contactno" header="Contact No"></Column>
                    <Column class="uppercase" field="email" header="Email"></Column>
                    <Column class="uppercase" field="" header="Status">
                        <template #body="slotProps">
                            <span
                                :class="{
                                    'text-green-600 font-bold': slotProps.data.email_verified_at != null || slotProps.data.remember_token !== null,
                                    'text-yellow-600 font-bold': slotProps.data.email_verified_at == null && slotProps.data.remember_token == null
                                }"
                            >
                                {{ slotProps.data.email_verified_at === null && slotProps.data.remember_token === null ? 'For Verification' : 'Verified' }}</span
                            >
                        </template>
                    </Column>
                    <Column class="uppercase" header="Action" :style="{ width: '200px' }">
                        <template #body="slotProps">
                            <div>
                                <Button @click="handleEditProfile(slotProps.data)" icon="pi pi-cog" severity="info" label="Edit User Info" size="small" class="mx-1 my-1"></Button>
                                <Button @click="handleDeleteClick(slotProps.data.id)" icon="pi pi-trash" severity="danger" label="Remove Account" size="small" class="mx-1 my-1"></Button>
                                <Button v-if="!slotProps.data.email_verified_at" @click="handleResendVerification(slotProps.data.email)" icon="pi pi-refresh" severity="success" size="small" label="Reverify" class="mx-1 my-1"></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <Dialog v-model:visible="addNew" modal header="Add User" :style="{ width: '50rem' }">
            <span class="p-text-secondary block mb-5">Please enter user's information. Password will automatically be set to the default password.</span>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="username" class="font-semibold w-6rem">Hospital</label>
                <Dropdown @change="fetchSelectedReferringHCI" class="flex-auto" filter :options="hciList" optionLabel="FacilityName" optionValue="HealthFacilityCodeShort" placeholder="Select Referring HCI" v-model="newUser.hciID" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="username" class="font-semibold w-6rem">Username</label>
                <InputText disabled id="username" v-model="newUser.username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="contactNo" class="font-semibold w-6rem">Contact Number</label>
                <InputText id="contactNo" v-model="newUser.contactno" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="email" class="font-semibold w-6rem">Email Address</label>
                <InputText id="email" v-model="newUser.email" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Submit" @click="handleCreateAccount"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="changeEmail" modal header="Change Email Address" :style="{ width: '40rem' }">
            <span class="p-text-secondary block mb-5">Please enter user's new email address. A verification mail will be sent to the new email address.</span>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="email" class="font-semibold w-6rem">Email Address</label>
                <InputText id="email" v-model="newEmail" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="changeEmail = false"></Button>
                <Button type="button" label="Submit" @click="handleUpdateEmail"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="changeNumber" modal header="Change Phone Number" :style="{ width: '40rem' }">
            <span class="p-text-secondary block mb-5">Please enter user's new phone number</span>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="number" class="font-semibold w-4rem">Phone Number</label>
                <InputText id="number" v-model="newNumber" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="changeEmail = false"></Button>
                <Button type="button" label="Submit" @click="handleUpdateNumber"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="editUser" modal :header="`Edit ${userToChangeEmail.FacilityName}`" :style="{ width: '40rem' }">
            <span class="p-text-secondary block text-center mt-3">Please select information you want to edit.</span>
            <h4 class="mb-5 text-center"></h4>
            <div class="align-items-center gap-3 mb-5">
                <Button class="block my-2 w-full p-4" label="Change Email" severity="primary" outlined @click="handleChangeEmail" />
                <Button class="block my-2 w-full p-4" label="Change Phone Number" severity="primary" outlined @click="handleChangNumber" />
            </div>
        </Dialog>

        <Dialog v-model:visible="saving" modal :header="savingHeader" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>{{ savingText }}</p>
            </div>
            <ProgressBar v-if="savingProgress" mode="indeterminate" style="height: 6px"></ProgressBar>
        </Dialog>

        <Dialog closable v-model:visible="deleteModal" modal header="Delete User" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to delete User?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleRemoveUser" type="button" label="Submit" severity="primary"></Button>
                <Button @click="cancelDefer" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>
    </div>
</template>
