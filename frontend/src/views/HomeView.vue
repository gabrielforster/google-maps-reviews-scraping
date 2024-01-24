<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import Dialog from 'primevue/dialog'

const data = ref(null)
const isModalOpen = ref(null)
const isLoading = ref(false)

const name = ref('')
const description = ref('')
const googleMapsUrl = ref('')

const fetchDataInterval = ref(null)

onMounted(() => {
  fetchData()

  fetchDataInterval.value = setInterval(() => {
    fetchData()
    console.log('fetching data...')
  }, 1000 * 60)
})

onBeforeUnmount(() => {
  clearInterval(fetchDataInterval.value)
})

async function registerPlace() {
  try {
    isLoading.value = true;

    const response = await fetch('https://lmtebcx7dj.execute-api.sa-east-1.amazonaws.com/api' + '/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        description: description.value,
        url: googleMapsUrl.value
      })
    })

    const placeData = await response.json()

    if (placeData.error) {
      throw new Error('backend:' + placeData.error)
    }
  } catch (error) {
    if (error.message.startsWith('backend:')) {
      alert(error.message.replace('backend:', ''))
      return
    }

    alert('Erro ao registrar local')
  } finally {
    name.value = ''
    description.value = ''
    googleMapsUrl.value = ''

    isLoading.value = false
    isModalOpen.value = false

    fetchData()
  }
}

async function fetchData() {
  isLoading.value = true

  const response = await fetch('https://lmtebcx7dj.execute-api.sa-east-1.amazonaws.com/api' + '/places')

  const placesData = await response.json()

  data.value = placesData
  isLoading.value = false
}
</script>

<template>
  <main class="max-w-[900px] mt-32 w-full">
    <div v-if="data === null">
      <p class="text-white">Loading...</p>
    </div>

    <div v-else class="text-zinc-900 min-w-[900px] w-full flex flex-col">
      <div class="self-end">
        <button
          class="hover:pointer border rounded py-2 px-3 bg-blue-400 text-zinc-900 text-md font-bold"
          @click="isModalOpen = true"
        >
          Criar local
        </button>

        <Dialog
          v-model:visible="isModalOpen"
          modal
          :draggable="false"
          header="Registrar local"
          :style="{ width: '50rem' }"
          :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
          class="bg-gray-600 p-4 rounded-md text-white"
        >
          <form @submit.prevent="registerPlace">
            <div class="flex flex-col">
              <label for="name">Nome</label>
              <input
                id="name"
                type="text"
                v-model="name"
                class="rounded-md p-2 bg-zinc-500 border outline-none border-zinc-600 focus:border-zinc-800 rounded text-white"
              />
            </div>

            <div class="flex flex-col">
              <label for="description">Descrição</label>
              <textarea
                id="description"
                type="text"
                v-model="description"
                class="rounded-md p-2 bg-zinc-500 border outline-none border-zinc-600 focus:border-zinc-800 rounded text-white"
              />
            </div>

            <div class="flex flex-col">
              <label for="googleMapsUrl">URL do Google Maps</label>
              <input
                id="googleMapsUrl"
                type="text"
                v-model="googleMapsUrl"
                class="rounded-md p-2 bg-zinc-500 border outline-none border-zinc-600 focus:border-zinc-800 rounded text-white"
              />
            </div>

            <div class="flex justify-end">
              <button type="submit" class="rounded-md mt-6 p-2 bg-zinc-900 text-white">
                Registrar
              </button>
            </div>
          </form>
        </Dialog>
      </div>

      <div v-for="place in data" class="flex flex-col border rounded py-1 px-2 my-2 max-w-[900px]">
        <RouterLink :to="{ name: 'place', params: { place: place.slug } }">
          <p>{{ place.name }}</p>
          <p>{{ place.description }}</p>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
