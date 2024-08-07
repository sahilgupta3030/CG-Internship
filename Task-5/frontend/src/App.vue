<template>
  <div id="app">
    <h2 class="heading">CRUD</h2>
    <div class="container">
      <Form @addUser="addUser" />
      <Table :users="users" :totalPages="totalPages" :currentPage="currentPage" :count="count" :startIndex="startIndex"
        :endIndex="endIndex" :localLimit="limit" @changePage="handlePageChange" @limitChanged="handleLimitChange"
        @updatePagination="handlePaginationUpdate" @updateUsers="updateUsers" @deleteUser="deleteUser" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import Form from './components/Form.vue';
import Table from './components/Table.vue';
import axios from 'axios';
import './style.css';

interface User {
  idusers: number;
  firstName: string;
  lastName: string;
  dob: string;
  mobile: string;
  addr: string;
  editing?: boolean;
}

export default defineComponent({
  name: 'App',
  components: {
    Form,
    Table,
  },
  setup() {
    const users = ref<User[]>([]);
    const totalPages = ref<number>(1);
    const currentPage = ref<number>(1);
    const count = ref<number>(0);
    const limit = ref<number>(5);

    const fetchUsers = async (page: number = 1) => {
      try {
        const response = await axios.get<{ success: boolean, data: User[], pagination: { totalPages: number, totalItems: number } }>('/api/users', {
          params: {
            page: page,
            limit: limit.value,
            searchTerm: '',
            sortField: 'idusers',
            sortOrder: 'desc'
          }
        });
        if (response.data.success) {
          users.value = response.data.data;
          totalPages.value = response.data.pagination.totalPages;
          count.value = response.data.pagination.totalItems;
        }
      } catch (error) {
        console.error('Error fetching users.');
      }
    };

    const handlePageChange = (page: number) => {
      currentPage.value = page;
      fetchUsers(page);
    };

    const handleLimitChange = (newLimit: number) => {
      limit.value = newLimit;
      currentPage.value = 1;
      fetchUsers(1);
    };

    const handlePaginationUpdate = (pagination: { totalPages: number, totalItems: number }) => {
      totalPages.value = pagination.totalPages;
      count.value = pagination.totalItems;
    };

    const updateUsers = (data: User[]) => {
      users.value = data;
    };

    const deleteUser = async (userId: number, index: number) => {
      try {
        await axios.delete(`/api/users/${userId}`);
        users.value.splice(index, 1);
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again later.');
      }
    };

    const addUser = () => {
      fetchUsers(currentPage.value);
    };

    const startIndex = computed(() => (currentPage.value - 1) * limit.value + 1);
    const endIndex = computed(() => Math.min(currentPage.value * limit.value, count.value));

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      totalPages,
      currentPage,
      count,
      limit,
      startIndex,
      endIndex,
      fetchUsers,
      handlePageChange,
      handleLimitChange,
      handlePaginationUpdate,
      updateUsers,
      deleteUser,
      addUser,
    };
  },
});
</script>



