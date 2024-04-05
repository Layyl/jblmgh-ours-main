<script setup>
import { onMounted, ref } from 'vue';
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
const disclaimer = ref(0);
const saving = ref(false);
const validation = ref(false);
const success = ref(false);
const genderList = ref([
    { gender: 'Male', value: 1 },
    { gender: 'Female', value: 2 }
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
    const response = await api.get(`/fetchPatientData?patID=${patientID.value}`, { headers: header });
    patientData.value = response.data[0];
    const birthDate = new Date(patientData.value.birthDate);
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
    console.log(patientData.value.bmi);
};

const calculateHeight = () => {
    heightFt.value = heightFt.value == '' ? 0 : heightFt.value;
    heightIn.value = heightIn.value == '' ? 0 : heightIn.value;

    heightCm.value = (parseFloat(heightFt.value) * 12 + parseFloat(heightIn.value)) * 2.54;
    patientData.value.height = heightCm.value;
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

const saveData = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    saving.value = true;
    await collateFileNames();
    const response = await api.post(`/createNewReferral`, patientData.value, { headers: header }).then(async (res) => {
        console.log(res.data);
        savedReferralID.value = res.data.referralID;
        console.log('savedReferralID', savedReferralID.value);
        await transferFiles();
        saving.value = false;
        success.value = true;
        setTimeout(() => {
            router.push('/ours/patientlist');
        }, 1000);
    });
};

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
                        <h3 class="block text-green-600 font-medium mb-4">Referral Information</h3>
                    </div>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="refDoc">Receiving Hospital <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.receivingHospital" :disabled="hciID !== '271'" id="refHCI" filter :options="HCI" optionLabel="FacilityName" optionValue="HealthFacilityCodeShort" placeholder="Select Referring HCI" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="refDoc">Referring Doctor <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required v-model="patientData.referringDoctor" id="refDoc" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="refCont">Referrer's Contact Number <span class="text-red-600">*</span></label>
                        <InputMask required v-model="patientData.referrerContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="reasons">Reason for Transfer <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.transferReason" :options="reasonForTransfer" optionLabel="Description" optionValue="id" placeholder="Select Reason For Transfer" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Informant's Information</b>
                    </Divider>

                    <div class="field col-12 md:col-6">
                        <label for="infName">Informant's Name</label>
                        <InputText class="uppercase" v-model="patientData.informantName" id="informantName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infRel">Informant's Relationship to Patient</label>
                        <InputText class="uppercase" v-model="patientData.informantRelationship" id="infRel" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infCont">Informant's Contact Number</label>
                        <InputMask v-model="patientData.informantContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <h3 class="block text-green-600 font-medium mb-4">Patient's Information</h3>
                    </div>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="lastName">Last Name <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required v-model="patientData.lastName" id="lastName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="firstName">First Name <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required v-model="patientData.firstName" id="firstName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="middleName">Middle Name <span class="text-red-600">*</span></label>
                        <InputText class="uppercase" required v-model="patientData.middleName" id="middleName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="suffix">Suffix</label>
                        <InputText class="uppercase" v-model="patientData.suffix" id="suffix" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="gender">Gender <span class="text-red-600">*</span></label>
                        <Dropdown required :options="genderList" v-model="patientData.gender" optionLabel="gender" optionValue="value" placeholder="Select Gender" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="patCont">Date of Birth <span class="text-red-600">*</span></label>
                        <Calendar required :showIcon="true" v-model="patientData.birthDate"></Calendar>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="civilStat">Civil Status <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.civilStatus" :options="civilStatus" optionLabel="Name" optionValue="CivilStatusID" placeholder="Select Civil Status" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label>Nationality <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.nationality" :options="nationality" optionLabel="Description" optionValue="ID" placeholder="Select Nationality" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Address</b>
                    </Divider>
                    <div class="field col-12 md:col-6">
                        <label for="patCont">Patient's Contact No.</label>
                        <InputMask required v-model="patientData.patientContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="street">Street</label>
                        <InputText class="uppercase" required v-model="patientData.street" id="street" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="province">Province <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.provinceID" :options="provinceList" optionLabel="Description" optionValue="ProvinceID" @change="fetchMunicipality()" placeholDer="Select Province" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infName">City/Municipality <span class="text-red-600">*</span></label>
                        <Dropdown
                            required
                            :disabled="!patientData.provinceID"
                            v-model="patientData.municipalityID"
                            :options="municipalityList"
                            optionLabel="Description"
                            optionValue="MunicipalityID"
                            @change="fetchBarangay"
                            placeholder="Select Municipality"
                        />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="infName">Barangay <span class="text-red-600">*</span></label>
                        <Dropdown required :disabled="!patientData.municipalityID" v-model="patientData.barangayID" :options="barangayList" optionLabel="Name" optionValue="Id" placeholder="Select Barangay" />
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
                        <label for="complaints">Chief Complaints <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.chiefComplaint" id="complaints" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="presentation">Presentation/History <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.history" id="presentation" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="exams">Pertinent Examination Findings <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.examinationFindings" id="exams" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="labs">Pertinent Laboratories <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.laboratories" id="labs" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="imaging">Pertinent Imaging/Studies <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.imaging" id="imaging" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="interventions">Medical Interventions/Medicines Given <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.medicalInterventions" id="interventions" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="course">Significant Course in the Ward/ER <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.courseInTheWard" id="course" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-12">
                        <label for="course">Diagnostics Done <span class="text-red-600">*</span></label>
                        <Textarea required v-model="patientData.diagnosticsDone" id="course" autoResize rows="3" cols="30" />
                    </div>
                    <div class="field col-12 md:col-12">
                        <FileUpload ref="filenameRef" name="filenames[]" :showUploadButton="false" :showCancelButton="false" :multiple="true" accept="image/*" :maxFileSize="10000000">
                            <template #empty>
                                <p>Please upload pertinent test results.</p>
                            </template>
                        </FileUpload>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <h3 class="block text-green-600 font-medium mb-4">Vital Signs</h3>
                    </div>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="Height">Height <span class="text-red-600">*</span></label>
                        <div class="flex flex-row">
                            <InputText required @change="calculateBMI" v-model="heightFt" id="ft" type="text" placeholder="Feet" />
                            <InputText required @change="calculateBMI" v-model="heightIn" id="in" type="text" placeholder="Inches" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="Weight">Weight(Kg) <span class="text-red-600">*</span></label>
                        <InputText :useGrouping="false" required @change="calculateBMI" v-model="patientData.weight" id="Weight" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="BMI">Body Mass Index (BMI)</label>
                        <InputNumber :useGrouping="false" required v-model="patientData.bmi" readonly id="BMI" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="bp">Blood Pressure <span class="text-red-600">*</span></label>
                        <div class="flex flex-row">
                            <InputNumber :useGrouping="false" required v-model="patientData.systolic" id="ft" type="text" placeholder="Systolic" />
                            <InputNumber :useGrouping="false" required v-model="patientData.diastolic" id="ft" type="text" placeholder="Diastolic" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="o2">Oxygen Saturation <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.oxygenSaturation" id="o2" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="temp">Temperature(Celcius) <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.temperature" id="temp" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="rr">Respiratory Rate (RR) <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.respiratoryRate" id="rr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="cr">Cardiac Rate (CR) <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.cardiacRate" id="cr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="pr">Pulse Rate (PR) <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.pulseRate" id="pr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="pain">CBG<span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.cbg" id="pain" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="pain">Pain Scale<span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.painScale" :options="painScale" optionLabel="no" optionValue="value" placeholder="Select Pain Scale" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="gcs">Eyes <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.e" @change="calculateGCS" :options="e" optionLabel="no" optionValue="value" placeholder="Select E" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="gcs">Verbal <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.v" @change="calculateGCS" :options="v" optionLabel="no" optionValue="value" placeholder="Select V" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="gcs">Motor <span class="text-red-600">*</span></label>
                        <Dropdown required v-model="patientData.m" @change="calculateGCS" :options="m" optionLabel="no" optionValue="value" placeholder="Select M" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label for="gcs">Glasgow Coma Scale <span class="text-red-600">*</span></label>
                        <InputNumber :useGrouping="false" required v-model="patientData.gcs" readonly id="gcs" type="text" />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 flex flex-row gap-2 align-content-center justify-content-center">
            <Checkbox v-model="disclaimer" inputId="disclaimer" name="disclaimer" value="1" />
            <label for="disclaimer" class="ml-2"> I allow JBLMGH to process the patient's medical and personal information in accordance with R.A. 10173. </label>
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
