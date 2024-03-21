<script setup>
import { ref, watch, onMounted } from 'vue';
import useAuth from '../service/useAuth';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AppMenuItem from './AppMenuItem.vue';

const hciID = ref('');

const { checkTokenAndClearSession } = useAuth();
const router = useRouter();

const model = ref([
    {
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/ours/dashboard' },
            { label: 'Patient Registration', icon: 'pi pi-fw pi-user-plus', to: '/ours/addPatient' },
            { label: 'Patient List', icon: 'pi pi-fw pi-users', to: '/ours/patientlist' }
        ]
    }
]);

const logout = async () => {
    const header = { Authorization: `Bearer ${Cookies.get('token')}` };
    const response = await axios.post('http://192.163.8.195:90/api/logout', {}, { headers: header });
    console.log('logout');
    Cookies.remove('token');
    Cookies.remove('hciID');
    Cookies.remove('uname');
    Cookies.remove('pID');
    localStorage.removeItem('sessionID');
    router.push('/');
};
onMounted(async () => {
    hciID.value = Cookies.get('hciID');
});
watch(hciID, (newVal) => {
    if (newVal === '217') {
        model.value[0].items.push({
            label: 'Settings',
            icon: 'pi pi-fw pi-cog',
            items: [
                {
                    label: 'Manage Users',
                    icon: 'pi pi-user-edit',
                    to: '/ours/manageUsers'
                }
            ]
        });
    }
});
</script>

<template>
    <div class="flex flex-column gap-6 h-full overflow-hidden justify-content-between">
        <ul class="layout-menu flex-grow-1">
            <template v-for="(item, i) in model" :key="item">
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
