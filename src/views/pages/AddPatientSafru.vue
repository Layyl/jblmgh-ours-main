<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '../../api';
const route = useRoute();
const router = useRouter();
const savedReferralID = ref();
const toast = useToast();
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const hciID = ref('');
const newReferral = ref(false);
const patientID = ref('');
const patientData = ref({});
const loading = ref(false);
const HCI = ref([]);
const civilStatus = ref([]);
const nationality = ref([]);
const provinceList = ref([]);
const municipalityList = ref([]);
const barangayList = ref([]);
const reasonForTransfer = ref([]);
const filenameRef = ref(null);
const heightFt = ref(0);
const heightIn = ref(0);
const heightCm = ref(0);
const signoreCode = ref('');
const disclaimer = ref(0);
const saving = ref(false);
const validation = ref(false);
const success = ref(false);
const genderList = ref([
    { gender: 'Male', value: 1 },
    { gender: 'Female', value: 2 }
]);
const injuryList = ref([
    { injury: 'Medical', value: 1 },
    { injury: 'Surgical', value: 2 }
]);
const critical = ref([
    { injury: 'Critical', value: 1 },
    { injury: 'Non-Critical', value: 2 }
]);
const e = ref([
    { no: '1', value: 1 },
    { no: '2', value: 2 },
    { no: '3', value: 3 },
    { no: '4', value: 4 }
]);
const v = ref([
    { no: '1', value: 1 },
    { no: '2', value: 2 },
    { no: '3', value: 3 },
    { no: '4', value: 4 },
    { no: '5', value: 5 }
]);
const m = ref([
    { no: '1', value: 1 },
    { no: '2', value: 2 },
    { no: '3', value: 3 },
    { no: '4', value: 4 },
    { no: '5', value: 5 },
    { no: '6', value: 6 }
]);
const painScale = ref([
    { no: '1', value: 1 },
    { no: '2', value: 2 },
    { no: '3', value: 3 },
    { no: '4', value: 4 },
    { no: '5', value: 5 },
    { no: '6', value: 6 },
    { no: '7', value: 7 },
    { no: '8', value: 8 },
    { no: '9', value: 9 }
]);

const fetchPatientData = async () => {
    const response = await api.get(`/searchPatients?hospitalNo=${patientID.value}`, { headers: header });
    patientData.value = response.data.patients[0];
    patientData.value.gender = patientData.value.gender === 'M' ? 1 : 2;
    patientData.value.nationality = '1';
    const birthDate = new Date(patientData.value.BirthDate);
    const formattedBirthDate = `${(birthDate.getMonth() + 1).toString().padStart(2, '0')}/` + `${birthDate.getDate().toString().padStart(2, '0')}/` + `${birthDate.getFullYear()}`;
    patientData.value = { ...patientData.value, birthDate: formattedBirthDate };
};

const fetchCivilStatus = async () => {
    const response = await api.get(`/fetchCivilStatus`, { headers: header });
    civilStatus.value = response.data;
};

const fetchNationality = async () => {
    const response = await api.get(`/fetchNationality`, { headers: header });
    nationality.value = response.data;
};

const fetchProvince = async () => {
    const response = await api.get(`/fetchProvince`, { headers: header });
    provinceList.value = response.data;
};

const fetchMunicipality = async () => {
    const response = await api.get(`/fetchMunicipality?ProvinceID=${patientData.value.provinceID}`, { headers: header });
    municipalityList.value = response.data;
};

const fetchBarangay = async () => {
    const response = await api.get(`/fetchBarangay?MunicipalityID=${patientData.value.municipalityID}`, { headers: header });
    barangayList.value = response.data;
};

const fetchReferringHCIs = async () => {
    const response = await api.get(`/fetchHealthCareInstitution?hciID=${hciID.value}`, { headers: header });
    HCI.value = response.data;
};

const fetchReferralReasons = async () => {
    const response = await api.get(`/fetchReferralReasons`, { headers: header });
    reasonForTransfer.value = response.data;
};

