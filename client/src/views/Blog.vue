<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface BlogPost {
  title: string;
  date: string;
  slug: string; // filename without extension
  content: string; // Raw markdown or html
}

const posts = ref<BlogPost[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/blog');
    posts.value = await res.json();
    loading.value = false;
  } catch (e) {
    console.error("Failed to fetch blog posts", e);
    loading.value = false;
  }
});

// Simple formatter
const formatDate = (dateStr: string) => {
  // Cleaner date format: YYYY-MM-DD
  return new Date(dateStr).toISOString().split('T')[0];
}
</script>

<template>
  <div class="container blog-container">
    <header class="blog-header">
      <h1 class="blog-main-title">fractal-logs</h1>
      
      <nav class="blog-nav">
        <span class="nav-deco">*w*</span>
        <router-link to="/">home</router-link>
        <router-link to="/drawings">drawings</router-link>
        <router-link to="/about">about</router-link>
        <span class="nav-deco">*w*</span>
      </nav>
      
      <div class="separator"></div>
    </header>

    <main class="blog-main">
      <div v-if="loading">Loading...</div>
      <div v-else class="blog-list">
        <div v-for="post in posts" :key="post.slug" class="blog-item">
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <router-link :to="'/blog/' + post.slug" class="post-link">{{ post.title }}</router-link>
        </div>
      </div>
    </main>
    
    <footer class="blog-footer">
       <div class="separator"></div>
       <br>
       <p class="copyright">Powered by Fractal (•̀ᴗ•́)و ̑̑</p>
    </footer>
  </div>
</template>

<style scoped>
.blog-container {
  width: 100%;
  max-width: 900px;
  text-align: left;
  align-items: flex-start; /* Left align everything */
}

.blog-header {
  width: 100%;
  margin-bottom: 2rem;
}

.blog-main-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.blog-nav {
  display: flex;
  gap: 1.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.blog-nav a {
  text-decoration: underline;
  text-decoration-color: var(--accent-color);
  text-decoration-thickness: 2px;
  border: none; /* Remove global border style */
}

/* Reference style decorations */
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

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.post-date {
  font-family: monospace; /* Keep date monospace for alignment */
  opacity: 0.7;
  font-size: 0.95rem;
  min-width: 100px;
}

.post-link {
  font-weight: normal;
  border-bottom: 2px solid var(--accent-color) !important; /* Solid underline like reference */
  padding-bottom: 0;
}

.post-link:hover {
  background: var(--accent-color);
  color: var(--bg-color);
}

.blog-footer {
  width: 100%;
  text-align: center;
  margin-top: 3rem;
  font-size: 0.9rem;
}
</style>
