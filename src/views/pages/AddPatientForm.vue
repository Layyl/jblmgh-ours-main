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
const fetching = ref(false);
const processingCount = ref();
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
const estimatedAge = ref();
const disclaimer = ref(0);
const saving = ref(false);
const validation = ref(false);
const success = ref(false);
const signoreCode = ref('');
const departmentList = ref([]);
const genderList = ref([
    { gender: 'Male', value: 1 },
    { gender: 'Female', value: 2 }
]);
const e = ref([...Array(4).keys()].map((n) => ({ no: `${n + 1}`, value: n + 1 })));
const v = ref([...Array(5).keys()].map((n) => ({ no: `${n + 1}`, value: n + 1 })));
const m = ref([...Array(6).keys()].map((n) => ({ no: `${n + 1}`, value: n + 1 })));
const painScale = ref([...Array(9).keys()].map((n) => ({ no: `${n + 1}`, value: n + 1 })));

const fetchPatientData = async () => {
    const response = await api.get(`/searchPatients?hospitalNo=${patientID.value}`, { headers: header });
    patientData.value = response.data.patients[0];
    patientData.value.gender = patientData.value.gender === 'M' ? 1 : 2;
    patientData.value.nationality = '1';
    const birthDate = new Date(patientData.value.BirthDate);
    const formattedBirthDate = `${(birthDate.getMonth() + 1).toString().padStart(2, '0')}/` + `${birthDate.getDate().toString().padStart(2, '0')}/` + `${birthDate.getFullYear()}`;
    patientData.value = { ...patientData.value, birthDate: formattedBirthDate };
};

const fetchDepartments = async () => {
    const response = await api.get(`/fetchServiceTypes`, { headers: header });
    departmentList.value = response.data;
    console.log(departmentList.value);
};

