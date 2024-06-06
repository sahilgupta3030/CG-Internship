<template>
    <div class="table-container" v-if="users && users.length">
        <table>
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Date of Birth</th>
                    <th>Mobile Number</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(user, index) in users" :key="index">
                    <td>
                        <input type="text" class="table-data" :class="{ 'editing-row': user.editing }"
                            v-model="user.firstName" :disabled="!user.editing">
                    </td>
                    <td>
                        <input type="text" class="table-data" :class="{ 'editing-row': user.editing }"
                            v-model="user.lastName" :disabled="!user.editing">
                    </td>
                    <td>
                        <input type="date" class="table-data" :class="{ 'editing-row': user.editing }"
                            v-model="user.dob" :disabled="!user.editing">
                    </td>
                    <td>
                        <input type="text" class="table-data" :class="{ 'editing-row': user.editing }"
                            v-model="user.mobile" :disabled="!user.editing">
                    </td>
                    <td>
                        <input type="text" class="table-data" :class="{ 'editing-row': user.editing }"
                            v-model="user.address" :disabled="!user.editing">
                    </td>
                    <td>
                        <button @click="editUser(index)" class="action-button edit-button"
                            v-if="!user.editing">Edit</button>
                        <button @click="validateAndUpdateUser(index)" class="action-button update-button"
                            v-if="user.editing">Update</button>
                        <button @click="deleteUser(index)" class="action-button delete-button">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
    name: 'Table',
    props: {
        users: Array,
        editUser: Function,
        updateUser: Function,
        deleteUser: Function
    },
    setup(props) {
        const { users, editUser, updateUser, deleteUser } = toRefs(props);

        const validateAndUpdateUser = (index) => {
            const user = users.value[index];

            const namePattern = /^[A-Za-z]+$/;
            if (!user.firstName || !namePattern.test(user.firstName)) {
                alert("First name should be a string and cannot be empty.");
                return;
            }
            if (!user.lastName || !namePattern.test(user.lastName)) {
                alert("Last name should be a string and cannot be empty.");
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            if (!user.dob || user.dob > today) {
                alert("Date of birth should be a valid date up to today.");
                return;
            }

            const mobilePattern = /^\d{10}$/;
            if (!user.mobile || !mobilePattern.test(user.mobile)) {
                alert("Mobile number should be exactly 10 digits.");
                return;
            }

            if (!user.address) {
                alert("Address cannot be empty.");
                return;
            }

            updateUser.value(index);
        };

        return {
            users,
            editUser,
            validateAndUpdateUser,
            deleteUser
        };
    }
});
</script>