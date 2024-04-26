<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
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
const messages = ref();
const notifs = ref();
const hospID = ref('');
hospID.value = Cookies.get('hciID');
const messageNotificationsList = ref([]);
const notificationsList = ref([]);
const menu = ref();
const newNotif = ref(false);
const newMessage = ref(false);
const refID = ref('');
const showNotifs = (event) => {
    notifs.value.toggle(event);
    newNotif.value = false;
};
const showMessages = (event) => {
    messages.value.toggle(event);
    newMessage.value = false;
};
const viewNotification = (rid, rhid, safru) => {
    if (safru == 1) {
        router.push(`/ours/viewPatientFormSafru?rid=${rid}&rhid=${rhid}`);
    } else {
        router.push(`/ours/viewPatientForm?rid=${rid}&rhid=${rhid}`);
    }
};
const onChangeTheme = (theme, mode) => {
    isDark.value = !isDark.value;
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

const notificationTypes = {
    1: 'Accepted',
    2: 'Referred to OPCEN',
    3: 'Referred to other Healthcare Institution',
    4: 'New Referral',
    5: 'Referral Deferred',
    6: 'Under Assessment',
    7: 'New Message',
    8: 'Referral Cancelled',
    9: 'Referred to JBLMGH',
    10: 'Vital Signs Updated',
    11: 'Patient Expired',
    12: 'New Referral From OPCEN',
    13: 'New Referral From SAFRU'
};

const showNotification = (e) => {
    const { sent_to, notificationType, referralID, ri, referralHistoryID, safru } = e;
    if (sent_to == hospID.value && notificationTypes[notificationType]) {
        const summary = notificationTypes[notificationType];
        const detail = e.notification;

        if (notificationType != 7) {
            toast.add({ severity: 'info', summary, detail, life: 3000, rid: referralID, rhid: referralHistoryID, notificationType: notificationType, safru: safru });
            fetchNotifications();
            newNotif.value = true;
        } else if (notificationType == 7 && ri != refID.value) {
            toast.add({ severity: 'info', summary, detail, life: 3000, rid: referralID, rhid: referralHistoryID, notificationType: notificationType, safru: safru });
            fetchMessageNotifications();
            newMessage.value = true;
        }
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
window.Echo.connector.pusher.connection.bind('connected', function () {});

const fetchNotifications = async () => {
    const response = await api.get(`/fetchNotifications?user_id=${hospID.value}`, { headers: header });
    notificationsList.value = response.data.notifications;
};
const fetchMessageNotifications = async () => {
    const response = await api.get(`/fetchMessageNotifications?user_id=${hospID.value}`, { headers: header });
    messageNotificationsList.value = response.data.notifications;
};

const setToExpired = async () => {
    const response = await api.post(`/setToExpired`, '', { headers: header });
};

onMounted(() => {
    setInterval(() => {
        const currentReferralID = Cookies.get('referralID');
        if (currentReferralID != refID.value) {
            refID.value = currentReferralID;
        }
    }, 1000);

    setToExpired();
    fetchNotifications();
    fetchMessageNotifications();
    bindOutsideClickListener();
    checkTokenAndClearSession();
});
onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
const logoUrl = computed(() => {
    return `../../src/assets/img/jbllogo.png`;
});

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

        <button class="p-link layout-topbar-menu-button">
            <div>
                <i @click="showMessages" class="pi pi-envelope cursor-pointer text-2xl pl-3"> <Badge style="width: 9px; height: 9px; position: absolute; margin-left: -8px" v-if="newMessage" :value="notificationCount" severity="danger" /> </i>
            </div>
        </button>
        <button class="p-link layout-topbar-menu-button">
            <div>
                <i @click="showNotifs" class="pi pi-bell cursor-pointer text-2xl pl-3"> <Badge style="width: 9px; height: 9px; position: absolute; margin-left: -8px" v-if="newNotif" :value="notificationCount" severity="danger" /> </i>
            </div>
        </button>

        <!-- messages-->
        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <i @click="showMessages" class="pi pi-envelope cursor-pointer text-2xl pl-3">
                <Badge style="width: 9px; height: 9px; position: absolute; margin-left: -8px" v-if="newMessage" :value="notificationCount" severity="danger" />
            </i>
            <div>
                <OverlayPanel ref="messages" :dismissable="false" :showCloseIcon="false">
                    <div class="p-4 custom-notification-panel">
                        <div class="flex align-items-center justify-content-between">
                            <h4>Messages</h4>
                        </div>
                        <hr />
                        <div class="notification-list custom-scrollbar">
                            <div @click="viewNotification(n.referralID, n.referralHistoryID, n.safru)" class="notification-item cursor-pointer" v-for="n in messageNotificationsList" :key="n.id">
                                <div class="notification-content">
                                    <p>
                                        {{ n.notification }}
                                    </p>
                                    <small class="text-muted">{{ n.formatted_timestamp }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </OverlayPanel>
            </div>

            <i @click="showNotifs" class="pi pi-bell cursor-pointer text-2xl pl-3">
                <Badge style="width: 9px; height: 9px; position: absolute; margin-left: -8px" v-if="newNotif" :value="notificationCount" severity="danger" />
            </i>
            <div>
                <OverlayPanel ref="notifs" :dismissable="false" :showCloseIcon="false">
                    <div class="p-4 custom-notification-panel">
                        <div class="flex align-items-center justify-content-between">
                            <h4>Notifications</h4>
                        </div>
                        <hr />
                        <div class="notification-list custom-scrollbar">
                            <div @click="viewNotification(n.referralID, n.referralHistoryID, n.safru)" class="notification-item cursor-pointer" v-for="n in notificationsList" :key="n.id">
                                <div class="notification-content">
                                    <p>
                                        {{ n.notification }}
                                    </p>
                                    <small class="text-muted">{{ n.formatted_timestamp }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
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
