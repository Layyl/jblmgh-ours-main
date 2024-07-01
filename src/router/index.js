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
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/Login2.vue'),
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
                    path: '/ours/editPatient',
                    name: 'editPatient',
                    component: () => import('@/views/pages/EditPatientForm.vue')
                },
                {
                    path: '/ours/addPatientSafru',
                    name: 'addPatientSafru',
                    component: () => import('@/views/pages/AddPatientSafru.vue')
                },
                {
                    path: '/ours/patientMasterfile',
                    name: 'patientMasterfile',
                    component: () => import('@/views/pages/PatientMasterfile.vue')
                },
                {
                    path: '/ours/outboundPatients',
                    name: 'outboundPatients',
                    component: () => import('@/views/pages/OutboundPatients.vue')
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
                    path: '/ours/viewPatientFormSafru',
                    name: 'viewPatientFormSafru',
                    component: () => import('@/views/pages/ViewPatientFormSafru.vue')
                },
                {
                    path: '/ours/viewPatientMasterfile',
                    name: 'viewPatientMasterfile',
                    component: () => import('@/views/pages/ViewPatientMasterfile.vue')
                },
                {
                    path: '/ours/manageUsers',
                    name: 'manageUsers',
                    component: () => import('@/views/pages/ManageUsers.vue')
                },
                {
                    path: '/ours/manageHCI',
                    name: 'manageHCI',
                    component: () => import('@/views/pages/ManageHCI.vue')
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
