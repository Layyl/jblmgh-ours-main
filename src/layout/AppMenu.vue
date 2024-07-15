<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import useAuth from '../service/useAuth';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AppMenuItem from './AppMenuItem.vue';

const hciID = ref('');
const username = ref('');
const { checkTokenAndClearSession } = useAuth();
const router = useRouter();

const model = ref([
    {
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/ours/dashboard' },
            { label: 'Patient Registration', icon: 'pi pi-fw pi-user-plus', to: '/ours/addPatient' },
            { label: 'Inbound Patient List', icon: 'pi pi-fw pi-arrow-down', to: '/ours/patientlist' },
            { label: 'Outbound Patients List', icon: 'pi pi-fw pi-arrow-up', to: '/ours/outboundPatients' },
            { label: 'Patient Master List', icon: 'pi pi-fw pi-users', to: '/ours/patientMasterfile' }
        ]
    }
]);

const logout = async () => {
    const header = { Authorization: `Bearer ${Cookies.get('token')}` };
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`, {}, { headers: header });
    Cookies.remove('token');
    Cookies.remove('hciID');
    Cookies.remove('uname');
    Cookies.remove('pID');
    Cookies.remove('uID');
    localStorage.removeItem('sessionID');
    router.push('/');
};
onMounted(async () => {
    hciID.value = Cookies.get('hciID');

    model.value[0].items[1].to = dynamicTo.value;

    let uname = Cookies.get('uname');

    if (uname) {
        uname = uname.replace(/-\d+$/, '');
    }

    // Set the modified username
    username.value = uname;
});
watch(hciID, (newVal) => {
    if (newVal === '0') {
        model.value[0].items.push(
            {
                label: 'Announcements',
                icon: 'pi pi-fw pi-megaphone',
                to: '/ours/announcements'
            },
            {
                label: 'Settings',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Manage Users',
                        icon: 'pi pi-user-edit',
                        to: '/ours/manageUsers'
                    },
                    {
                        label: 'Manage HCIs',
                        icon: 'pi pi-building',
                        to: '/ours/manageHCI'
                    }
                ]
            }
        );
    } else if (newVal === '271') {
        model.value[0].items.push({
            label: 'Announcements',
            icon: 'pi pi-fw pi-megaphone',
            to: '/ours/announcements'
        });
    }
});

const dynamicTo = computed(() => {
    if (hciID.value == 271) {
        console.log('a', model.value[0].items[1].to);
        return '/ours/addPatient';
    } else if (hciID.value == 100001) {
        console.log('b', model.value[0].items[1].to);
        return '/ours/AddPatientSafru?id=new';
    } else {
        console.log('c', model.value[0].items[1].to);
        return '/ours/addPatient';
    }
});
</script>

<template>
    <div class="flex flex-column gap-6 h-full overflow-hidden justify-content-between">
        <ul class="layout-menu flex-grow-1">
            <template v-for="(item, i) in model" :key="item">
                <li class="menu-separator">
                    <div class="m-3 p-0 t">
                        <h5>
                            Welcome, <span class="font-bold text-green-700">{{ username }} </span>
                        </h5>
                    </div>
                </li>
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul>

        <div class="mt-auto">
            <hr class="mb-3 mx-3 border-top-1 border-none surface-border" />
            <a @click="logout" v-ripple class="my-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
                <span class="pi pi-fw pi-power-off"></span> <span>Logout</span>
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
