<template>
    <div class="form-container" ref="formContainer">
        <form @submit.prevent="submitForm" class="user-form">
            <div class="form-data">
                <label for="firstName">First Name *</label>
                <input type="text" v-model="newUser.firstName" @input="validateName(newUser.firstName, 'firstName')"
                    required><br>
                <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
            </div>
            <div class="form-data">
                <label for="lastName">Last Name *</label>
                <input type="text" v-model="newUser.lastName" @input="validateName(newUser.lastName, 'lastName')"
                    required><br>
                <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
            </div>
            <div class="form-data">
                <label for="dob">Date of Birth *</label>
                <input type="date" v-model="newUser.dob" :max="today" required><br>
            </div>
            <div class="form-data">
                <label for="mobile">Mobile Number *</label>
                <input type="tel" v-model="newUser.mobile" @input="validateMobile(newUser.mobile)" maxlength="10"
                    required><br>
                <span v-if="errors.mobile" class="error">{{ errors.mobile }}</span>
            </div>
            <div class="form-data">
                <label for="address">Address *</label>
                <input type="text" v-model="newUser.address" required><br>
            </div>
            <button type="submit" class="form-button">Add</button>
        </form>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
    name: 'Form',
    props: ['addUser'],
    setup(props) {
        const newUser = ref({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: '',
            address: ''
        });

        const errors = ref({
            firstName: '',
            lastName: '',
            mobile: ''
        });

        const today = new Date().toISOString().split('T')[0];
        const formContainer = ref(null);

        const validateName = (name, field) => {
            const namePattern = /^[A-Za-z]+$/;
            if (!namePattern.test(name)) {
                errors.value[field] = 'Only alphabetical characters are allowed.';
            } else {
                errors.value[field] = '';
            }
        };

        const validateMobile = (mobile) => {
            const mobilePattern = /^\d{10}$/;
            if (!mobilePattern.test(mobile)) {
                errors.value.mobile = 'Mobile number should contain exactly 10 digits.';
            } else {
                errors.value.mobile = '';
            }
        };

        const clearErrors = () => {
            errors.value = {
                firstName: '',
                lastName: '',
                mobile: ''
            };
        };

        const handleClickOutside = (event) => {
            if (formContainer.value && !formContainer.value.contains(event.target)) {
                clearErrors();
            }
        };

        const submitForm = () => {
            if (errors.value.firstName || errors.value.lastName || errors.value.mobile) {
                alert('Please fix the errors before submitting.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];

            function doesItExists(user) {
                return user.mobile === newUser.value.mobile;
            }

            if (users.some(doesItExists)) {
                alert("Mobile Number already exists!");
            } else {
                props.addUser({ ...newUser.value });
            }
            clearForm();
        };

        const clearForm = () => {
            newUser.value = {
                firstName: '',
                lastName: '',
                dob: '',
                mobile: '',
                address: ''
            };
            clearErrors();
        };

        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        return { newUser, submitForm, validateName, validateMobile, errors, today, clearForm, formContainer };
    }
};
</script>

