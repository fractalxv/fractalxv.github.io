<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const isLoggedIn = ref(false);
const statusMsg = ref(''); // For showing success/error messages

// Helper to show status
const showStatus = (msg: string) => {
    statusMsg.value = msg;
    setTimeout(() => statusMsg.value = '', 3000);
};

// Manage Posts
interface Post {
    title: string;
    slug: string;
    date: string;
    content: string;
}

const posts = ref<Post[]>([]);
const isEditing = ref(false);
const editingSlug = ref('');
// Separate blog form refs
const blogTitle = ref('');
const blogContent = ref('');

// Manage Drawings
interface Drawing {
    id: number;
    src: string;
    caption: string;
}
const drawings = ref<Drawing[]>([]);

// Inline editing state for drawings
const editingDrawingId = ref<number | null>(null);
const editingCaptionText = ref('');

const fetchPosts = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/blog');
        posts.value = await res.json();
    } catch (e) {
        console.error("Failed to fetch posts", e);
        showStatus('Failed to fetch posts');
    }
};

const fetchDrawings = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/drawings');
        let data = await res.json();
        drawings.value = data.map((d: any) => ({
             ...d,
             src: d.src.startsWith('http') ? d.src : `http://localhost:3000/${d.src.startsWith('images/') ? d.src : 'images/' + d.src}`
        }));
    } catch (e) {
        console.error("Failed to fetch drawings", e);
        showStatus('Failed to fetch drawings');
    }
}

const login = async () => {
    if (username.value === 'myra' && password.value === 'myra') {
        isLoggedIn.value = true;
        await fetchPosts();
        await fetchDrawings();
    } else {
        alert('Invalid credentials'); // Keep alert for login only
    }
};

// --- Drawing Actions ---

const startEditCaption = (img: Drawing) => {
    editingDrawingId.value = img.id;
    editingCaptionText.value = img.caption;
};

const cancelEditCaption = () => {
    editingDrawingId.value = null;
    editingCaptionText.value = '';
};

const saveCaption = async (id: number) => {
    try {
        const res = await fetch(`http://localhost:3000/api/drawings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption: editingCaptionText.value })
        });
        if (res.ok) {
            showStatus('Caption updated');
            editingDrawingId.value = null; // Exit edit mode
            await fetchDrawings();
        } else {
            showStatus('Update failed');
        }
    } catch (e) {
        console.error(e);
        showStatus('Error updating');
    }
};

const deleteDrawing = async (id: number) => {
    try {
        const res = await fetch(`http://localhost:3000/api/drawings/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showStatus('Drawing deleted');
            await fetchDrawings();
        } else {
            showStatus('Delete failed');
        }
    } catch (e) {
        console.error(e);
        showStatus('Error deleting');
    }
};

// --- Post Actions ---

const editPost = (post: Post) => {
    isEditing.value = true;
    editingSlug.value = post.slug;
    blogTitle.value = post.title;
    blogContent.value = post.content;
    
    // Use scrollIntoView which is cleaner
    const form = document.querySelector('.blog-form-section');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
};

const cancelEdit = () => {
    isEditing.value = false;
    editingSlug.value = '';
    blogTitle.value = '';
    blogContent.value = '';
};

const deletePost = async (slug: string) => {
    try {
        const res = await fetch(`http://localhost:3000/api/blog/${slug}`, { method: 'DELETE' });
        if (res.ok) {
            showStatus('Post deleted');
            await fetchPosts();
        } else {
            showStatus('Delete failed');
        }
    } catch (e) {
        console.error(e);
        showStatus('Error deleting');
    }
};

const publishPost = async () => {
    if (!blogTitle.value || !blogContent.value) return showStatus('Fill title and content');
    
    const url = isEditing.value 
        ? `http://localhost:3000/api/blog/${editingSlug.value}` 
        : 'http://localhost:3000/api/blog';
        
    const method = isEditing.value ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: blogTitle.value,
                content: blogContent.value
            })
        });
        if (res.ok) {
            showStatus(isEditing.value ? 'Post updated!' : 'Post published!');
            cancelEdit();
            await fetchPosts();
        } else {
            showStatus('Operation failed');
        }
    } catch (e) {
        console.error(e);
        showStatus('Error saving post');
    }
};

// Upload
const caption = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const uploadDrawing = async () => {
    if (!fileInput.value?.files?.length) return showStatus('Select a file');
    
    const formData = new FormData();
    formData.append('image', fileInput.value.files[0]);
    formData.append('caption', caption.value);

    try {
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            showStatus('Upload success');
            caption.value = '';
            if (fileInput.value) fileInput.value.value = '';
            await fetchDrawings();
        } else {
            showStatus('Upload failed');
        }
    } catch (e) {
        console.error(e);
        showStatus('Error uploading');
    }
};
</script>

