<script setup>
import { computed, watch, ref } from 'vue';
import Cookies from 'js-cookie';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import api from '../api';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
const router = useRouter();
const toast = useToast();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const header = { Authorization: `Bearer ${Cookies.get('token')}` };
const outsideClickListener = ref(null);
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
const viewNotification = (rid, rhid) => {
    router.push(`/ours/viewPatientForm?rid=${rid}&rhid=${rhid}`);
};
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <Toast position="bottom-left">
            <template #message="slotProps">
                <div class="flex flex-column align-items-start" style="flex: 1">
                    <div class="font-bold text-lg my-1 text-900">{{ slotProps.message.summary }}</div>
                    <div class="font-medium text-lg my-3 text-900">{{ slotProps.message.detail }}</div>
                    <Button v-if="slotProps.message.notificationType != 8" severity="info" class="w-full" text label="View" @click="viewNotification(slotProps.message.rid, slotProps.message.rhid)" />
                </div>
            </template>
        </Toast>
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
        <!-- <app-config></app-config> -->
        <div class="layout-mask"></div>
    </div>
</template>

<style lang="scss" scoped></style>
