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
const hciSearch = ref([]);
const hciList = ref([]);
const selectedHCI = ref([]);
const addNew = ref(false);
const saving = ref(false);
const deleteModal = ref(false);
const idToDelete = ref('');
const savingHeader = ref('');
const savingText = ref('');
const savingProgress = ref(true);
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const barangayList = ref([]);
const municipalityList = ref([]);
const provinceList = ref([]);
const regionList = ref([]);
const hciTypeList = ref([
    { type: 'RHU', value: 1 },
    { type: 'District Hospital', value: 2 },
    { type: 'Private Hospital', value: 3 },
    { type: 'Private Physician', value: 4 },
    { type: 'Emergency Responders/Rescue Unit', value: 5 }
]);

const newHCI = ref({
    hciName: '',
    hciDOHCode: '',
    hciDOHCodeShort: '',
    hciStreet: '',
    hciProvince: '',
    hciBarangay: '',
    hciMunicipality: '',
    hciRegion: '',
    hciType: ''
});

const redirectToAddPatient = (patientId) => {
    const route = patientId ? `/ours/addPatientForm?id=${patientId}` : `/ours/addPatientForm?id=new`;
    router.push(route);
};

const fetchReferringHCIs = async () => {
    const response = await api.get(`/fetchHealthCareInstitution`, { headers: header });
    hciList.value = response.data;
    hciSearch.value = response.data;
};

const searchReferringHCI = async () => {
    const response = await api.get(`/fetchHealthCareInstitution?HealthFacilityCodeShort=${hciID.value}`, { headers: header });
    hciList.value = response.data;
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

const AddHCI = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/createHCI`, newHCI.value, { headers: header });
    fetchReferringHCIs();
};

const handleDeleteClick = async (ID) => {
    idToDelete.value = ID;
    deleteModal.value = true;
};

const removeHCI = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/removeHCI`, { ID: idToDelete.value }, { headers: header });
    fetchReferringHCIs();
};

const handleRemoveHCI = async () => {
    await setLoadingState('Updating HCI List', 'Removing HCI. Please Wait.');
    await removeHCI();
    await hideLoadingModal('HCI List Updated!🥳', 'You have successfully removed HCI. ');
    await closeModal();
};

