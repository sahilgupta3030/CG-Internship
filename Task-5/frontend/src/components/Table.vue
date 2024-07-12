<template>
    <div class="table-container" v-if="users">
        <div class="search-bar">
            <input type="text" v-model="searchQuery" placeholder="Search..." @input="handleSearch" />
        </div>
        <table>
            <thead>
                <tr>
                    <th>
                        First Name <button class="SortButton" @click="sortTable('firstName')">⇕</button>
                    </th>
                    <th>
                        Last Name <button class="SortButton" @click="sortTable('lastName')">⇕</button>
                    </th>
                    <th>
                        Birthday <button class="SortButton" @click="sortTable('dob')">⇕</button>
                    </th>
                    <th>
                        Mobile <button class="SortButton" @click="sortTable('mobile')">⇕</button>
                    </th>
                    <th>
                        Address <button class="SortButton" @click="sortTable('addr')">⇕</button>
                    </th>
                    <th>
                        <div>Actions</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Table rows -->
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
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent } from 'vue';
import axios from 'axios';

interface User {
    idusers: number;
    firstName: string;
    lastName: string;
    dob: string;
    mobile: string;
    addr: string;
    editing?: boolean;
}

interface Pagination {
    totalPages: number;
    currentPage: number;
    count: number;
    startIndex: number;
    endIndex: number;
}

export default defineComponent({
    props: {
        users: {
            type: Array as () => User[],
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        },
        currentPage: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
        startIndex: {
            type: Number,
            required: true
        },
        endIndex: {
            type: Number,
            required: true
        },
        localLimit: {
            type: Number,
            required: true
        }
    },
    setup(props, { emit }) {
        const searchQuery = ref('');
        const sortField = ref<string>('idusers');
        const sortOrder = ref<'asc' | 'desc'>('desc');
        const selectedLimit = ref<number>(props.localLimit);

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
                    emit('updatePagination', response.data.pagination); // Emitting updated pagination
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const sortTable = (field: string) => {
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

        const changePage = (page: number) => {
            emit('changePage', page);
            fetchUsers(page);
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

            const pages: number[] = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        });

        const editUser = (index: number) => {
            props.users[index].editing = true;
        };

        const updateUser = async (index: number) => {
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
                console.error('Error updating user:', error);
                alert('Failed to update user. Please try again later.');
            }
        };

        const confirmDeleteUser = (userId: number, index: number) => {
            if (confirm('Are you sure you want to delete this user?')) {
                emit('deleteUser', userId, index);
            }
        };

        const filteredUsers = computed(() => {
            if (!searchQuery.value) return props.users;
            const query = searchQuery.value.toLowerCase();
            return props.users.filter(user =>
                user.firstName.toLowerCase().includes(query) ||
                user.lastName.toLowerCase().includes(query) ||
                user.dob.toLowerCase().includes(query) ||
                user.mobile.toLowerCase().includes(query) ||
                user.addr.toLowerCase().includes(query)
            );
        });


        watch(searchQuery, () => {
            fetchUsers(1); 
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
});
</script>