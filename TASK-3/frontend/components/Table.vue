<template>
    <div class="table-container" v-if="users && users.length">
        <div class="search-bar">
            <input type="text" v-model="searchQuery" placeholder="Search..." @input="handleSearch" />
        </div>
        <table>
            <thead>
                <tr>
                    <th>
                        <div>First Name</div><button class="sort_button" @click="sortTable('firstName')">⇕</button>
                    </th>
                    <th>
                        <div>Last Name</div><button class="sort_button" @click="sortTable('lastName')">⇕</button>
                    </th>
                    <th>
                        <div>Birthday</div><button class="sort_button" @click="sortTable('dob')">⇕</button>
                    </th>
                    <th>
                        <div>Mobile</div> <button class="sort_button" @click="sortTable('mobile')">⇕</button>
                    </th>
                    <th>
                        <div>Address</div> <button class="sort_button" @click="sortTable('addr')">⇕</button>
                    </th>
                    <th>
                        <div>Actions</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-if="filteredUsers.length">
                    <tr v-for="(user, index) in filteredUsers" :key="user.idusers">
                        <td><input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                                v-model="user.firstName" :disabled="!user.editing" /></td>
                        <td><input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                                v-model="user.lastName" :disabled="!user.editing" /></td>
                        <td><input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                                v-model="user.dob" :disabled="!user.editing" /></td>
                        <td><input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                                v-model="user.mobile" :disabled="!user.editing" /></td>
                        <td><input class="table-data" :class="{ 'editing-row': user.editing }" type="text"
                                v-model="user.addr" :disabled="!user.editing" /></td>
                        <td>
                            <button @click="editUser(index)" v-if="!user.editing"
                                class="action-button edit-button">Edit</button>
                            <button @click="updateUser(index)" v-if="user.editing"
                                class="action-button update-button">Update</button>
                            <button @click="confirmDeleteUser(user.idusers, index)"
                                class="action-button delete-button">Delete</button>
                        </td>
                    </tr>
                </template>
                <tr v-else>
                    <td colspan="6" class="no-data">No data found!</td>
                </tr>
            </tbody>
        </table>
        <div class="table-controls">
            <div class="items-per-page">
                <label for="limit">Items per page:</label>
                <select id="limit" v-model="selectedLimit" @change="updateLimit">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>
            </div>
            <div class="table-counter">
                <p>Displaying {{ startIndex }} to {{ endIndex }} entries out of {{ count }}</p>
            </div>
        </div>
        <div class="pagination">
            <button @click="changePage(1)" :disabled="currentPage === 1">First</button>
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
            <button v-for="page in pagesToShow" :key="page" @click="changePage(page)"
                :class="{ 'active-page': page === currentPage }">{{ page }}</button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            <button @click="changePage(totalPages)" :disabled="currentPage === totalPages">Last</button>
        </div>
    </div>
    <div v-else>
        <p>No users available</p>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

export default {
    props: {
        users: Array,
        totalPages: Number,
        currentPage: Number,
        count: Number,
        startIndex: Number,
        endIndex: Number,
        localLimit: Number
    },
    setup(props, { emit }) {
        const searchQuery = ref('');
        const sortField = ref('idusers');
        const sortOrder = ref('desc');
        const selectedLimit = ref(props.localLimit);

        const fetchUsers = async (page = 1) => {
            try {
                const response = await axios.get('/api/users', {
                    params: {
                        searchTerm: searchQuery.value,
                        sortField: sortField.value,
                        sortOrder: sortOrder.value,
                        page: page,
                        limit: selectedLimit.value
                    }
                });
                if (response.data.success) {
                    emit('updateUsers', response.data.data);
                    emit('updatePagination', response.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const sortTable = (field) => {
            if (sortField.value === field) {
                sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
            } else {
                sortField.value = field;
                sortOrder.value = 'asc';
            }
            emit('changePage', 1);
            fetchUsers(1);
        };

        const handleSearch = () => {
            emit('changePage', 1);
            fetchUsers(1);
        };

        const changePage = (page) => {
            setTimeout(() => {
                emit('changePage', page);
                fetchUsers(page);
            }, 100);
        };

        const updateLimit = () => {
            emit('limitChanged', selectedLimit.value);
            fetchUsers(1);
        };

        const pagesToShow = computed(() => {
            const maxPagesToShow = 5;
            let startPage = Math.max(1, props.currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(props.totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        });

        watch([searchQuery, sortField, sortOrder, selectedLimit], () => {
            fetchUsers(1);
        });

        const editUser = (index) => {
            props.users[index].editing = true;
        };

        const updateUser = async (index) => {
            const user = props.users[index];

            try {
                const updateData = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    dob: user.dob,
                    mobile: user.mobile,
                    addr: user.addr
                };

                const response = await axios.put(`/api/users/${user.idusers}`, updateData);
                if (response.data.success) {
                    user.editing = false;
                    emit('updateUsers');
                    fetchUsers(props.currentPage);
                } else {
                    console.error('Failed to update user:', response.data.message);
                    alert('Failed to update user. Please try again later.');
                }
            } catch (error) {
                console.error('Error updating user:', error.response ? error.response.data : error.message);
                alert('Failed to update user. Please try again later.');
            }
        };

        const confirmDeleteUser = (userId, index) => {
            if (confirm('Are you sure you want to delete this user?')) {
                emit('deleteUser', userId, index);
            }
        };

        const filteredUsers = computed(() => {
            if (!searchQuery.value) return props.users;
            return props.users.filter(user =>
                user.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.dob.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.mobile.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.addr.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        return {
            searchQuery,
            sortField,
            sortOrder,
            selectedLimit,
            fetchUsers,
            sortTable,
            handleSearch,
            changePage,
            updateLimit,
            pagesToShow,
            editUser,
            updateUser,
            confirmDeleteUser,
            filteredUsers
        };
    }
};
</script>
