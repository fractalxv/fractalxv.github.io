<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';

const route = useRoute();
const slug = route.params.slug as string;

interface BlogPost {
  title: string;
  date: string;
  slug: string;
  content: string;
}

const post = ref<BlogPost | null>(null);
const htmlContent = ref('');
const loading = ref(true);

onMounted(async () => {
  try {
    // In a real app we might fetch by slug specifically, but for now we fetch all and find one
    // Optimization: Add GET /api/blog/:slug endpoint later
    const res = await fetch('http://localhost:3000/api/blog');
    const posts = await res.json();
    const found = posts.find((p: BlogPost) => p.slug === slug);
    
    if (found) {
        post.value = found;
        htmlContent.value = await marked(found.content);
    }
  } catch (e) {
    console.error("Failed to load post", e);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
}
</script>

<template>
  <div class="container">
    <div v-if="loading">Loading...</div>
    <div v-if="post" class="blog-post-view">
        <header>
            <h1>{{ post.title }}</h1>
            <div class="post-meta">{{ formatDate(post.date) }}</div>
        </header>
        <hr>
        <div class="post-content" v-html="htmlContent"></div>
        
        <br>
        <hr>
        
        <div id="comments-section" style="margin-top: 2rem;">
            <h3>Comments</h3>
            <!-- Giscus placeholder - needs script injection mechanism in Vue or use a vue-giscus component -->
            <p style="font-size: 0.8rem; opacity: 0.7;">(Comments temporarily disabled during migration)</p>
        </div>

        <br>
        <router-link to="/blog">&lt;&lt; Back to List</router-link>
    </div>
    <div v-else-if="!loading">Post not found.</div>
  </div>
</template>

<style>
.blog-post-view {
    text-align: left;
    width: 100%;
}
.post-meta {
    font-size: 0.85rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
}
.post-content {
    font-size: 0.9rem;
    line-height: 1.8;
}
.post-content h1, .post-content h2, .post-content h3 {
    margin-top: 2rem;
}
.post-content code {
    background: #eee8d5; /* Solarized Base2 */
    padding: 2px 4px;
    border-radius: 4px;
    font-family: inherit;
}
.post-content pre {
    background: #eee8d5; /* Solarized Base2 */
    padding: 1rem;
    overflow-x: auto;
}
</style>