const fetchCivilStatus = async () => {
    const response = await api.get(`/fetchCivilStatus`, { headers: header });
    civilStatus.value = response.data;
};
const fetchProcessingCount = async () => {
    const response = await api.get(`/countProcessing`, { headers: header });
    processingCount.value = response.data;
    console.log(processingCount.value);
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

const calculateBirthdate = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    let birthYear = currentYear - estimatedAge.value;

    let calculatedBirthDate = new Date(birthYear, currentMonth, currentDay);

    if (currentDate < calculatedBirthDate) {
        birthYear -= 1;
        calculatedBirthDate = new Date(birthYear, currentMonth, currentDay);
        console.log(calculatedBirthDate);
    }
    console.log(calculatedBirthDate);
    patientData.value.birthDate = calculatedBirthDate;
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
    if (patientData.value.isSignore == 1) {
        calculateBirthdate();
    }
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }

    saving.value = true;
    await collateFileNames();
    const response = await api.post(`/createNewReferral`, patientData.value, { headers: header }).then(async (res) => {
        savedReferralID.value = res.data.referralID;
        await transferFiles();
        saving.value = false;
        success.value = true;
        setTimeout(() => {
            router.push('/ours/outboundPatients');
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
    fetching.value = true;
    await fetchProcessingCount();
    await fetchCivilStatus();
    await fetchNationality();
    await fetchDepartments();
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
    fetching.value = false;
});
</script>

<template>
    <Message :closable="false" severity="warn" v-if="patientData.receivingHospital == 271"
        >JBLMGH is currently processing <span class="font-bold"> {{ processingCount.processingCount }} patient/s. </span></Message
    >
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
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="refDoc">Receiving Hospital <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown
                            v-else
                            required
                            v-model="patientData.receivingHospital"
                            :disabled="hciID != '271'"
                            id="refHCI"
                            filter
                            :options="HCI"
                            optionLabel="FacilityName"
                            optionValue="HealthFacilityCodeShort"
                            placeholder="Select Referring HCI"
                        />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="refDoc">Referring Doctor <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required v-model="patientData.referringDoctor" id="refDoc" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="refCont">Referrer's Contact Number <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputMask v-else required v-model="patientData.referrerContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="reasons">Reason for Transfer <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required v-model="patientData.transferReason" :options="reasonForTransfer" optionLabel="Description" optionValue="id" placeholder="Select Reason For Transfer" />
                    </div>
                    <div class="field col-12 md:col-6" v-if="patientData.transferReason == 5">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="reasons">Other Reason for Transfer (Please Specify) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required v-model="patientData.otherTransferReason" id="refDoc" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else>Intended Department</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else v-model="patientData.receivingDepartment" :options="departmentList" optionLabel="Description" optionValue="ServiceTypeID" placeholder="Select Department" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Informant's Information</b>
                    </Divider>

                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="infName">Informant's Name</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" v-model="patientData.informantName" id="informantName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="infRel">Informant's Relationship to Patient</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" v-model="patientData.informantRelationship" id="infRel" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="infCont">Informant's Contact Number</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputMask v-else v-model="patientData.informantContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
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
                <div class="block mb-3">
                    <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                    <Checkbox v-else class="mr-2" :binary="true" trueValue="1" falseValue="0" v-model="patientData.isSignore" />
                    <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                    <label v-else for="isSignore">Is Signore / John Doe / Unknown?</label>
                </div>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="lastName">Last Name <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" :disabled="patientData.isSignore == 1" required v-model="patientData.lastName" id="lastName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="firstName" v-if="patientData.isSignore == 0 || !patientData.isSignore">First Name <span class="text-red-600">*</span></label>
                        <label for="firstName" v-else>First Name <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" :disabled="patientData.isSignore == 1" required v-model="patientData.firstName" id="firstName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="middleName">Middle Name <span v-if="patientData.isSignore == 0 || !patientData.isSignore" class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" :disabled="patientData.isSignore == 1" :required="patientData.isSignore == 0 || !patientData.isSignore" v-model="patientData.middleName" id="middleName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="suffix">Suffix</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" :disabled="patientData.isSignore == 1" v-model="patientData.suffix" id="suffix" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="gender">Gender <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required :options="genderList" v-model="patientData.gender" optionLabel="gender" optionValue="value" placeholder="Select Gender" />
                    </div>
                    <div class="field col-12 md:col-6" v-if="patientData.isSignore == 0 || !patientData.isSignore">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="patCont">Date of Birth <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Calendar v-else required :showIcon="true" v-model="patientData.birthDate"></Calendar>
                    </div>
                    <div class="field col-12 md:col-6" v-else>
                        <label for="patCont">Estimated Age <span class="text-red-600">*</span></label>
                        <InputNumber class="uppercase" required v-model="estimatedAge" id="firstName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="civilStat">Civil Status <span v-if="patientData.isSignore == 0 || !patientData.isSignore" class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else :required="patientData.isSignore == 0 || !patientData.isSignore" v-model="patientData.civilStatus" :options="civilStatus" optionLabel="Name" optionValue="CivilStatusID" placeholder="Select Civil Status" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else>Nationality <span class="text-red-600" v-if="patientData.isSignore == 0 || !patientData.isSignore">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else:required="patientData.isSignore == 0 || !patientData.isSignore" v-model="patientData.nationality" :options="nationality" optionLabel="Description" optionValue="ID" placeholder="Select Nationality" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Address</b>
                    </Divider>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="patCont">Patient's Contact No. <span class="text-red-600" v-if="patientData.isSignore == 0 || !patientData.isSignore">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputMask v-else:required="patientData.isSignore == 0 || !patientData.isSignore" v-model="patientData.patientContact" id="phone" mask="(999) 999-9999" placeholder="(999) 999-9999" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="street">Street</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" :required="patientData.isSignore == 0 || !patientData.isSignore" v-model="patientData.street" id="street" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="province">Province <span class="text-red-600" v-if="patientData.isSignore == 0 || !patientData.isSignore">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown
                            v-else
                            :required="patientData.isSignore == 0 || !patientData.isSignore"
                            v-model="patientData.provinceID"
                            :options="provinceList"
                            optionLabel="Description"
                            optionValue="ProvinceID"
                            @change="fetchMunicipality()"
                            placeholDer="Select Province"
                        />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="infName">City/Municipality <span class="text-red-600" v-if="patientData.isSignore == 0 || !patientData.isSignore">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown
                            v-else
                            :required="patientData.isSignore == 0 || !patientData.isSignore"
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
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="infName">Barangay <span class="text-red-600" v-if="patientData.isSignore == 0 || !patientData.isSignore">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required :disabled="!patientData.municipalityID" v-model="patientData.barangayID" :options="barangayList" optionLabel="Name" optionValue="Id" placeholder="Select Barangay" />
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
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="impression">Impression <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.impression" id="impression" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="complaints">Chief Complaints <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.chiefComplaint" id="complaints" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="presentation">Presentation/History <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.history" id="presentation" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="exams">Pertinent Examination Findings <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.examinationFindings" id="exams" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="labs">Pertinent Laboratories <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.laboratories" id="labs" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="imaging">Pertinent Imaging/Studies <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.imaging" id="imaging" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="interventions">Medical Interventions/Medicines Given <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.medicalInterventions" id="interventions" autoResize rows="3" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="course">Significant Course in the Ward/ER <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Textarea v-else required v-model="patientData.courseInTheWard" id="course" autoResize rows="3" cols="30" />
                    </div>
                    <div class="field col-12 md:col-12">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <FileUpload v-else ref="filenameRef" name="filenames[]" :showUploadButton="false" :showCancelButton="false" :multiple="true" accept="image/*" :maxFileSize="10000000">
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
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="Height">Height <span class="text-red-600">*</span></label>
                        <div class="flex flex-row">
                            <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                            <InputText v-else required @change="calculateBMI" v-model="heightFt" id="ft" type="text" placeholder="Feet" />
                            <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                            <InputText v-else required @change="calculateBMI" v-model="heightIn" id="in" type="text" placeholder="Inches" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="Weight">Weight(Kg) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputText v-else :useGrouping="false" required @change="calculateBMI" v-model="patientData.weight" id="Weight" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="BMI">Body Mass Index (BMI)</label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.bmi" readonly id="BMI" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="bp">Blood Pressure <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <div v-else class="flex flex-row">
                            <InputNumber :useGrouping="false" required v-model="patientData.systolic" id="ft" type="text" placeholder="Systolic" />
                            <InputNumber :useGrouping="false" required v-model="patientData.diastolic" id="ft" type="text" placeholder="Diastolic" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="o2">Oxygen Saturation <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.oxygenSaturation" id="o2" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="temp">Temperature(Celcius) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.temperature" id="temp" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="rr">Respiratory Rate (RR) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.respiratoryRate" id="rr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="cr">Cardiac Rate (CR) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.cardiacRate" id="cr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="pr">Pulse Rate (PR) <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.pulseRate" id="pr" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="pain">CBG<span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <InputNumber v-else :useGrouping="false" required v-model="patientData.cbg" id="pain" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <label v-else for="pain">Pain Scale<span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required v-model="patientData.painScale" :options="painScale" optionLabel="no" optionValue="value" placeholder="Select Pain Scale" />
                    </div>

                    <div class="col-12 md:col-6 xl:flex p-0">
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <div v-else class="field col-12 md:col-3">
                            <label for="gcs">Eyes <span class="text-red-600">*</span></label>
                            <Dropdown required v-model="patientData.e" @change="calculateGCS" :options="e" optionLabel="no" optionValue="value" placeholder="Select Eyes" />
                        </div>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <div v-else class="field col-12 md:col-3">
                            <label for="gcs">Verbal <span class="text-red-600">*</span></label>
                            <Dropdown required v-model="patientData.v" @change="calculateGCS" :options="v" optionLabel="no" optionValue="value" placeholder="Select Verbal" />
                        </div>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <div v-else class="field col-12 md:col-3">
                            <label for="gcs">Motor <span class="text-red-600">*</span></label>
                            <Dropdown required v-model="patientData.m" @change="calculateGCS" :options="m" optionLabel="no" optionValue="value" placeholder="Select Motor" />
                        </div>
                        <Skeleton v-if="fetching" width="100%" height="2rem" class="mb-2"></Skeleton>
                        <div v-else class="field col-12 md:col-3">
                            <label for="gcs">GCS <span class="text-red-600">*</span></label>
                            <InputText :useGrouping="false" placeholder="Total GCS" required v-model="patientData.gcs" readonly id="gcs" type="text" />
                        </div>
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

        <Dialog v-model:visible="saving" modal header="Saving...⏳" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Patient Data is currently being saved, please wait.</p>
            </div>
            <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
        </Dialog>
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