<template>
  <div class="container" style="max-width: 900px;">
      <header>
          <h1>Admin Panel</h1>
      </header>
      
      <!-- Status Toast -->
      <div v-if="statusMsg" class="status-msg">
          {{ statusMsg }}
      </div>

      <main>
          <div v-if="!isLoggedIn" class="login-form">
              <input v-model="username" placeholder="Username" />
              <input v-model="password" type="password" placeholder="Password" />
              <button @click="login">Login</button>
          </div>
          
          <div v-else class="admin-dashboard">
              <p>Welcome, {{ username }}</p>
              <hr>

              <!-- Manage Drawings Section -->
              <div class="admin-section">
                  <h3>Manage Drawings</h3>
                  <div class="admin-gallery-grid" v-if="drawings.length">
                      <div v-for="img in drawings" :key="img.id" class="admin-gallery-item">
                          <img :src="img.src" class="admin-thumb" />
                          
                          <div class="admin-gallery-actions">
                              <!-- Inline Editing Logic -->
                              <div v-if="editingDrawingId === img.id" class="inline-edit">
                                  <input v-model="editingCaptionText" class="caption-input" />
                                  <div class="btn-row">
                                      <button class="small-btn save" @click="saveCaption(img.id)">Save</button>
                                      <button class="small-btn cancel" @click="cancelEditCaption">X</button>
                                  </div>
                              </div>
                              <div v-else>
                                  <div class="caption-text">{{ img.caption || 'No caption' }}</div>
                                  <div class="btn-row">
                                    <button class="small-btn" @click="startEditCaption(img)">Edit</button>
                                    <button class="small-btn delete" @click="deleteDrawing(img.id)">Del</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <p v-else>No drawings found.</p>
              </div>

              <hr>
              
              <div class="admin-section">
                  <h3>Manage Posts</h3>
                  <div class="post-list-container">
                    <table class="post-list" v-if="posts.length">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Title</th>
                                <th style="width: 150px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="post in posts" :key="post.slug">
                                <td>{{ post.title }}</td>
                                <td>
                                    <button class="small-btn" @click="editPost(post)">Edit</button>
                                    <button class="small-btn delete" @click="deletePost(post.slug)">Del</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else>No posts found.</p>
                  </div>
              </div>

              <hr>
              
              <div class="admin-section">
                  <h3>Upload Drawing</h3>
                  <input type="file" ref="fileInput" accept="image/*" />
                  <input v-model="caption" placeholder="Caption" />
                  <button @click="uploadDrawing">Upload</button>
              </div>

              <hr>

              <div class="admin-section blog-form-section">
                  <h3>{{ isEditing ? 'Edit Blog Post' : 'Write Blog Post' }}</h3>
                  <input v-model="blogTitle" placeholder="Title" />
                  <textarea v-model="blogContent" placeholder="Markdown Content" rows="10"></textarea>
                  <div class="form-actions">
                      <button @click="publishPost">{{ isEditing ? 'Update' : 'Publish' }}</button>
                      <button v-if="isEditing" @click="cancelEdit" style="background: #ccc; color: black;">Cancel</button>
                  </div>
              </div>
          </div>
      </main>
      
      <br>
      <nav>
          <router-link to="/">Home</router-link>
      </nav>
  </div>
</template>

<style scoped>
.login-form input, .admin-section input, .admin-section textarea {
    display: block;
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    font-family: inherit;
    border: 1px solid var(--text-color);
}
.admin-section {
    margin: 2rem 0;
    text-align: left;
}
.post-list {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}
.post-list td, .post-list th {
    border-bottom: 1px dashed #ccc;
    padding: 8px;
}
button {
    padding: 8px 16px;
    font-family: inherit;
    background: var(--text-color);
    color: var(--bg-color);
    border: none;
    cursor: pointer;
    margin-right: 10px;
}
button:hover {
    background: var(--accent-color);
}
.admin-gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}
.admin-gallery-item {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
    text-align: center;
}
.admin-thumb {
    width: 100%;
    height: 100px;
    object-fit: cover;
    margin-bottom: 5px;
}
.admin-gallery-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.small-btn {
    padding: 4px 8px;
    font-size: 0.8rem;
}
.delete:hover {
    background: red;
}
.status-msg {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-color);
    color: var(--bg-color);
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s;
}
.caption-input {
    width: 100%;
    margin-bottom: 5px;
    padding: 4px;
}
.caption-text {
    font-size: 0.8rem;
    margin-bottom: 5px;
    min-height: 1.2em;
}
.btn-row {
    display: flex;
    justify-content: center;
    gap: 5px;
}
.save {
    background: var(--accent-color);
    color: white;
}
.cancel {
    background: #ccc;
    color: black;
}
</style>
