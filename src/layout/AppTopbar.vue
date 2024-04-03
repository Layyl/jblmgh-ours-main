<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import useAuth from '../service/useAuth';
import { useLayout } from '@/layout/composables/layout';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '../api';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const toast = useToast();
const { changeThemeSettings, layoutConfig, onMenuToggle } = useLayout();
const { checkTokenAndClearSession } = useAuth();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const isDark = ref(false);
const username = Cookies.get('uname');
const notifs = ref();
const hospID = ref('');
hospID.value = Cookies.get('hciID');
const notificationsList = ref([]);
const menu = ref();

const showNotifs = (event) => {
    notifs.value.toggle(event);
};

const onChangeTheme = (theme, mode) => {
    isDark.value = !isDark.value;
    console.log(isDark.value);
    const elementId = 'theme-css';
    const linkElement = document.getElementById(elementId);
    const cloneLinkElement = linkElement.cloneNode(true);
    const newThemeUrl = linkElement.getAttribute('href').replace(layoutConfig.theme.value, theme);
    cloneLinkElement.setAttribute('id', elementId + '-clone');
    cloneLinkElement.setAttribute('href', newThemeUrl);
    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();
        cloneLinkElement.setAttribute('id', elementId);
        changeThemeSettings(theme, mode === 'dark');
    });
    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
};

const showNotification = (e) => {
    console.log(e);
    if (e.sent_to == hospID.value) {
        if (e.notificationType == '1') {
            toast.add({ severity: 'success', summary: 'Accepted', detail: `${e.notification}`, life: 5000 });
        } else if (e.notificationType == '2') {
            toast.add({ severity: 'info', summary: 'Referred to OPCEN', detail: `${e.notification}`, life: 5000 });
        } else if (e.notificationType == '3') {
            toast.add({ severity: 'info', summary: 'Referred to other Healthcare Institution', detail: `${e.notification}`, life: 5000 });
        } else if (e.notificationType == '4') {
            toast.add({ severity: 'info', summary: 'New Referral', detail: `${e.notification}`, life: 5000 });
        }
        fetchNotifications();
    }
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

window.Echo.channel('notification').listen('NewNotification', showNotification);
window.Echo.connector.pusher.connection.bind('connected', function () {
    console.log('Notifications Connected');
});

const fetchNotifications = async () => {
    const response = await api.get(`/fetchNotifications?user_id=${hospID.value}`, { headers: header });
    notificationsList.value = response.data.notifications;
    console.log(notificationsList.value);
};

onMounted(() => {
    fetchNotifications();
    bindOutsideClickListener();
    checkTokenAndClearSession();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return `../../src/assets/img/jbllogo.png`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const onSettingsClick = () => {
    topbarMenuActive.value = false;
    router.push('/documentation');
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />

            <p>ONE UNIFIED REFERRAL SYSTEM</p>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <div>
                <button @click="showNotifs" aria-haspopup="true" aria-controls="overlay_menu" class="p-link layout-topbar-button">
                    <i class="pi pi-bell"></i>
                    <span>Notifications</span>
                </button>
            </div>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <!-- <button v-if="!isDark" @click="onChangeTheme('lara-light-teal', 'light')" class="p-link layout-topbar-button">
                <i class="pi pi-sun"></i>
                <span>Change Theme</span>
            </button>
            <button v-else @click="onChangeTheme('lara-dark-teal', 'dark')" class="p-link layout-topbar-button">
                <i class="pi pi-moon"></i>
                <span>Change Theme</span>
            </button> -->
            <div>
                <button @click="showNotifs" aria-haspopup="true" aria-controls="overlay_menu" class="p-link layout-topbar-button">
                    <i class="pi pi-bell"></i>
                    <span>Notifications</span>
                </button>
                <OverlayPanel ref="notifs" :dismissable="false" :showCloseIcon="false">
                    <div class="p-4 custom-notification-panel">
                        <div class="flex align-items-center justify-content-between">
                            <h4>Notifications</h4>
                        </div>
                        <hr />
                        <div class="notification-list custom-scrollbar">
                            <div class="notification-item cursor-pointer" v-for="n in notificationsList" :key="n.id">
                                <div class="notification-content">
                                    <p>
                                        {{ n.notification }}
                                    </p>
                                    <small class="text-muted">{{ n.formatted_timestamp }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="text-center mt-3"><Button label="See All" class="p-button-text w-full" @click="seeAllNotifications" /></div> -->
                </OverlayPanel>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.custom-notification-panel {
    width: 300px;
}
.notification-list {
    height: 300px;
    overflow: auto;
}
.notification-item {
    background-color: #fafafa;
    border-bottom: 0.1px solid rgb(213, 213, 213);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 5px;
    display: flex;
    align-items: flex-start;
    width: 100%;
}

.notification-content {
    flex: 1;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
    height: 8px;
    background-color: #c7c6c6;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9d9c9c;
}
</style>
