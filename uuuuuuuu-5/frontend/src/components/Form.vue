<template>
    <div class="form-container">
        <form @submit.prevent="submitForm" class="user-form">
            <div class="form-data">
                <label for="firstName">First Name *</label>
                <input type="text" v-model="newUser.firstName" @input="validateName(newUser.firstName, 'firstName')"
                    placeholder="Enter your first name" required />
                <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
            </div>
            <div class="form-data">
                <label for="lastName">Last Name *</label>
                <input type="text" v-model="newUser.lastName" @input="validateName(newUser.lastName, 'lastName')"
                    placeholder="Enter your last name" required />
                <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
            </div>
            <div class="form-data">
                <label for="dob">Date of Birth *</label>
                <input type="text" v-model="newUser.dob" @input="validateDate(newUser.dob, 'dob')"
                    placeholder="Enter DD-MM-YYYY" required />
                <span v-if="errors.dob" class="error">{{ errors.dob }}</span>
            </div>
            <div class="form-data">
                <label for="mobile">Mobile Number *</label>
                <input type="tel" v-model="newUser.mobile" @input="validateMobile(newUser.mobile)" maxlength="10"
                    placeholder="Enter your mobile number" required />
                <span v-if="errors.mobile" class="error">{{ errors.mobile }}</span>
            </div>
            <div class="form-data">
                <label for="addr">Address *</label>
                <input type="text" v-model="newUser.addr" placeholder="Enter your address" required />
            </div>
            <button type="submit" class="form-button">Add</button>
        </form>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { reactive } from 'vue';

interface User {
    firstName: string;
    lastName: string;
    dob: string;
    mobile: string;
    addr: string;
}

interface Errors {
    firstName: string;
    lastName: string;
    dob: string;
    mobile: string;
}

export default {
    name: 'Form',
    emits: ['addUser'],
    setup(props, { emit }) {
        const newUser = reactive<User>({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: '',
            addr: ''
        });

        const errors = reactive<Errors>({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: ''
        });

        const validateName = (name: string, field: keyof Errors) => {
            const namePattern = /^[A-Za-z]+$/;
            if (!namePattern.test(name)) {
                errors[field] = 'Only alphabetical characters are allowed.';
            } else {
                errors[field] = '';
            }
        };

        const validateDate = (date: string, field: keyof Errors) => {
            const datePattern = /^\d{2}-\d{2}-\d{4}$/;
            if (!datePattern.test(date)) {
                errors[field] = 'Please enter a valid date in DD-MM-YYYY format.';
            } else {
                const [day, month, year] = date.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                if (dateObj.getFullYear() !== year || dateObj.getMonth() + 1 !== month || dateObj.getDate() !== day) {
                    errors[field] = 'Invalid date. Please check the day, month, and year.';
                } else if (dateObj > new Date()) {
                    errors[field] = 'Date of birth cannot be in the future.';
                } else {
                    errors[field] = '';
                }
            }
        };

        const validateMobile = (mobile: string) => {
            const mobilePattern = /^\d{10}$/;
            if (!mobilePattern.test(mobile)) {
                errors.mobile = 'Mobile number should contain exactly 10 digits.';
            } else {
                errors.mobile = '';
            }
        };

        const clearErrors = () => {
            errors.firstName = '';
            errors.lastName = '';
            errors.dob = '';
            errors.mobile = '';
        };

        const submitForm = async () => {
            const usersResponse = await axios.get('/api/users');
            const usersData: User[] = usersResponse.data.data;
            const existingUser = usersData.find(user => user.mobile === newUser.mobile);

            if (existingUser) {
                alert('This mobile number is already registered. Please enter a different mobile number.');
                return;
            }

            const response = await axios.post('/api/users', newUser);
            if (response && response.data.success) {
                alert('User added successfully');
                emit('addUser', newUser);
                clearForm();
            }
        };

        const clearForm = () => {
            newUser.firstName = '';
            newUser.lastName = '';
            newUser.dob = '';
            newUser.mobile = '';
            newUser.addr = '';
            clearErrors();
        };

        return { newUser, submitForm, validateName, validateDate, validateMobile, errors, clearForm };
    }
};
</script>
