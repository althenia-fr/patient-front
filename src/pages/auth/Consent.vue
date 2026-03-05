<script setup lang="ts"></script>
<template>
  <section class="mx-auto max-w-md px-4 py-8">
    <h2 class="mb-2 text-center text-2xl font-extrabold">Consentement des données</h2>
    <p class="mb-4 text-center text-sm text-gray-600">RGPD, HDS et cadre juridique</p>
    <div class="card">
      <p class="text-sm text-gray-700">En cochant cette case, j’autorise l’utilisation de mes données conformément aux réglementations en vigueur.</p>
      <label class="mt-3 flex items-center gap-3 text-sm">
        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-brand-primary" required />
        <span>J’accepte</span>
      </label>
    </div>
    <button class="btn-primary mt-4 w-full">Continuer</button>
  </section>
</template>
