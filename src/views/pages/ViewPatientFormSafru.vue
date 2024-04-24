<script setup>
import { onMounted, ref } from 'vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Swal from 'sweetalert2';
import api from '../../api';

const route = useRoute();
const router = useRouter();
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const hciID = ref('');
const referralHistoryID = ref('');
const referralID = ref('');
const referralData = ref({});
const patientFiles = ref([]);
const HCI = ref([]);
const civilStatus = ref([]);
const nationality = ref([]);
const provinceList = ref([]);
const municipalityList = ref([]);
const barangayList = ref([]);
const departmentList = ref([]);
const doctorsList = ref([]);
const reasonForTransfer = ref([]);
const filenameRef = ref(null);
const heightFt = ref(0);
const heightIn = ref(0);
const heightCm = ref(0);
const newMessageAlert = ref(false);
const fetching = ref(false);
const loading = ref(false);
const loadingHeader = ref('');
const loadingText = ref('');
const loadingProgress = ref(true);
const validation = ref(false);
const accept = ref(false);
const defer = ref(false);
const returnOPCEN = ref(false);
const opcen = ref(false);
const returnJBL = ref(false);
const reopenModal = ref(false);
const refer = ref(false);
const referOPCEN = ref(false);
const chatBox = ref(false);
const editVitals = ref(false);
const editVitalsModal = ref(false);
const refHisID = ref('');
const userId = ref('');
const messages = ref([]);
const newMessage = ref('');
const genderList = ref([
    { gender: 'Male', value: 1 },
    { gender: 'Female', value: 2 }
]);
const injuryList = ref([
    { injury: 'Medical', value: 1 },
    { injury: 'Surgical', value: 2 }
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
const jbl = ref([
    {
        label: 'Accept Patient',
        icon: 'pi pi-check',
        command: () => {
            accept.value = true;
        }
    },
    {
        label: 'Defer Patient',
        icon: 'pi pi-times',
        items: [
            {
                label: 'Referring HCI Given Management',
                command: () => {
                    referralData.value.deferReason = 4;
                    defer.value = true;
                }
            },
            {
                label: 'Patient Refused Transfer',
                command: () => {
                    referralData.value.deferReason = 5;
                    defer.value = true;
                }
            },
            {
                label: 'Refer to Other HCI',
                command: () => {
                    refer.value = true;
                }
            },
            {
                label: 'Refer to OPCEN',
                command: () => {
                    opcen.value = true;
                }
            }
        ]
    },
    {
        label: 'Print Referral Form',
        icon: 'pi pi-print',
        command: () => {
            printReferralForm();
        }
    }
]);
const opcenMenu = ref([
    {
        label: 'Actions',
        icon: 'pi pi-cog',
        items: [
            {
                label: 'Refer to Other HCI',
                command: () => {
                    referOPCEN.value = true;
                }
            },
            {
                label: 'Return to JBLMGH',
                command: () => {
                    returnJBL.value = true;
                }
            }
        ]
    },
    {
        label: 'Print Referral Form',
        icon: 'pi pi-print',
        command: () => {
            printReferralForm();
        }
    }
]);
const other = ref([
    {
        label: 'Accept Patient',
        icon: 'pi pi-check',
        command: () => {
            accept.value = true;
        }
    },
    {
        label: 'Defer Patient',
        icon: 'pi pi-times',
        command: () => {
            returnOPCEN.value = true;
        }
    },
    {
        label: 'Print Referral Form',
        icon: 'pi pi-print',

        command: () => {
            printReferralForm();
        }
    }
]);
const reopen = ref([
    {
        label: 'Reopen Referral',
        icon: 'pi pi-refresh',
        command: () => {
            reopenModal.value = true;
        }
    },
    {
        label: 'Print Referral Form',
        icon: 'pi pi-print',
        command: () => {
            printReferralForm();
        }
    }
]);
const printOnly = ref([
    {
        label: 'Print Referral Form',
        icon: 'pi pi-print',
        command: () => {
            printReferralForm();
        }
    }
]);
const fetchReferralData = async () => {
    const response = await api.get(`/fetchReferralData?referralHistoryID=${referralHistoryID.value}&hciID=${hciID.value}`, { headers: header });
    const referral = response.data.referrals[0];

    const birthDate = new Date(referral.birthDate);
    const formattedBirthDate = `${(birthDate.getMonth() + 1).toString().padStart(2, '0')}/` + `${birthDate.getDate().toString().padStart(2, '0')}/` + `${birthDate.getFullYear()}`;

    referralData.value = {
        ...referral,
        birthDate: formattedBirthDate
    };
    if (referral.patientFiles && referral.patientFiles !== '') {
        const patientFilesArray = referral.patientFiles.split(',').map((file) => `../uploads/${referral.referralID}/${file.trim()}`);

        patientFiles.value = patientFilesArray;
    }
    convertCmToFeetAndInches(referral.height);
};
const fetchMessages = async () => {
    const response = await api.get(`/fetchReferralMessages?referralID=${referralID.value}`, { headers: header });
    messages.value = response.data;
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
    const response = await api.get(`/fetchMunicipality?ProvinceID=${referralData.value.provinceID}`, { headers: header });
    municipalityList.value = response.data;
};
const fetchBarangay = async () => {
    const response = await api.get(`/fetchBarangay?MunicipalityID=${referralData.value.municipalityID}`, { headers: header });
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
const fetchDepartments = async () => {
    const response = await api.get(`/fetchServiceTypes`, { headers: header });
    departmentList.value = response.data;
};
const fetchDoctors = async () => {
    const response = await api.get(`/fetchDoctors`, { headers: header });
    doctorsList.value = response.data;
};
const collateFileNames = () => {
    referralData.value.patientFiles = '';
    filenameRef.value.files.forEach((file, index) => {
        if (file.name !== undefined) {
            referralData.value.patientFiles += file.name;
            if (index < filenameRef.value.files.length - 1) {
                referralData.value.patientFiles += ', ';
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
    formData.append('patientID', patientID.value);
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
    referralData.value.gcs = parseInt(referralData.value.e) + parseInt(referralData.value.v) + parseInt(referralData.value.m);
};
const calculateBMI = () => {
    calculateHeight();
    var heightInMeters = parseInt(referralData.value.height) / 100;
    var weight = parseInt(referralData.value.weight);

    if (!isNaN(weight) && !isNaN(heightInMeters) && heightInMeters !== 0) {
        var bmi = weight / (heightInMeters * heightInMeters);
        referralData.value.bmi = bmi.toFixed(2);
    } else {
        referralData.value.bmi = '';
    }
};
const convertCmToFeetAndInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    heightFt.value = feet;
    heightIn.value = parseInt(inches);
};
const calculateHeight = () => {
    heightFt.value = heightFt.value == '' ? 0 : heightFt.value;
    heightIn.value = heightIn.value == '' ? 0 : heightIn.value;

    heightCm.value = (parseFloat(heightFt.value) * 12 + parseFloat(heightIn.value)) * 2.54;
    referralData.value.height = heightCm.value;
};
const viewImage = (url) => {
    Swal.fire({
        width: '100%',
        imageUrl: url,
        imageAlt: 'Image',
        showCloseButton: true,
        imageHeight: 'auto'
    });
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
const postAccept = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/acceptPatient`, referralData.value, { headers: header });
};
const handleAccept = async () => {
    await setLoadingState('Accepting Patient.', 'Accepting patient. Please wait');
    await postAccept();
    hideLoadingModal('Patient Accepted!🎉', 'Patient has been successfully accepted.');
};
const postEditVitals = async () => {
    const validationSuccess = await validateRequiredFields();
    if (!validationSuccess) {
        return;
    }
    const response = await api.post(`/updateVitalSigns`, referralData.value, { headers: header });
};
const handleEditVitals = async () => {
    await setLoadingState('Editing Vitals.', 'Updating vital signs. Please wait');
    await postEditVitals();
    hideLoadingModal('Vital signs updated!🎉', 'Vital signs of patient has been successfully updated.');
};
const postSetToOngoing = async () => {
    const response = await api.post(`/setToOngoing`, referralData.value, { headers: header });
};
const postDefer = async () => {
    const response = await api.post(`/deferPatient`, referralData.value, { headers: header });
};
const returnToOPCEN = async () => {
    const response = await api.post(`/transferToOPCEN`, referralData.value, { headers: header });
};
const handleReturnOPCENClick = async () => {
    await setLoadingState('Return to OPCEN.', 'Referring patient back to OPCEN. Please wait');
    await returnToOPCEN();
    hideLoadingModal('Successfully Returned to OPCEN!🎉', 'Referral returned to OPCEN successfully.');
};
const returnToJBL = async () => {
    const response = await api.post(`/returnToJBLMGH`, referralData.value, { headers: header });
};
const handleReturnClick = async () => {
    await setLoadingState('Return to JBLMGH.', 'Referring patient back to JBLMGH. Please wait');
    await returnToJBL();
    hideLoadingModal('Successfully Returned to OPCEN!🎉', 'Referral returned to JBLMGH successfully.');
};
const handleDeferClick = async () => {
    await setLoadingState('Deferring Patient.', 'Deferring patient. Please wait');
    await postDefer();
    hideLoadingModal('Successfully Deferred!🎉', 'Referral is successfully deferred.');
};
const cancelEditVitalsModal = () => {
    editVitalsModal.value = false;
};
const cancelDefer = () => {
    referralData.value.deferRemarks = '';
    defer.value = false;
};
const cancelOPCEN = () => {
    opcen.value = false;
};
const handleOPCENClick = async () => {
    await setLoadingState('Transferring Patient...', 'Referral to OPCEN being created. Please wait');
    await transferToOPCEN();
    hideLoadingModal('Success!🎉', 'Referral to OPCEN is successfully created.');
};
const postReopen = async () => {
    const response = await api.post(`/reopenReferral`, referralData.value, { headers: header });
};
const handleReopenClick = async () => {
    await setLoadingState('Reopening Referral.', 'Setting new referral status. Please wait');
    await postReopen();
    hideLoadingModal('Successfully Reopened!🎉', 'Referral is successfully reopened and may now be accepted.');
};
const transferReferral = async () => {
    const response = await api.post(`/transferToOtherHCI`, referralData.value, { headers: header });
};
const OPCENToOtherHCI = async () => {
    const response = await api.post(`/OPCENToOtherHCI`, referralData.value, { headers: header });
};
const handleOPCENToOtherHCI = async () => {
    await setLoadingState('Referring Patient.', 'Referring patient to selected HCI. Please wait');
    await OPCENToOtherHCI();
    hideLoadingModal('Successfully Referred!🎉', 'Referral to other HCI successfully created.');
};
const transferToOPCEN = async () => {
    const response = await api.post(`/transferToOPCEN`, referralData.value, { headers: header });
};
const handleTransferClick = async () => {
    await setLoadingState('Referring Patient.', 'Referring patient to selected HCI. Please wait');
    await transferReferral();
    hideLoadingModal('Successfully Referred!🎉', 'Referral to other HCI successfully created.');
};
const handleChatboxClick = async () => {
    chatBox.value = true;
    newMessageAlert.value = false;
    setTimeout(() => {
        scrollToBottom();
    }, 100);
};
const printReferralForm = async () => {
    window.open(`http://192.163.8.195:90/api/getReferralForm?referralHistoryID=${referralHistoryID.value}`);
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
const getStatus = (referralStatus, arrived) => {
    if (arrived == 1) {
        return 'Arrived';
    }
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
const handleNewChatMessage = (e) => {
    if (e.referralID == refHisID.value) {
        messages.value.push({
            message: e.message,
            user_id: e.user_id,
            username: e.username,
            sent_date: e.sent_date,
            sent_time: e.sent_time
        });
        setTimeout(() => {
            if (chatBox.value == true) {
                scrollToBottom();
            }
        }, 50);
    }
};
const scrollToBottom = () => {
    const div = document.getElementById('messages-container');
    div.scrollTo({
        top: div.scrollHeight,
        behavior: 'smooth'
    });
};
const reload = async (e) => {
    if (e.ri == referralData.value.referralID) {
        await fetchReferralData();
    }

    if (e.notificationType == 7) {
        if (chatBox.value == false) {
            newMessageAlert.value = true;
        }
    }
};
const sendMessage = async () => {
    const response = await api
        .post(
            '/sendChat',
            {
                message: newMessage.value,
                referralID: referralData.value.referralID,
                referralHistoryID: referralData.value.referralHistoryID,
                referringHospital: referralData.value.referringHospital,
                receivingHospital: referralData.value.receivingHospital,
                fullName: referralData.value.lastName + ', ' + referralData.value.firstName + ' ' + referralData.value.middleName,
                sendingUser: hciID.value
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('token')}`
                }
            }
        )
        .then((response) => {
            newMessage.value = '';
        });
};
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: 6001,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    disableStats: true,
    forceTLS: false
});
onMounted(async () => {
    // Subscribe to 'chat' channel
    window.Echo.channel('chat').listen('NewChatMessage', handleNewChatMessage);

    // Subscribe to 'notification' channel
    window.Echo.channel('notification').listen('NewNotification', reload);

    window.Echo.connector.pusher.connection.bind('connected', function () {});

    fetching.value = true;
    referralID.value = route.query.rid;
    referralHistoryID.value = route.query.rhid;
    hciID.value = Cookies.get('hciID');

    await fetchCivilStatus();
    await fetchReferringHCIs();
    await fetchReferralReasons();
    await fetchDepartments();
    await fetchDoctors();
    await fetchReferralData();
    await fetchNationality();
    await fetchProvince();
    if (referralData.value.provinceID != null) {
        await fetchMunicipality();
        await fetchBarangay();
    }
    await fetchMessages();
    Cookies.set('referralID', referralData.value.referralID);
    if (referralData.value.referralStatus == 1 && referralData.value.referringHospital != hciID.value) {
        await postSetToOngoing();
    }
    userId.value = Cookies.get('uID');
    refHisID.value = referralData.value.referralID;

    fetching.value = false;
});
</script>

<template>
    <div class="fixed z-5" style="bottom: 3.5rem; right: 1.3rem">
        <div class="flex">
            <Badge v-if="newMessageAlert" severity="danger" class="p-overlay-badge ml-2 mt-2 z-5" style="width: 10px; height: 10px"></Badge>
            <Button icon="pi pi-send" class="p-button-rounded p-button-primary fixed z-1 bottom-0 right-0 m-4" @click="handleChatboxClick" />
        </div>
    </div>

    <div class="mb-5" v-if="referralData.status == 1 && hciID == 271 && hciID == referralData.receivingHospital && referralData.referralStatus <= 2">
        <Menubar :model="jbl" />
    </div>
    <div class="mb-5" v-if="referralData.status == 1 && hciID == 100000 && hciID == referralData.receivingHospital && referralData.referralStatus <= 2">
        <Menubar :model="opcenMenu" />
    </div>
    <div class="mb-5" v-if="referralData.status == 1 && hciID == referralData.referringHospital">
        <Menubar :model="printOnly" />
    </div>
    <div class="mb-5" v-if="referralData.status == 1 && hciID == referralData.receivingHospital && hciID != 271 && hciID != 100000 && referralData.referralStatus <= 2">
        <Menubar :model="other" />
    </div>
    <div class="mb-5" v-if="referralData.status == 1 && referralData && hciID == referralData.receivingHospital && (referralData.referralStatus == 4 || referralData.referralStatus == 5)">
        <Menubar :model="reopen" />
    </div>

    <Sidebar v-model:visible="chatBox" position="right" :blockScroll="false" style="height: 100%" class="w-full md:w-30rem lg:w-30rem">
        <div class="chat-container">
            <div class="messages-container custom-scrollbar" id="messages-container">
                <div :class="{ message: true, sent: m.user_id == userId, received: m.user_id != userId }" v-for="m of messages">
                    <div class="message-header">
                        <span
                            ><b>{{ m.user_id == userId ? 'You' : m.username }}</b></span
                        >
                        <span class="message-timestamp">{{ m.sent_date }} {{ m.sent_time }}</span>
                    </div>
                    <div class="message-content">
                        <p>{{ m.message }}</p>
                    </div>
                </div>
            </div>
            <div class="input-container">
                <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." class="message-input" />
                <Button :disabled="newMessage == ''" @click="sendMessage" icon="pi pi-send" class="send-button" />
            </div>
            <!-- <div v-else class="flex justify-content-center flex-wrap">
                <Divider />
                <p class="text-400 font-light font-italic">Sending messages are disabled due to referral status</p>
            </div> -->
        </div>
    </Sidebar>

    <div class="grid">
        <div class="col-12 lg:col-12 xl:col-12">
            <div class="mb-0">
                <div class="flex justify-content-between mb-3"></div>
                <Accordion :activeIndex="0">
                    <AccordionTab header="Referral History">
                        <p class="m-0">
                            <Timeline
                                v-if="referralData"
                                :value="referralData.referralHistory"
                                class="customized-timeline"
                                :pt="{
                                    opposite: {
                                        style: 'display:none;'
                                    }
                                }"
                            >
                                <template #marker="slotProps">
                                    <span class="flex w-1rem h-1rem align-items-center justify-content-center text-white border-circle z-0 shadow-1" :class="getStatusClassTL(slotProps.item.referralStatus)"></span>
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
                                                Status: <span class="font-bold" :class="getStatusClassText(slotProps.item.referralStatus)">{{ getStatus(slotProps.item.referralStatus, slotProps.item.arrived) }}</span>
                                                <span v-if="referralData.status == 0" class="text-gray-600 font-bold"> - Cancelled Referral</span>
                                            </p>
                                        </template>
                                    </Card>
                                </template>
                            </Timeline>
                        </p>
                    </AccordionTab>
                </Accordion>
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
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="lastName">Last Name <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required readonly v-model="referralData.lastName" id="lastName" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="firstName">First Name <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required readonly v-model="referralData.firstName" id="firstName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="middleName">Middle Name <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required readonly v-model="referralData.middleName" id="middleName" type="text" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="suffix">Suffix</label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" readonly v-model="referralData.suffix" id="suffix" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="gender">Gender <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required disabled :options="genderList" readonly v-model="referralData.gender" optionLabel="gender" optionValue="value" placeholder="Select Gender" />
                    </div>
                    <Divider align="left" type="solid">
                        <b>Address</b>
                    </Divider>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="street">Street</label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <InputText v-else class="uppercase" required readonly v-model="referralData.street" id="street" type="text" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="province">Province <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required disabled v-model="referralData.provinceID" :options="provinceList" optionLabel="Description" optionValue="ProvinceID" @change="fetchMunicipality()" placeholder="Select Province" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="infName">City/Municipality <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required disabled v-model="referralData.municipalityID" :options="municipalityList" optionLabel="Description" optionValue="MunicipalityID" @change="fetchBarangay()" placeholder="Select Municipality" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="infName">Barangay <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required disabled readonly v-model="referralData.barangayID" :options="barangayList" optionLabel="Name" optionValue="Id" placeholder="Select Barangay" />
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
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="impression">Pertinent Findings <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Textarea v-else required readonly v-model="referralData.impression" id="impression" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="impression">Location of Accident <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Textarea v-else required readonly v-model="referralData.locationOfAccident" id="impression" autoResize rows="1" cols="30" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <Skeleton v-if="fetching" width="10rem" class="mb-2"></Skeleton>
                        <label v-else for="gender">Type of Injury <span class="text-red-600">*</span></label>
                        <Skeleton v-if="fetching" height="3rem" class="mb-2"></Skeleton>
                        <Dropdown v-else required disabled :options="injuryList" readonly v-model="referralData.typeOfInjury" optionLabel="injury" optionValue="value" placeholder="Select Gender" />
                    </div>
                </div>
            </div>
        </div>
        <!-- MODALS -->

        <!-- LOADING  -->
        <Dialog v-model:visible="loading" modal :header="loadingHeader" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>{{ loadingText }}</p>
            </div>
            <ProgressBar v-if="loadingProgress" mode="indeterminate" style="height: 6px"></ProgressBar>
        </Dialog>

        <!-- ACCEPT PATIENT JBL -->
        <Dialog closable v-model:visible="accept" modal header="Accept Patient" :closable="false" :style="{ width: '26rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Please select receiving department and assigned physician to proceed.</p>
            </div>
            <div class="flex align-items-center gap-3 mb-3">
                <label for="department" class="font-semibold w-6rem">Department</label>
                <Dropdown required editable v-model="referralData.receivingDepartment" :options="departmentList" optionLabel="Description" optionValue="ServiceTypeID" placeholder="Select Department" />
            </div>
            <div class="flex align-items-center gap-3 mb-2">
                <label for="email" class="font-semibold w-6rem">Physician</label>
                <Dropdown required editable v-model="referralData.assignedDoctor" :options="doctorsList" optionLabel="fullName" optionValue="doctorID" placeholder="Select Physician" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button :disabled="referralData.receivingDepartment <= '0' || referralData.assignedDoctor <= '0'" @click="handleAccept" type="button" label="Submit" severity="primary"></Button>
            </div>
        </Dialog>

        <!-- DEFER PATIENT -->
        <Dialog closable v-model:visible="defer" modal header="Defer Patient" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to defer patient?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleDeferClick" type="button" label="Submit" severity="primary"></Button>
                <Button @click="cancelDefer" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>

        <!-- EDIT VITALS -->
        <Dialog closable v-model:visible="editVitalsModal" modal header="Defer Patient" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to edit patient's vital signs?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleEditVitals" type="button" label="Update" severity="primary"></Button>
                <Button @click="cancelEditVitalsModal" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>
        <!-- TRANSFER TO OPCEN -->
        <Dialog closable v-model:visible="opcen" modal header="Return to OPCEN" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to refer patient to OPCEN?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleOPCENClick" type="button" label="Yes" severity="primary"></Button>
                <Button @click="opcen.value = false" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>
        <!-- RETURN TO OPCEN -->
        <Dialog closable v-model:visible="returnOPCEN" modal header="Return to OPCEN" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to return referral to OPCEN?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleReturnOPCENClick" type="button" label="Yes" severity="primary"></Button>
                <Button @click="returnOPCEN.value = false" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>

        <!-- RETURN TO JBLMGH -->
        <Dialog closable v-model:visible="returnJBL" modal header="Return To JBLMGH" :closable="false" :style="{ width: '26rem' }">
            <div class="align-items-center gap-3 mb-3">
                <p>Are you sure you want to return referral to JBLMGH?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleReturnClick" type="button" label="Return" severity="primary"></Button>
                <Button @click="cancelReturn" type="button" label="Cancel" severity="secondary" class="mx-2"></Button>
            </div>
        </Dialog>

        <!-- REFER TO OTHER HCI JBL -->
        <Dialog closable v-model:visible="refer" modal header="Refer to other HCI" :closable="false" :style="{ width: 'auto' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Please select receiving hospital to proceed.</p>
            </div>
            <div class="flex align-items-center gap-3 mb-3">
                <label for="department" class="font-semibold w-6rem">Receiving Hospital</label>
                <Dropdown required v-model="referralData.newReceivingHospital" id="refHCI" filter :options="HCI" optionLabel="FacilityName" optionValue="HealthFacilityCodeShort" placeholder="Select Referring HCI" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleTransferClick" type="button" label="Submit" severity="primary"></Button>
            </div>
        </Dialog>

        <!-- OPCEN REFER TO OTHERS -->
        <Dialog closable v-model:visible="referOPCEN" modal header="Refer to other HCI" :closable="false" :style="{ width: 'auto' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Please select receiving hospital to proceed.</p>
            </div>
            <div class="flex align-items-center gap-3 mb-3">
                <label for="department" class="font-semibold w-6rem">Receiving Hospital</label>
                <Dropdown required v-model="referralData.newReceivingHospital" id="refHCI" filter :options="HCI" optionLabel="FacilityName" optionValue="HealthFacilityCodeShort" placeholder="Select Referring HCI" />
            </div>
            <div class="flex justify-content-end gap-2">
                <Button @click="handleOPCENToOtherHCI" type="button" label="Submit" severity="primary"></Button>
            </div>
        </Dialog>

        <!-- INPUT VALIDATION ERROR -->
        <Dialog v-model:visible="validation" modal header="Uh-oh! 😟" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Please fill-out all required fields.</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Okay" severity="primary" @click="validation = false"></Button>
            </div>
        </Dialog>

        <!-- REOPEN REFERRAL -->
        <Dialog v-model:visible="reopenModal" modal header="Confirm Reopen" :closable="false" :style="{ width: '25rem' }">
            <div class="flex align-items-center gap-3 mb-3">
                <p>Are you sure you want to reconsider the referral?</p>
            </div>
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Yes" severity="primary" @click="handleReopenClick"></Button>
                <Button type="button" label="Cancel" severity="secondary" @click="reopenModal = false"></Button>
            </div>
        </Dialog>
    </div>
</template>
<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.messages-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
}

.message {
    width: 18rem;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
}

.sent {
    background-color: #059669;
    color: #ffffff;
    align-self: flex-end;
}

.received {
    background-color: #f0f0f0;
    color: #000000;
    align-self: flex-start;
}

.message-header {
    display: flex;
    justify-content: space-between;
}

.message-timestamp {
    font-size: 0.7em;
}

.input-container {
    display: flex;
    align-items: center;
    padding: 10px;
}

.message-input {
    flex-grow: 1;
    margin-right: 10px;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 8px;
    background-color: #c7c6c6; /* or add it to the track */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9d9c9c;
}
</style>