const collateFileNames = () => {
    patientData.value.patientFiles = '';
    filenameRef.value.files.forEach((file, index) => {
        if (file.name !== undefined) {
            patientData.value.patientFiles += file.name;
            if (index < filenameRef.value.files.length - 1) {
                patientData.value.patientFiles += ', ';
            }
        }
    });
};

const transferFiles = async () => {
    const files = filenameRef.value.files;
    const formData = new FormData();

    for (const file of files) {
        formData.append('files[]', file);
    }
    formData.append('patientID', savedReferralID.value);
    const response = await api.post(`/upload`, formData, { headers: header });
    if (response.ok) {
    } else {
        if (response.status === 413) {
            Swal.fire({
                icon: 'error',
                title: 'File Size Exceeded',
                text: 'Cannot save data, Maximum upload size exceeded.'
            });
        }
    }
};

const calculateGCS = () => {
    patientData.value.gcs = parseInt(patientData.value.e) + parseInt(patientData.value.v) + parseInt(patientData.value.m);
};

const calculateBMI = () => {
    calculateHeight();
    var heightInMeters = parseInt(patientData.value.height) / 100;
    var weight = parseInt(patientData.value.weight);

    if (!isNaN(weight) && !isNaN(heightInMeters) && heightInMeters !== 0) {
        var bmi = weight / (heightInMeters * heightInMeters);
        patientData.value.bmi = bmi.toFixed(2);
    } else {
        patientData.value.bmi = '';
    }
};

const calculateHeight = () => {
    heightFt.value = heightFt.value == '' ? 0 : heightFt.value;
    heightIn.value = heightIn.value == '' ? 0 : heightIn.value;

    heightCm.value = (parseFloat(heightFt.value) * 12 + parseFloat(heightIn.value)) * 2.54;
    patientData.value.height = heightCm.value;
};

const generateDailySeed = () => {
    const date = new Date();
    return date.getMonth().toString() + date.getDate().toString() + date.getYear().toString().slice(-2);
};

