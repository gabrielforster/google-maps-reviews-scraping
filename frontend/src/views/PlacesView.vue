<script setup>
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const place = ref(route.params.place)

const data = ref(null)
const isLoading = ref(false)

onMounted(() => {
  fetchData()
})

async function fetchData() {
  isLoading.value = true

  const response = await fetch('/places/' + place.value)
  const placeData = await response.json()

  data.value = placeData
  isLoading.value = false
}
</script>

<template>
  <main class="max-w-[900px] mt-36 w-full">
    <div v-if="data === null">
      <p>Carregando dados...</p>
    </div>

    <div v-else class="text-zinc-900 w-full flex flex-col">
      <div class="text-xl underline">
        <RouterLink to="/">Voltar</RouterLink>
      </div>
      <div class="flex font-bold items-center justify-between w-full py-4">
        <div class="flex flex-col w-4/5">
          <p class="text-2xl font-bold">{{ data.name }}</p>
          <p class="text-xl">{{ data.description }}</p>
        </div>

        <div class="self-start">
          <p class="text-xl font-bold">Nota média: {{ data.avarageRating }}</p>
        </div>
      </div>

      <div v-for="review in data.reviews" class="flex flex-col border rounded py-1 px-2 my-2">
        <div class="flex flex-col">
          <div class="flex justify-between font-bold">
            <p class="text-lg font-medium pb-1">
              {{ review.reviewer }}
              <span>
                {{ ' ' }}
                <span class="text-sm font-normal">
                  {{ new Date(review.dateTimestamp).toLocaleDateString() }}
                </span>
              </span>
            </p>
            <p class="text-md">Nota: {{ review.rating }}</p>
          </div>

          <p>
            <span class="font-bold">
              Comentário: <span>{{ ' ' }}</span>
            </span>

            <span v-if="review.comment">{{ review.comment }}</span>
            <span v-else>Sem comentário</span>
          </p>

          <a :href="review.link" target="_blank" class="text-blue-500 underline"> Acessar </a>
        </div>
      </div>
    </div>
  </main>
</template>
