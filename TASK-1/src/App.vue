<template>
    <div id="app">
        <h2 class="heading">CRUD</h2>
        <div class="container">
            <Form :addUser="addUser" />
            <Table :users="users" :editUser="editUser" :updateUser="updateUser" :deleteUser="deleteUser" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Form from '../components/Form.vue';
import Table from '../components/Table.vue';
import './style.css';

export default {
    name: 'App',
    components: {
        Form,
        Table
    },
    setup() {
        const newUser = ref({
            firstName: '',
            lastName: '',
            dob: '',
            mobile: '',
            address: ''
        });

        const users = ref([]);
        let editingIndex = null;

        const loadUsers = () => {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                users.value = JSON.parse(storedUsers).map(user => ({ ...user, editing: false }));
            }
        };

        const saveUsers = () => {
            localStorage.setItem('users', JSON.stringify(users.value.map(user => ({ ...user, editing: false }))));
        };

        const addUser = (user) => {
            users.value.push({ ...user, editing: false });
            saveUsers();
        };

        const updateUser = (index) => {
            users.value[index].editing = false;
            saveUsers();
        };

        const deleteUser = (index) => {
            const isConfirmed = confirm("Are you sure you want to delete this user?");

            if (isConfirmed) {
                users.value.splice(index, 1);
                saveUsers();
            }
        };


        const editUser = (index) => {
            users.value.forEach((user, i) => {
                if (i === index) {
                    user.editing = true;
                } else {
                    user.editing = false;
                }
            });
            editingIndex = index;
        };

        onMounted(() => {
            loadUsers();
        });

        return { newUser, users, addUser, editUser, updateUser, deleteUser };
    }
};
</script>
