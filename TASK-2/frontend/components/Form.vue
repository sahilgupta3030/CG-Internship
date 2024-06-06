<template>
    <div class="form-container">
        <form @submit.prevent="submitForm" class="user-form">
            <div class="form-data">
                <label for="firstName">First Name *</label>
                <input type="text" v-model="newUser.firstName" @input="validateName(newUser.firstName, 'firstName')"
                    placeholder="Enter your first name" required>
                <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
            </div>
            <div class="form-data">
                <label for="lastName">Last Name *</label>
                <input type="text" v-model="newUser.lastName" @input="validateName(newUser.lastName, 'lastName')"
                    placeholder="Enter your last name" required>
                <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
            </div>
            <div class="form-data">
                <label for="dob">Date of Birth *</label>
                <input type="text" v-model="newUser.dob" @input="validateDate(newUser.dob, 'dob')"
                    placeholder="Enter DD-MM-YYYY" required>
                <span v-if="errors.dob" class="error">{{ errors.dob }}</span>
            </div>
            <div class="form-data">
                <label for="mobile">Mobile Number *</label>
                <input type="tel" v-model="newUser.mobile" @input="validateMobile(newUser.mobile)" maxlength="10"
                    placeholder="Enter your mobile number" required>
                <span v-if="errors.mobile" class="error">{{ errors.mobile }}</span>
            </div>
            <div class="form-data">
                <label for="addr">Address *</label>
                <input type="text" v-model="newUser.addr" placeholder="Enter your address" required>
            </div>
            <button type="submit" class="form-button">Add</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
    name: 'Form',
    emits: ['addUser'],
    setup(props, { emit }) {
        const newUser = ref({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: '',
            addr: ''
        });

        const errors = ref({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: ''
        });

        const validateName = (name, field) => {
            const namePattern = /^[A-Za-z]+$/;
            if (!namePattern.test(name)) {
                errors.value[field] = 'Only alphabetical characters are allowed.';
            } else {
                errors.value[field] = '';
            }
        };

        const validateDate = (date, field) => {
            const datePattern = /^\d{2}-\d{2}-\d{4}$/;
            if (!datePattern.test(date)) {
                errors.value[field] = 'Please enter a valid date in DD-MM-YYYY format.';
            } else {
                const [day, month, year] = date.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                if (dateObj.getFullYear() !== year || dateObj.getMonth() + 1 !== month || dateObj.getDate() !== day) {
                    errors.value[field] = 'Invalid date. Please check the day, month, and year.';
                } else if (dateObj > new Date()) {
                    errors.value[field] = 'Date of birth cannot be in the future.';
                } else {
                    errors.value[field] = '';
                }
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
                dob: '',
                mobile: ''
            };
        };

        const submitForm = async () => {
            const response = await axios.get('/api/users');
            const existingUsers = response.data;

            const mobileExists = existingUsers.some(user => user.mobile === newUser.value.mobile);
            if (mobileExists) {
                alert('Mobile number already exists. Please use a different mobile number.');
                return;
            }

            const createResponse = await axios.post('/api/users', newUser.value);
            if (createResponse.status) {
                alert('User added successfully with ID: ' + createResponse.data.userId);
                emit('addUser', newUser.value);
                clearForm();
            }
        };

        const clearForm = () => {
            newUser.value = {
                firstName: '',
                lastName: '',
                dob: '',
                mobile: '',
                addr: ''
            };
            clearErrors();
        };

        return { newUser, submitForm, validateName, validateDate, validateMobile, errors, clearForm };
    }
};
</script>
