<!-- <template>
    <v-container class="pt-10">
        <v-form @submit.prevent="sendUsername" method="POST"> 
            <v-text-field
                v-model="nameForm.name"
                name="name"
                label="Name"
            ></v-text-field>
            <v-btn type="submit">login</v-btn>
        </v-form>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import type { Channel, friendRelation, User, Message } from './chat_utilsMethods';

    export default defineComponent ({
        name: "chat_BetaloginForm",
        data() {
            return {
                nameForm: {
                    name: "",
                },
            }
        },
        methods: {
        async sendUsername() {
            const reponse = await axios.post('/api/chat/setUsername', {
                username: this.nameForm.name,
            });
            console.log("reponse", reponse.data)
            this.$emit('user-loged', reponse)
        },
    }
})
</script> -->