const generateSigCode = () => {
    const dailySeed = generateDailySeed();
    const currentTime = new Date().getTime().toString();
    const slicedTime = currentTime.slice(-4);
    const uniqueSeed = dailySeed + currentTime;

    const hash = Array.from(uniqueSeed).reduce((hash, char) => {
        return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter1 = letters[Math.abs(hash) % 26];
    const letter2 = letters[Math.abs(hash >> 5) % 26];

    signoreCode.value = 'SIG-' + dailySeed + '-' + slicedTime + letter1 + letter2;
    console.log(signoreCode.value);
};
const validateRequiredFields = () => {
    let error = false;
    let firstErrorField = null;
    const fields = document.querySelectorAll('.p-inputtext[required], .p-textarea[required], .p-dropdown[required], .p-radiobutton[required]');

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

const saveData = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    saving.value = true;
    const response = await api.post(`/createReferralSafru`, patientData.value, { headers: header }).then(async (res) => {
        saving.value = false;
        success.value = true;
        setTimeout(() => {
            router.push('/ours/patientlist');
        }, 1000);
    });
};
watch(
    () => patientData.value.isSignore,
    (newValue) => {
        if (newValue) {
            console.log(newValue);
            if (newValue == 1) {
                generateSigCode();
                patientData.value.firstName = signoreCode.value;
                patientData.value.lastName = 'SIGNORE';
                patientData.value.middleName = 'SIGNORE';
            } else {
                patientData.value.firstName = '';
                patientData.value.lastName = '';
                patientData.value.middleName = '';
            }
        }
    }
);
onMounted(async () => {
    patientID.value = route.query.id;
    hciID.value = Cookies.get('hciID');

    await fetchCivilStatus();
    await fetchNationality();
    await fetchProvince();
    await fetchReferringHCIs();
    await fetchReferralReasons();
    if (patientID.value === 'new') {
        patientData.value.referringHospital = parseInt(hciID.value);
        patientData.value.newReferral = 1;
    } else {
        newReferral.value = false;
        await fetchPatientData();
        await fetchMunicipality();
        await fetchBarangay();
        patientData.value.referringHospital = parseInt(hciID.value);
    }
    if (hciID.value != 271) {
        patientData.value.receivingHospital = 271;
    }
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <h3 class="block text-green-600 font-medium mb-4">Patient's Information</h3>
                    </div>
                </div>
                <div class="block mb-3">
                    <Checkbox class="mr-2" :binary="true" trueValue="1" falseValue="0" v-model="patientData.isSignore" />
                    <label for="isSignore">Is Signore/Unknown/John Doe?</label>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <label for="lastName">Last Name <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required v-model="patientData.lastName" id="lastName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label v-if="patientData.isSignore == 0 || !patientData.isSignore" for="firstName">First Name <span class="text-red-600">*</span></label>
                        <label v-else for="firstName">Patient Code <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required :disabled="patientData.isSignore == 1" v-model="patientData.firstName" id="firstName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <label for="middleName">Middle Name</label>
                        <InputText class="uppercase" v-model="patientData.middleName" id="middleName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <label for="suffix">Suffix</label>
                        <InputText class="uppercase" v-model="patientData.suffix" id="suffix" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="gender">Gender <span class="text-red-600">*</span></label>
                        <Dropdown required :options="genderList" v-model="patientData.gender" optionLabel="gender" optionValue="value" placeholder="Select Gender" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Address</b>
                    </Divider>
                    <div class="field col-12 md:col-6">
                        <label for="street">Street</label>
                        <InputText class="uppercase" v-model="patientData.street" id="street" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="province">Province</label>
                        <Dropdown v-model="patientData.provinceID" :options="provinceList" optionLabel="Description" optionValue="ProvinceID" @change="fetchMunicipality()" placeholDer="Select Province" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infName">City/Municipality</label>
                        <Dropdown :disabled="!patientData.provinceID" v-model="patientData.municipalityID" :options="municipalityList" optionLabel="Description" optionValue="MunicipalityID" @change="fetchBarangay" placeholder="Select Municipality" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infName">Barangay</label>
                        <Dropdown :disabled="!patientData.municipalityID" v-model="patientData.barangayID" :options="barangayList" optionLabel="Name" optionValue="Id" placeholder="Select Barangay" />
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <h3 class="block text-green-600 font-medium mb-4">Medical Information</h3>
                    </div>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="impression">Impression <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.impression" id="impression" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="location">Location of Incident (Pick-up Location) <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.locationOfAccident" id="location" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="gender">Type of Injury <span class="text-red-600">*</span></label>
                        <Dropdown required :options="injuryList" v-model="patientData.typeOfInjury" optionLabel="injury" optionValue="value" placeholder="Select Type of Injury" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="gender">Patient Critical? <span class="text-red-600">*</span></label>
                        <Dropdown required :options="critical" v-model="patientData.isCritical" optionLabel="injury" optionValue="value" placeholder="Is the Patient in Critical Condition?" />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 flex flex-row gap-2 align-content-center justify-content-center text-center">
            <Checkbox v-model="disclaimer" inputId="disclaimer" name="disclaimer" value="1" />
            <label for="disclaimer" class="ml-2">
                I allow JBLMGH to process the patient's medical and personal information in accordance with
                <a class="text-blue-500 text-underline" href="https://privacy.gov.ph/data-privacy-act/" target="_blank">R.A. 10173 (Data Privacy Act of 2012).</a> <br />
                <span class="font-bold font-italic text-primary text-lg">I understand that this referral is only valid for 24 hours. Re-registration is required if referral expires. </span>
            </label>
        </div>
        <div class="col-12 flex flex-row gap-2 align-content-center justify-content-end">
            <Button :disabled="disclaimer != 1" type="button" label="Save" @click="saveData" icon="pi pi-save" :loading="loading" />
            <Button severity="danger" type="button" label="Cancel" icon="pi pi-times" />
        </div>
        <Dialog v-model:visible="success" modal header="Success!✅" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Patient data is successfully saved.</p>
            </div>
        </Dialog>
        <Dialog v-model:visible="validation" modal header="Uh-oh! 😟" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Please fill-out all required fields.</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Okay" severity="primary" @click="validation = false"></Button>
            </div>
        </Dialog>
    </div>
    <ScrollTop />
</template>
