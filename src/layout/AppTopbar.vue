<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import useAuth from '../service/useAuth';
import { useLayout } from '@/layout/composables/layout';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const toast = useToast();
const { changeThemeSettings, layoutConfig, onMenuToggle } = useLayout();
const { checkTokenAndClearSession } = useAuth();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const isDark = ref(false);
const username = Cookies.get('uname');
const menu = ref();

const toggle = (event) => {
    menu.value.toggle(event);
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

onMounted(() => {
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
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button v-if="!isDark" @click="onChangeTheme('lara-light-teal', 'light')" class="p-link layout-topbar-button">
                <i class="pi pi-sun"></i>
                <span>Change Theme</span>
            </button>
            <button v-else @click="onChangeTheme('lara-dark-teal', 'dark')" class="p-link layout-topbar-button">
                <i class="pi pi-moon"></i>
                <span>Change Theme</span>
            </button>
            <button @click="" aria-haspopup="true" aria-controls="overlay_menu" class="p-link layout-topbar-button">
                <i class="pi pi-bell"></i>
                <span>Notifications</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
