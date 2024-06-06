<template>
    <div id="app">
        <h2 class="heading">CRUD</h2>
        <div class="container">
            <Form @addUser="addUser" />
            <Table :users="users" @updateUsers="fetchUsers" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Form from '../components/Form.vue';
import Table from '../components/Table.vue';
import axios from 'axios';
import './style.css';

export default {
    name: 'App',
    components: {
        Form,
        Table
    },
    setup() {
        const users = ref([]);

        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                users.value = response.data;
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const addUser = (newUser) => {
            users.value.push(newUser);
            fetchUsers();
        };

        onMounted(() => {
            fetchUsers();
        });

        return { users, fetchUsers, addUser };
    }
};
</script>
