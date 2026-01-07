<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const text = "^_^ my internet site";
  const speed = 100;
  let i = 0;
  const element = document.querySelector(".typewriter");
  if (element) {
    element.innerHTML = "";
    function typeWriter() {
      if (i < text.length) {
        element!.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }
    typeWriter();
  }
});
</script>

<template>
  <div class="container">
    <header>
      <div class="profile-container">
        <!-- Images will be served from backend/static or public folder -->
        <img src="/mypfp.jpg" alt="profile picture" class="profile-img">
      </div>
      <h1>
        <span class="typewriter"></span><span class="blink">_</span>
      </h1>
    </header>

    <main>
      <hr>
      <nav>
        <router-link to="/about">about</router-link>
        <router-link to="/drawings">my drawings</router-link>
        <router-link to="/blog">my blog</router-link>
        <a href="/key.txt">my gpg key</a>
        <!-- <router-link to="/admin">login</router-link> -->
      </nav>
    </main>

    <footer>
      <p class="copyright">&copy; fractal 2026</p>
    </footer>
  </div>
</template>

<style scoped>
header {
  margin-bottom: 0.5rem;
}
h1 {
  margin-bottom: 0.5rem;
}
hr {
  margin: 1rem 0;
  border: 0;
  border-top: 1px solid var(--text-color);
  opacity: 0.3;
}
</style>
