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
                <tr v-for="(user, index) in users" :key="user.idusers">
                    <td>
                        <input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                            v-model="user.firstName" :disabled="!user.editing" />
                    </td>
                    <td>
                        <input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                            v-model="user.lastName" :disabled="!user.editing" />
                    </td>
                    <td>
                        <input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                            v-model="user.dob" :disabled="!user.editing" />
                    </td>
                    <td>
                        <input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                            v-model="user.mobile" :disabled="!user.editing" />
                    </td>
                    <td>
                        <input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                            v-model="user.addr" :disabled="!user.editing" />
                    </td>
                    <td>
                        <button @click="editUser(index)" v-if="!user.editing" class="action-button edit-button">
                            Edit
                        </button>
                        <button @click="updateUser(index)" v-if="user.editing" class="action-button update-button">
                            Update
                        </button>
                        <button @click="confirmDeleteUser(index)" class="action-button delete-button">
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Table',
    props: ['users'],
    setup(props, { emit }) {
        const editUser = (index) => {
            props.users[index].editing = true;
        };

        const validateUser = (user) => {
            if (!user.firstName || !user.lastName || !user.dob || !user.mobile || !user.addr) {
                alert('All fields must be filled out.');
                return false;
            }
            if (!/^\d{10}$/.test(user.mobile)) {
                alert('Mobile number must be exactly 10 digits.');
                return false;
            }
            const datePattern = /^\d{2}-\d{2}-\d{4}$/;
            if (!datePattern.test(user.dob)) {
                alert('Date of birth must be in the format dd-mm-yyyy.');
                return false;
            } else {
                const [day, month, year] = user.dob.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                if (dateObj.getFullYear() !== year || dateObj.getMonth() + 1 !== month || dateObj.getDate() !== day) {
                    alert('Invalid date. Please check the day, month, and year.');
                    return false;
                } else if (dateObj > new Date()) {
                    alert('Date of birth cannot be in the future.');
                    return false;
                }
            }
            return true;
        };


        const updateUser = async (index) => {
            const user = props.users[index];
            if (!validateUser(user)) {
                return;
            }

            try {
                const updateData = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    dob: user.dob,
                    mobile: user.mobile,
                    addr: user.addr
                };

                await axios.put(`/api/users/${user.idusers}`, updateData);
                user.editing = false;
                emit('updateUsers');

            } catch (error) {
                console.error('Error updating user:', error);
                alert('Failed to update user. Please try again later.');
            }
        };

        const confirmDeleteUser = (index) => {
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(index);
            }
        };

        const deleteUser = async (index) => {
            try {
                const user = props.users[index];
                await axios.delete(`/api/users/${user.idusers}`);
                props.users.splice(index, 1);
                emit('updateUsers');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again later.');
            }
        };

        return { editUser, updateUser, confirmDeleteUser, deleteUser };
    }
};
</script>
