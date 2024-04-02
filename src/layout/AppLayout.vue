<script setup>
import { computed, watch, ref } from 'vue';
import Cookies from 'js-cookie';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
// import AppConfig from './AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const hospID = ref('');
hospID.value = Cookies.get('hciID');
const notificationType = ref(1);
const outsideClickListener = ref(null);

const showNotification = (e) => {
    console.log(e);
    if (e.sent_to == hospID.value) {
        if (e.notificationType == '1') {
            toast.add({ severity: 'success', summary: 'Accepted', detail: `${e.notification}`, life: 5000 });
        } else if (e.notificationType == '2') {
            toast.add({ severity: 'info', summary: 'Referred to OPCEN', detail: `${e.notification}`, life: 5000 });
        } else if (e.notificationType == '3') {
            toast.add({ severity: 'info', summary: 'Referred to other Healthcare Institution', detail: `${e.notification}`, life: 5000 });
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
window.Echo.connector.pusher.connection.bind('connected', function () {
    console.log('Notifications Connected');
});

-watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-theme-light': layoutConfig.darkTheme.value === 'light',
        'layout-theme-dark': layoutConfig.darkTheme.value === 'dark',
        'layout-overlay': layoutConfig.menuMode.value === 'overlay',
        'layout-static': layoutConfig.menuMode.value === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive.value,
        'layout-mobile-active': layoutState.staticMenuMobileActive.value,
        'p-input-filled': layoutConfig.inputStyle.value === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple.value
    };
});
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
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
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <Toast position="bottom-right" />
        <app-topbar></app-topbar>
        <div class="layout-sidebar">
            <app-sidebar></app-sidebar>
        </div>

        <div class="layout-main-container">
            <div class="layout-main">
                <router-view> </router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <app-config></app-config>
        <div class="layout-mask"></div>
    </div>
</template>

<style lang="scss" scoped></style>
