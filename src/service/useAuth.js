// useAuth.js

import { ref } from 'vue';
import Cookies from 'js-cookie';

const modal = ref(false);

export default function useAuth() {
    const checkTokenAndClearSession = () => {
        const token = Cookies.get('token');
        if (!token) {
            modal.value = true;
            localStorage.removeItem('sessionID');
        }
    };

    return {
        checkTokenAndClearSession
    };
}
