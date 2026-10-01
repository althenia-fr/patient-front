<script setup
        lang="ts">

import {onMounted, ref} from "vue";

const activeTab = ref('ios');
const activeBrowser = ref('safari');

const baseTabClasses = 'flex-1 py-3 px-6 rounded-lg font-medium text-center transition-all duration-200 flex items-center justify-center gap-2';
const activeClasses = 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5';
const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50';

onMounted(() => {
  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent || '';

  // ─────────────────────────────────────────────
  // OS
  // ─────────────────────────────────────────────

  const isAndroid = /Android/i.test(ua);

  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (
      navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1
    );

  // ─────────────────────────────────────────────
  // Navigateurs
  // ─────────────────────────────────────────────

  const isChrome =
    /Chrome|CriOS/i.test(ua) &&
    !/Edg|OPR|SamsungBrowser/i.test(ua);

  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|CriOS|Android|FxiOS|EdgiOS|OPiOS/i.test(ua);

  // ─────────────────────────────────────────────
  // Détection
  // ─────────────────────────────────────────────

  if (isAndroid) {

    activeTab.value = 'android';

    if (isChrome) {
      activeBrowser.value = 'chrome';
    }

  } else if (isIOS) {

    activeTab.value = 'ios';

    if (isChrome) {
      activeBrowser.value = 'chrome';
    } else if (isSafari) {
      activeBrowser.value = 'safari';
    }
  }
});

</script>

