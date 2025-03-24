<template>
  <div class="">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Profile</h1>

    <!-- Profile Info -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Profile Details -->
          <div class="flex-1 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label>Username</Label>
                <Input v-model="editedUser.username" type="text" />
              </div>
              <div class="space-y-2">
                <Label>Full Name</Label>
                <Input v-model="editedUser.fullName" type="text" />
              </div>
            </div>

            <div class="space-y-2">
              <Label>Description <i>(Markdown supported)</i></Label>
              <Textarea v-model="editedUser.description" rows="3" />
            </div>

            <div class="space-y-2">
              <Label>Profile picture URL</Label>
              <Input v-model="editedUser.profilePictureUrl" type="text" />
            </div>

            <div class="space-y-2">
              <Label>Banner picture URL</Label>
              <Input v-model="editedUser.bannerUrl" type="text" />
            </div>

            <!-- Theme Customization -->
            <div class="space-y-2 flex gap-4">
              <div class="">
                <Label>Background Color</Label>
                <Input v-model="editedUser.backgroundColor" type="color" class="h-10 w-16" />
              </div>
              <div class="">
                <Label>Text Color</Label>
                <Input v-model="editedUser.textColor" type="color" class="h-10 w-16" />
              </div>
            </div>
          </div>
        </div>
        <Button class="w-full mt-3" @click="saveChanges">Save Changes</Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useToast } from "vue-toastification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UpdateUserDto } from "@/api";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const toast = useToast();
const router = useRouter();

const editedUser = ref<UpdateUserDto>({});

const user = computed(() => userStore.currentUser);

onMounted(async () => {
  try {
    await userStore.fetchProfile();

    if (user.value) {
      editedUser.value = {
        username: user.value.username,
        fullName: user.value.fullName || "",
        description: user.value.description || "",
        backgroundColor: user.value.backgroundColor,
        textColor: user.value.textColor,
      };
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to load profile data");
  }
});

const saveChanges = async () => {
  try {
    await userStore.updateProfile(editedUser.value);
    toast.success("Profile updated successfully");
    await userStore.fetchProfile(); // Refresh profile data
    router.push("/user");
  } catch (error: any) {
    toast.error(error.message || "Failed to update profile");
  }
};
</script>
