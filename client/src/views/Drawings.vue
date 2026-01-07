<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Drawing {
  id: number;
  src: string;
  caption: string;
  date: string;
}

const drawings = ref<Drawing[]>([]);
const selectedImage = ref<Drawing | null>(null);

onMounted(async () => {
  try {
    // In dev, we might need a proxy or full URL. Assuming proxy or running on same port not yet set.
    // Let's use full URL for now assuming server is on 3000.
    const res = await fetch('http://localhost:3000/api/drawings');
    const data = await res.json();
    // Fix paths: stored as "images/..." in JSON, but we serve them at root of static serve or /images/
    // The server maps '/images' to the static folder.
    // If JSON says "images/foo.png", and we serve static folder at /images, then url is /images/foo.png
    // if JSON says "foo.png", url is /images/foo.png
    drawings.value = data.map((d: any) => ({
      ...d,
      // Simple heuristic: if it doesn't start with http, prepend server url + images path if needed
      // Our previous data had 'images/...' or just filenames.
      // Let's assume server serves images at http://localhost:3000/images/
      src: d.src.startsWith('http') ? d.src : `http://localhost:3000/${d.src.startsWith('images/') ? d.src : 'images/' + d.src}`
    }));
  } catch (e) {
    console.error("Failed to load drawings", e);
  }
});

const openLightbox = (img: Drawing) => {
  selectedImage.value = img;
};

const closeLightbox = () => {
  selectedImage.value = null;
};
</script>

<template>
  <div class="container menu-container">
    <header class="menu-header">
      <h1 class="menu-main-title">my drawings</h1>
      
      <nav class="menu-nav">
        <span class="nav-deco">*w*</span>
        <router-link to="/">home</router-link>
        <router-link to="/drawings">drawings</router-link>
        <router-link to="/about">about</router-link>
        <span class="nav-deco">*w*</span>
      </nav>
      
      <div class="separator"></div>
    </header>

    <div class="gallery-grid">
      <div v-for="img in drawings" :key="img.id" class="gallery-item" @click="openLightbox(img)">
        <img :src="img.src" :alt="img.caption" loading="lazy" />
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="selectedImage" class="modal" style="display: block;" @click="closeLightbox">
      <span class="close" @click="closeLightbox">&times;</span>
      <img class="modal-content" :src="selectedImage.src" @click.stop />
      <div id="caption" @click.stop>{{ selectedImage.caption }}</div>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  width: 100%;
  max-width: 900px; /* Match blog width */
  text-align: left;
  align-items: flex-start;
  justify-content: flex-start; /* Override global center alignment */
  padding-top: 4rem; /* Add breathing room at top */
}

.menu-header {
  width: 100%;
  margin-bottom: 2rem;
}

.menu-main-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.menu-nav {
  display: flex;
  gap: 1.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.menu-nav a {
  text-decoration: underline;
  text-decoration-color: var(--accent-color);
  text-decoration-thickness: 2px;
  border: none; 
}

.nav-deco {
  color: var(--accent-color);
  font-weight: bold;
}

.separator {
  width: 100%;
  border-bottom: 2px dashed var(--text-color);
  opacity: 0.5;
  margin: 1.5rem 0;
}
</style>
