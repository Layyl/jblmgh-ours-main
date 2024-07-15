<template>
    <div class="smooth-scroll">
        <!-- HEADER SECTION -->
        <header class="w-100 float-left header-con">
            <div class="wrapper">
                <nav class="navbar navbar-expand-lg navbar-light p-0">
                    <a class="navbar-brand" href="#">
                        <figure class="mb-0">
                            <img src="../assets/img/logo.png" />
                        </figure>
                    </a>
                    <button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                        <span class="navbar-toggler-icon"></span>
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                        <!-- <ul class="navbar-nav">
              <li class="nav-item active">
                <a class="nav-link p-0" href="#home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link p-0" href="#features">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link p-0" href="#about">Services</a>
              </li>
              <li class="nav-item">
                <a class="nav-link p-0" href="#process">Doctors</a>
              </li>
              <li class="nav-item">
                <a class="nav-link p-0" href="#contacts">Contact Us</a>
              </li>
            </ul> -->
                        <div class="header-contact d-flex align-items-center">
                            <div class="phone d-flex align-items-center">
                                <figure class="mb-0">
                                    <img src="../assets/img/headphone-icon.png" />
                                </figure>
                                <div class="phone-txt">
                                    <span class="d-block">For concerns, call us at:</span>
                                    <a href="tel:+012(345)6789">+(045) 409-6690</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
        <!-- HEADER SECTION -->
        <!-- BANNER SECTION -->
        <Toast position="bottom-left" />
        <section class="w-100 float-left banner-con position-relative" id="home">
            <div class="wrapper2">
                <div class="banner-inner-box position-relative">
                    <div class="banner-inner-con">
                        <div class="banner-title flex-grow-1">
                            <h1 data-aos="fade-up" data-aos-duration="700">One Unified<br />Referral System</h1>
                            <p data-aos="fade-up" data-aos-duration="700">JBLMGH, Serbisyong may Lingap, Husay, at Malasakit.</p>
                            <div class="banner-btn d-flex align-items-center flex-column flex-md-row mt-4" data-aos="fade-up" data-aos-duration="700">
                                <div class="form-group col-12 p-0 m-0 col-md-auto">
                                    <input type="email" @keyup.enter="login" class="form-control form-control-lg" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="username" placeholder="Enter Username" />
                                </div>
                                <div class="form-group col-12 p-0 m-0 col-md-auto">
                                    <input type="password" @keyup.enter="login" class="form-control form-control-lg" id="exampleInputPassword1" aria-describedby="emailHelp" v-model="password" placeholder="Enter Password" />
                                </div>
                                <div class="col-12 col-md-auto">
                                    <Button type="button" class="border-round px-5 py-2 bg-green-600 border-none" label="Log in" :loading="loading" @click="login" />
                                </div>
                            </div>
                            <div class="row m-1">
                                <small data-aos="fade-up" data-aos-duration="700" class="text-white font-italic cursor-pointer" @click="forgetPassword">Forgot Password?</small>
                            </div>
                        </div>
                        <div class="banner-details">
                            <figure class="mb-0">
                                <img src="../assets/img/er2.png" />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- BANNER SECTION -->
        <!-- SERVICE SECTION -->
        <section class="w-100 float-left service-con padding-top padding-bottom" id="features">
            <div class="container">
                <div class="service-box">
                    <div class="service-box-content" data-aos="fade-up" data-aos-duration="700">
                        <span class="d-block sub-txt">What <i>OURS</i> Provide</span>
                        <h2>Features</h2>
                        <p class="mb-0">The system has features that enables a streamlined patient referral service</p>
                    </div>
                    <div class="service-box-item" data-aos="fade-up" data-aos-duration="700">
                        <figure>
                            <img src="../assets/img/process.png" />
                        </figure>
                        <h4>Streamlined Referrals</h4>
                        <p>OURS helps hospital hasten their referral process by providing an intuitive system</p>
                    </div>
                    <div class="service-box-item" data-aos="fade-up" data-aos-duration="700">
                        <figure>
                            <img src="../assets/img/verified.png" />
                        </figure>
                        <h4>Secured Data Sharing</h4>
                        <p>OURS uses modern data encryption technology to keep shared data private and secure</p>
                    </div>
                    <div class="service-box-item" data-aos="fade-up" data-aos-duration="700">
                        <figure>
                            <img src="../assets/img/chat.png" />
                        </figure>
                        <h4>Improved Communication Flow</h4>
                        <p>OURS has a built in chat and notification feature that allows better communication between hospitals</p>
                    </div>
                    <div class="service-box-item" data-aos="fade-up" data-aos-duration="700">
                        <figure>
                            <img src="../assets/img/approve.png" />
                        </figure>
                        <h4>Improved Data Collection and Analysis</h4>
                        <p>OURS' data collection features are neatly organized to help medical personnel send and read data efficiently.</p>
                    </div>
                    <div class="service-box-item" data-aos="fade-up" data-aos-duration="700">
                        <figure>
                            <img src="../assets/img/low-price.png" />
                        </figure>
                        <h4>Reduced Costs</h4>
                        <p>OURS helps in reducing hospital costs by allowing data to be shared without the use of papers</p>
                    </div>
                    <div class="service-provide-box" data-aos="fade-up" data-aos-duration="700">
                        <div class="service-provide-title">
                            <h3>Register now to use OURS</h3>
                            <p>Fill up the form and we'll help you register!</p>
                            <div class="provide-btn d-flex align-items-center">
                                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc9MasaUCd-P6kwUjMFnZlfFeP_7mxV1zOlI4TdYvClfDrR-g/viewform" target="_blank">Registration Form</a>
                                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc9MasaUCd-P6kwUjMFnZlfFeP_7mxV1zOlI4TdYvClfDrR-g/viewform" target="_blank" class="provide-arrow">
                                    <figure class="mb-0 d-flex align-items-center justify-content-center">
                                        <img src="../assets/img/samll-arrow.png" />
                                    </figure>
                                </a>
                            </div>
                        </div>
                        <div class="service-provide-img">
                            <figure class="mb-0">
                                <img src="../assets/img/errush.jpg" />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- SERVICE SECTION -->
        <!-- ABOUT SECTION -->
        <section class="w-100 float-left about-con design-img padding-top padding-bottom position-relative" id="about">
            <div class="wrapper3">
                <div class="about-box" data-aos="fade-up" data-aos-duration="700">
                    <div class="about-box-img">
                        <div class="vedio-img position-relative">
                            <div class="vedio-sub-img">
                                <img class="thumb poster-con index1-poster" src="/img/1.jpg" />
                                <img class="thumb poster-con index1-poster" src="/img/2.jpg" />
                                <img class="thumb poster-con index1-poster" src="/img/3.jpg" />
                            </div>
                            <!-- <div class="btn-outer">
                <a href="javascript:void(0)" onclick="lightbox_open();">
                  <div class="video-wrap">
                  
                  </div>
                </a>
              </div> -->
                        </div>
                    </div>
                    <div class="about-box-title" data-aos="fade-up" data-aos-duration="700">
                        <span class="d-block sub-txt">About</span>
                        <h2>Welcome to One Unified Referral System</h2>
                        <p>
                            The One Unified Referral System (OURS) is a platform designed to facilitate seamless patient referrals between Jose B. Lingad Memorial General Hospital and collaborating medical institutions. OURS serves as a digital
                            bridge, connecting healthcare providers and streamlining the referral process with efficiency and precision
                        </p>
                        <div class="generic-list">
                            <ul class="list-unstyled mb-0">
                                <li>Effortless Referral Initiation</li>
                                <li>Real-Time Monitoring</li>
                                <li>Secure Communication</li>
                            </ul>
                            <ul class="list-unstyled mb-0">
                                <li>Intuitive User Interface</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- ABOUT SECTION -->
        <!-- PROCESS SECTION -->
        <section class="work-process-sec w-100 float-left padding-bottom padding-top" id="process">
            <div class="container">
                <div class="generic-title text-center" data-aos="fade-up" data-aos-duration="700">
                    <span class="d-block sub-txt">The basic Referral PROCESS</span>
                    <h2 class="mb-0">Let’s See How Referrals Work</h2>
                </div>
                <div class="process-con">
                    <ul class="list-unstyled mb-0">
                        <li class="text-center" data-aos="fade-up" data-aos-duration="700">
                            <div class="process-img-box">
                                <figure>
                                    <img src="../assets/img/document.png" />
                                </figure>
                                <span>01</span>
                            </div>
                            <h4>Referral Creation</h4>
                            <p>The process starts with the creation of the patient referral which will be seen by the receiving hospital</p>
                        </li>
                        <li class="text-center" data-aos="fade-up" data-aos-duration="700">
                            <div class="process-img-box">
                                <figure>
                                    <img src="../assets/img/review.png" />
                                </figure>
                                <span>02</span>
                            </div>
                            <h4>Data Assessment</h4>
                            <p>
                                The receiving hospital will be notified of the new referral.
                                <br />
                                They will be able to assess the patient based on the data given. Users are also able to gather more information through the chat feature.
                            </p>
                        </li>
                        <li class="text-center" data-aos="fade-up" data-aos-duration="700">
                            <div class="process-img-box">
                                <figure>
                                    <img src="../assets/img/yes.png" />
                                </figure>
                                <span>03</span>
                            </div>
                            <h4>Accepting the Patient</h4>
                            <p>The receiving hospital will receive the patient through the app. The referring hospital will be notified of this.</p>
                        </li>
                        <li class="text-center" data-aos="fade-up" data-aos-duration="700">
                            <div class="process-img-box">
                                <figure>
                                    <img src="../assets/img/ambulance.png" />
                                </figure>
                                <span>04</span>
                            </div>
                            <h4>Patient Arrives.</h4>
                            <p>Patient will be transferred to the receiving hospital. Referral complete.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
        <!-- PROCESS SECTION -->

        <!-- GET IN TOUCH SECTION -->
        <section class="get-in-touch-section w-100 float-left" id="contacts">
            <div class="container">
                <div class="contact-section" data-aos="fade-up" data-aos-duration="700">
                    <div class="doctor-img-con"></div>
                    <div class="contact-txt-con">
                        <div class="generic-title mb-0">
                            <span class="sub-txt d-block">GET IN TOUCH</span>
                            <h2>We Provide The Best Services for Our Patients!</h2>
                        </div>
                        <div class="submit-btn">
                            <span class="sub-txt d-block">Use OURS.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- GET IN TOUCH SECTION -->
        <!-- FOOTER SECTION -->
        <section class="footer-main-section w-100 float-left">
            <div class="container">
                <div class="footer-inner-con d-flex flex-column flex-md-row justify-content-center align-items-center">
                    <div class="footer-box footer-logo-box col-12 col-md-6 mb-4 mb-md-0">
                        <figure>
                            <img src="../assets/img/logo.png" />
                        </figure>
                        <p>
                            Welcome to the One Unified Referral System (OURS) - your comprehensive solution for interhospital patient referrals. Developed to streamline, monitor, and expedite the referral process between Jose B. Lingad Memorial
                            General Hospital and other medical institutions, OURS sets a new standard for efficiency and communication in healthcare.
                        </p>
                    </div>
                    <div class="footer-box contact-details-box col-12 col-md-6">
                        <h4>Contact Us</h4>
                        <ul class="list-unstyled mb-0">
                            <li><i class="fas fa-map-marker-alt"></i> Dolores, City of San Fernando, Pampanga</li>
                            <li>
                                <i class="fas fa-phone-alt"></i>
                                <a href="tel:+12025550153">(045) 409-6690</a>
                            </li>
                        </ul>
                    </div>
                    <div class="footer-box contact-details-box col-12 col-md-6">
                        <h4>User Manuals</h4>
                        <ul class="list-unstyled mb-0">
                            <li>
                                <a href="https://drive.google.com/file/d/1Dzm6a5Nun0SbzjopbYeJuTMvZjSWv88T/view?usp=sharing" target="_blank"><i class="fas fa-download"></i> Partner HCIs</a>
                            </li>
                            <li>
                                <a href="https://drive.google.com/file/d/1xASiq3cgkHKYXMp62S_eFrNt7QSw5flM/view?usp=sharing" target="_blank"><i class="fas fa-download"></i> Operation Centers</a>
                            </li>
                            <li>
                                <a href="https://drive.google.com/file/d/1w6NIws18iStUahOYpRoCajPA98BzVDL7/view?usp=sharing" target="_blank"><i class="fas fa-download"></i> Rescue Units</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <ScrollTop />
        <div class="copyright-con w-100 float-left text-center">
            <p class="mb-0">A Project of JBLMGH - IHOMS</p>
        </div>
        <a id="button"></a>
        <!-- FOOTER SECTION -->
    </div>