<template>

  <header class="bg-white border-b border-gray-200 py-10 px-4 mb-8">
    <div class="max-w-3xl mx-auto text-center">
      <div class="inline-flex items-center justify-center mb-4">
        <img src="/stimeoplus_logo.png"
             width="200px"/>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        Installer l'application sur votre smartphone
      </h1>
      <p class="text-gray-600 text-lg max-w-xl mx-auto">
        Ajoutez un raccourci directement sur votre écran d'accueil pour y accéder rapidement en un
        clic.
      </p>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 pb-20 bg-white">
    <!-- Tab Controls OS -->
    <div class="flex flex-col sm:flex-row p-1 bg-gray-200/60 rounded-xl mb-8 shadow-sm border">
      <button
        @click="activeTab = 'ios'"
        :class="[baseTabClasses, activeTab === 'ios' ? activeClasses : inactiveClasses]">
        <i class="fa-brands fa-apple text-xl"></i> iPhone / iPad (iOS)
      </button>
      <button
        @click="activeTab = 'android'"
        :class="[baseTabClasses, activeTab === 'android' ? activeClasses : inactiveClasses]">
        <i class="fa-brands fa-android text-xl text-green-500"></i> Android
      </button>
    </div>

    <!-- iOS Section -->
    <div v-if="activeTab === 'ios'"
         class="fade-in">
      <div
        class="bg-white rounded-2xl border border-gray-100 relative overflow-hidden transition-all duration-300"
        :class="activeBrowser === 'safari' ? 'shadow-[-8px_0_15px_-3px_rgba(59,130,246,0.25)]' : 'shadow-[-8px_0_15px_-3px_rgba(34,197,94,0.25)]'"
      >

        <!-- Bande latérale dynamique (Bleu pour Safari / Vert pour Chrome) -->
        <div
          class="absolute top-0 left-0 w-1 h-full transition-colors duration-300"
          :class="activeBrowser === 'safari' ? 'bg-blue-500' : 'bg-green-500'"
        ></div>

        <div class="p-6 md:p-8">
          <!-- En-têtes / Sélecteurs de navigateur -->
          <div class="flex flex-row border-b border-gray-100 mb-6">

            <!-- Partie Gauche : Safari -->
            <div
              @click="activeBrowser = 'safari'"
              class="w-1/2 flex items-start sm:items-center gap-3 pb-4 border-b-2 cursor-pointer transition-all duration-200 pr-2"
              :class="activeBrowser === 'safari' ? 'border-blue-500 opacity-100' : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0'"
            >
              <div class="bg-blue-50 p-2 sm:p-3 rounded-lg text-blue-500 shrink-0">
                <img src="/safari.png"
                     class="w-8 sm:w-[40px]"
                     alt="Safari"/>
              </div>
              <div>
                <h2 class="text-base sm:text-xl font-bold text-gray-900 leading-tight">Avec
                  Safari</h2>
                <p class="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">Navigateur par
                  défaut sur iPhone et iPad</p>
                <p class="text-xs text-gray-500 mt-0.5 sm:hidden">Par défaut</p>
              </div>
            </div>

            <!-- Partie Droite : Chrome -->
            <div
              @click="activeBrowser = 'chrome'"
              class="w-1/2 flex items-start sm:items-center gap-3 pb-4 border-b-2 cursor-pointer transition-all duration-200 pl-2 sm:pl-4"
              :class="activeBrowser === 'chrome' ? 'border-green-500 opacity-100 border-l-0' : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0 border-l border-gray-100'"
            >
              <div class="p-2 sm:p-3 rounded-lg text-green-600 shrink-0"
                   :class="activeBrowser === 'chrome' ? 'bg-green-50' : 'bg-gray-50'">
                <img src="/chrome.png"
                     class="w-8 sm:w-[40px]"
                     alt="Chrome"/>
              </div>
              <div>
                <h2 class="text-base sm:text-xl font-bold text-gray-900 leading-tight">Avec
                  Chrome</h2>
                <p class="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">Pour les
                  utilisateurs de Chrome sur iOS</p>
                <p class="text-xs text-gray-500 mt-0.5 sm:hidden">Alternative</p>
              </div>
            </div>
          </div>

          <!-- Instructions Safari (Puces Bleues) -->
          <ol v-if="activeBrowser === 'safari'"
              class="space-y-4 text-gray-700 fade-in">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
              <p>Ouvrez la page web depuis le navigateur <strong>Safari</strong>.</p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
              <p>
                Appuyez sur l'icône <strong>Partager</strong> <img style="display: inline"
                                                                   src="//storage.googleapis.com/support-kms-prod/Oi0DNDXtcV89telFhTPd7Okn7yoTpSfkX19z"
                                                                   width="25"
                                                                   height="25"
                                                                   alt=""
                                                                   data-mime-type="image/svg+xml">
                située dans la barre d'adresse, à droite.
                <img src="/chrome1.png"
                     style="height: 30px; display: inline-block; margin-left: 5px;"/>
              </p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
              <p>Faites défiler le menu vers le bas et sélectionnez <strong>Sur l'écran
                d'accueil</strong>
                <i class="fa-regular fa-square-plus mx-1 text-gray-500 bg-gray-100 p-1.5 rounded text-sm"></i>.
              </p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mt-0.5">4</span>
              <p>Appuyez sur <strong>Ajouter</strong> en haut à droite de l'écran pour confirmer.
              </p>
            </li>
          </ol>

          <!-- Instructions Chrome (Puces Vertes) -->
          <ol v-if="activeBrowser === 'chrome'"
              class="space-y-4 text-gray-700 fade-in">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
              <p>Ouvrez la page web depuis l'application <strong>Google Chrome</strong>.</p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
              <p>
                Appuyez sur l'icône <strong>Partager</strong> <img style="display: inline"
                                                                   src="//storage.googleapis.com/support-kms-prod/Oi0DNDXtcV89telFhTPd7Okn7yoTpSfkX19z"
                                                                   width="25"
                                                                   height="25"
                                                                   alt=""
                                                                   data-mime-type="image/svg+xml">
                située dans la barre d'adresse, à droite.
                <img src="/chrome1.png"
                     style="height: 30px; display: inline-block; margin-left: 5px;"/>
              </p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
              <p>Faites défiler le menu et sélectionnez l'option <strong>Sur l'écran
                d'accueil</strong>
                <i class="fa-regular fa-square-plus mx-1 text-gray-500 bg-gray-100 p-1.5 rounded text-sm"></i>.
              </p>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">4</span>
              <p>Appuyez sur <strong>Ajouter</strong>.</p>
            </li>
          </ol>

          <!-- Message final -->
          <div class="mt-6 bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl flex gap-3 items-start border border-yellow-100">
            <img src="/pwa-192x192.png"
                 class="w-16 h-16 mt-0.5 shrink-0"
                 alt="Icône Stimeo+"/>
            <p class="mt-2">L'icône Stimeo+ est maintenant installée sur votre écran d'accueil.
              Cliquez dessus pour continuer avec l'App.</p>
          </div>

        </div>
      </div>
    </div>

    <!-- Android Section -->
    <div v-if="activeTab === 'android'"
         class="fade-in space-y-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 relative overflow-hidden shadow-[-8px_0_15px_-3px_rgba(34,197,94,0.25)]">
        <div class="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
        <div class="flex items-center gap-4 mb-5 border-b border-gray-100 pb-4">
          <div class="bg-green-50 p-3 rounded-lg text-green-600">
            <img src="/chrome.png"
                 width="40px"/>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Avec Google Chrome</h2>
            <p class="text-sm text-gray-500">Méthode recommandée sur les smartphones Android</p>
          </div>
        </div>

        <ol class="space-y-4 text-gray-700">
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
            <p>Ouvrez la page web depuis le navigateur <strong>Google Chrome</strong>.</p>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
            <p>Appuyez sur le menu représentant <strong>trois points verticaux</strong>
              <i class="fa-solid fa-ellipsis-vertical mx-1 text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm"></i>
              situé en haut à droite de l'écran.</p>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
            <p>Dans le menu déroulant, sélectionnez l'option <strong>Installer et créer un
              raccourci</strong> (ou <strong>Ajouter à l'écran d'accueil</strong> sur les versions
              plus anciennes).</p>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5">4</span>
            <p>Une fenêtre de confirmation apparaît. Appuyez sur <strong>Installer</strong> ou
              <strong>Ajouter</strong>.</p>
          </li>
        </ol>

        <div class="mt-6 bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl flex gap-3 items-start border border-yellow-100">
          <img src="/pwa-192x192.png"
               class="w-16 h-16 mt-0.5 shrink-0"
               alt="Icône Stimeo+"/>
          <p class="mt-2">L'icône Stimeo+ est maintenant installée sur votre écran d'accueil.
            Cliquez dessus pour continuer avec l'App.</p>
        </div>
      </div>
    </div>

  </main>

</template>

<style scoped>

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
