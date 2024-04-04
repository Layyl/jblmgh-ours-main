// router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import NotFound from '@/views/pages/NotFound.vue';
import useAuth from '@/service/useAuth';
import Cookies from 'js-cookie';
const isAuthenticated = () => {
    return localStorage.getItem('sessionID') !== null;
};

const router = createRouter({
    history: createWebHistory('/'),
    routes: [
        {
            path: '/',
            component: () => import('@/views/Login.vue'),
            name: 'login',
            beforeEnter: (to, from, next) => {
                if (isAuthenticated()) {
                    next('/ours/dashboard');
                } else {
                    next();
                }
            }
        },
        {
            path: '/verify-email',
            name: 'VerifyEmail',
            component: () => import('@/views/pages/VerifyEmail.vue'),
            beforeEnter: (to, from, next) => {
                if (Object.keys(to.query).length > 0) {
                    next();
                } else {
                    next('/');
                }
            }
        },
        {
            path: '/forgot-password-assistance',
            name: 'ForgotPasswordAssistance',
            component: () => import('@/views/pages/ForgotPassword.vue')
        },
        {
            path: '/forgot-password',
            name: 'ForgotPassword',
            component: () => import('@/views/pages/ForgotPasswordSet.vue'),
            beforeEnter: (to, from, next) => {
                if (Object.keys(to.query).length > 0) {
                    next();
                } else {
                    next('/');
                }
            }
        },
        {
            path: '/success',
            name: 'SetPasswordSuccess',
            component: () => import('@/views/pages/SetPasswordSuccess.vue'),
            beforeEnter: (to, from, next) => {
                if (to.query.fromVerifyEmail === 'true') {
                    next();
                } else {
                    next('/');
                }
            }
        },
        {
            path: '/ours',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/ours/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/ours/patientlist',
                    name: 'masterfile',
                    component: () => import('@/views/pages/PatientList.vue')
                },
                {
                    path: '/ours/addPatient',
                    name: 'addPatient',
                    component: () => import('@/views/pages/AddPatient.vue')
                },
                {
                    path: '/ours/addPatientForm',
                    name: 'addPatientForm',
                    component: () => import('@/views/pages/AddPatientForm.vue')
                },
                {
                    path: '/ours/viewPatientForm',
                    name: 'viewPatientForm',
                    component: () => import('@/views/pages/ViewPatientForm.vue')
                },
                {
                    path: '/ours/manageUsers',
                    name: 'manageUsers',
                    component: () => import('@/views/pages/ManageUsers.vue')
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            component: NotFound
        }
    ]
});
const { checkTokenAndClearSession } = useAuth();
router.beforeEach((to, from, next) => {
    checkTokenAndClearSession();
    Cookies.remove('referralID');

    if (to.meta.requiresAuth && !isAuthenticated()) {
        next('/');
    } else {
        next();
    }
});

export default router;