const closeModal = async () => {
    addNew.value = false;
    deleteModal.value = false;
    newHCI.value.username = '';
    newHCI.value.hciID = '';
    newHCI.value.lastName = '';
    newHCI.value.firstName = '';
    newHCI.value.middleName = '';
    newHCI.value.suffix = '';
    newHCI.value.contactNo = '';
    newHCI.value.emailAddress = '';
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

const handleAddHCI = async () => {
    await setLoadingState('Updating HCI List', 'Adding new HCI. Please Wait.');
    await AddHCI();
    await hideLoadingModal('HCI List Updated!🥳', 'You have successfully added a new HCI. ');
    await closeModal();
};

const fetchRegion = async () => {
    const response = await axios.get(`https://psgc.gitlab.io/api/regions/`);
    regionList.value = response.data;
};

const fetchProvince = async () => {
    console.log(newHCI.value.hciRegion.code);
    const response = await axios.get(`https://psgc.gitlab.io/api/regions/${newHCI.value.hciRegion.code}/provinces/`);
    provinceList.value = response.data;
};

const fetchMunicipality = async () => {
    const response = await axios.get(`https://psgc.gitlab.io/api/provinces/${newHCI.value.hciProvince.code}/cities-municipalities/`);
    municipalityList.value = response.data;
};

const fetchBarangay = async () => {
    const response = await axios.get(`https://psgc.gitlab.io/api/municipalities/${newHCI.value.hciMunicipality.code}/barangays/`);
    barangayList.value = response.data;
};

onMounted(async () => {
    await fetchRegion();
    await fetchReferringHCIs();
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card">
                <h3 class="block text-500 font-">Manage HCIs</h3>
                <div class="flex flex-column sm:flex-row gap-2 align-items-center">
                    <Dropdown class="mt-1 mx-1 w-full" filter :options="hciSearch" optionLabel="FacilityName" optionValue="HealthFacilityCodeShort" placeholder="Select Referring HCI" v-model="hciID" />
                    <div class="flex flex-row gap-2 align-items-center justify-content-center m-3">
                        <Button @click="searchReferringHCI" class="mx-1" type="button" icon="pi pi-search" label="Search" :loading="loading" />
                        <Button @click="addNew = true" class="mx-1" severity="info" type="button" icon="pi pi-plus" label="Add" :loading="loading" />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <DataTable :value="hciList" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" :scrollable="true" scrollHeight="400px" :loading="loading" scrollDirection="both" class="mt-3">
                    <Column field="ID" header="ID"></Column>
                    <Column field="FacilityName" header="HCI Name"></Column>
                    <Column field="HealthFacilityCodeShort" header="HCI Code"></Column>
                    <Column field="barangay" header="Barangay"></Column>
                    <Column field="municipality" header="Municipality"></Column>
                    <Column field="province" header="Province"></Column>
                    <Column field="region" header="Region"></Column>
                    <Column field="healthFacilityType" header="Healthcare Facility Type">
                        <template #body="slotProps">
                            {{
                                slotProps.data.healthFacilityType === 1
                                    ? 'RHU'
                                    : slotProps.data.healthFacilityType === 2
                                    ? 'District Hospital'
                                    : slotProps.data.healthFacilityType === 3
                                    ? 'Private Hospital'
                                    : slotProps.data.healthFacilityType === 4
                                    ? 'Private Physician'
                                    : slotProps.data.healthFacilityType === 5
                                    ? 'Rescue Unit'
                                    : 'Undefined'
                            }}
                        </template>
                    </Column>
                    <Column header="Action" :style="{ width: '200px' }">
                        <template #body="slotProps">
                            <div>
                                <Button @click="handleDeleteClick(slotProps.data.ID)" icon="pi pi-trash" severity="danger" size="small" class="mx-1"></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="addNew" modal header="Add Healthcare Institution" :style="{ width: '50rem' }">
            <span class="p-text-secondary block mb-5">Please enter new HCI's information.</span>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="name" class="font-semibold w-6rem">HCI Name</label>
                <InputText required id="username" v-model="newHCI.hciName" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="code" class="font-semibold w-6rem">HCI DOH Code</label>
                <InputText required id="contactNo" v-model="newHCI.hciDOHCode" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="shortcode" class="font-semibold w-6rem">HCI DOH Short Code</label>
                <InputText required id="email" v-model="newHCI.hciDOHCodeShort" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="street" class="font-semibold w-6rem">Street</label>
                <InputText required id="street" v-model="newHCI.hciStreet" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="region" class="font-semibold w-6rem">Region</label>
                <Dropdown v-model="newHCI.hciRegion" class="flex-auto" required :options="regionList" optionLabel="regionName" :optionValue="(val) => val" @change="fetchProvince()" placeholder="Select Region" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="shortcode" class="font-semibold w-6rem">Province</label>
                <Dropdown v-model="newHCI.hciProvince" :disabled="!newHCI.hciRegion" class="flex-auto" required :options="provinceList" optionLabel="name" :optionValue="(val) => val" @change="fetchMunicipality()" placeholder="Select Province" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="shortcode" class="font-semibold w-6rem">Municipality</label>
                <Dropdown
                    v-model="newHCI.hciMunicipality"
                    :disabled="!newHCI.hciProvince"
                    class="flex-auto"
                    required
                    :options="municipalityList"
                    optionLabel="name"
                    :optionValue="(val) => val"
                    @change="fetchBarangay()"
                    placeholder="Select Province"
                />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="shortcode" class="font-semibold w-6rem">Barangay</label>
                <Dropdown v-model="newHCI.hciBarangay" :disabled="!newHCI.hciMunicipality" class="flex-auto" required :options="barangayList" optionLabel="name" :optionValue="(val) => val" placeholder="Select Barangay" />
            </div>
            <div class="flex align-items-center gap-3 mb-5">
                <label for="shortcode" class="font-semibold w-6rem">Health Facility Type</label>
                <Dropdown v-model="newHCI.hciType" class="flex-auto" required :options="hciTypeList" optionLabel="type" optionValue="value" placeholder="Select Health Facility Type" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Submit" @click="handleAddHCI"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="saving" modal :header="savingHeader" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>{{ savingText }}</p>
            </div>
            <ProgressBar v-if="savingProgress" mode="indeterminate" style="height: 6px"></ProgressBar>
        </Dialog>

        <Dialog closable v-model:visible="deleteModal" modal header="Delete HCI" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to delete HCI?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleRemoveHCI" type="button" label="Submit" severity="primary"></Button>
                <Button @click="cancelDefer" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>
    </div>
</template>