</template>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Outfit:wght@300;400;500;600;700&family=Syne:wght@500;700&display=swap');
@import url('https://use.fontawesome.com/releases/v5.15.4/css/all.css');
@import '@/assets/css/bootstrap.min.css';
/* @import '@/assets/css/aos.css'; */
@import '@/assets/css/superclasses.css';
@import '@/assets/css/custom.css';
@import '@/assets/css/mobile.css';
</style>

<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
import { useToast } from 'primevue/usetoast';
const toast = useToast();
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();
const username = ref('');
const password = ref('');
const response = ref([]);
const visible = ref(false);
const loading = ref(false);
const forgetPassword = () => {
    router.push('/forgot-password-assistance');
};

const login = async () => {
    loading.value = true;
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        username: username.value,
        password: password.value
    });
    if (response.data.status == 2) {
        var date = new Date();
        date.setTime(date.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds

        Cookies.set('token', response.data.token, { expires: date });
        Cookies.set('hciID', response.data.user.hciID, { expires: date });
        Cookies.set('uname', response.data.user.username, { expires: date });
        Cookies.set('pID', response.data.user.personID, { expires: date });
        Cookies.set('uID', response.data.user.id, { expires: date });
        Cookies.set('tempPass', response.data.user.tempPassChanged, { expires: date });
        localStorage.setItem('sessionID', response.data.token);
        router.push('/ours/dashboard');
    } else {
        showWarn();
        username.value = '';
        password.value = '';
    }
    loading.value = false;
};

const showWarn = () => {
    toast.add({ severity: 'error', summary: 'Login Failed', detail: 'Incorrect username or Password', life: 3000 });
};
</script>
