<template>
  <div class="app-container">
    <nav class="main-nav">
      <div class="nav-brand">ColorMaster</div>
      <div class="nav-links">
        <router-link to="/">Генератор</router-link>
        <router-link to="/library">Библиотека</router-link>
      </div>
    </nav>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Глобальные сбросы и шрифты */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: #2c3e50;
}

.main-nav {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand { font-weight: bold; font-size: 1.2rem; }

.nav-links a {
  color: #ccc;
  text-decoration: none;
  margin-left: 20px;
  transition: color 0.3s;
}

.nav-links a.router-link-active {
  color: white;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>