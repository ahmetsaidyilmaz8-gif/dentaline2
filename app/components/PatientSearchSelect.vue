<template>
  <div class="relative w-full" ref="dropdownRef" @focusout="handleFocusOut">
    <!-- Input Field -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>
      <input
        type="text"
        :placeholder="placeholder"
        v-model="searchQuery"
        @focus="onFocus"
        @input="onInput"
        class="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
        :required="required && !modelValue"
      />
      <!-- Dropdown Icon / Clear Button -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
        <button
          v-if="modelValue"
          type="button"
          @click="clearSelection"
          class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Seçimi Temizle"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="toggleDropdown"
          class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5"
        >
          <Icon
            name="heroicons:chevron-down"
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'transform rotate-180': isOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Dropdown List -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg focus:outline-none py-1"
      >
        <div v-if="filteredPatients.length === 0" class="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
          Hasta bulunamadı.
        </div>
        <button
          v-else
          v-for="p in filteredPatients"
          :key="p._id"
          type="button"
          @mousedown.prevent="selectPatient(p)"
          @click="selectPatient(p)"
          class="w-full text-left px-4 py-2 text-sm flex flex-col transition-colors border-0 outline-none cursor-pointer"
          :class="[
            p._id === modelValue
              ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          ]"
        >
          <span class="font-bold">{{ p.firstName }} {{ p.lastName }}</span>
          <span v-if="p.phone" class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ formatPhone(p.phone) }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useUtils } from '~/composables/useUtils';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  patients: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Hasta ara...'
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const { formatPhone } = useUtils();

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref(null);
const internalPatients = ref([]);

const effectivePatients = computed(() => {
  if (Array.isArray(props.patients) && props.patients.length > 0) {
    return props.patients;
  }
  return internalPatients.value;
});

const loadFallbackPatients = async () => {
  if (effectivePatients.value.length > 0) return;
  try {
    const res = await $fetch('/api/patients?all=true&limit=2000');
    internalPatients.value = Array.isArray(res) ? res : (res?.patients || []);
  } catch (err) {
    console.warn('PatientSearchSelect fallback error:', err);
  }
};

// Find selected patient object
const selectedPatient = computed(() => {
  return effectivePatients.value.find(p => p._id === props.modelValue);
});

// Update the search query display when selected patient changes
const resetQuery = () => {
  if (selectedPatient.value) {
    searchQuery.value = `${selectedPatient.value.firstName} ${selectedPatient.value.lastName}`;
  } else {
    searchQuery.value = '';
  }
};

watch(
  selectedPatient,
  () => {
    resetQuery();
  },
  { immediate: true }
);

// Clear current selection
const clearSelection = () => {
  emit('update:modelValue', '');
  searchQuery.value = '';
  isOpen.value = false;
};

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && effectivePatients.value.length === 0) {
    loadFallbackPatients();
  }
};

// Handle Input Focus
const onFocus = (e) => {
  isOpen.value = true;
  if (effectivePatients.value.length === 0) {
    loadFallbackPatients();
  }
  e.target.select();
};

// Handle Input Event
const onInput = () => {
  isOpen.value = true;
};

// Select Patient option
const selectPatient = (patient) => {
  emit('update:modelValue', patient._id);
  searchQuery.value = `${patient.firstName} ${patient.lastName}`;
  isOpen.value = false;
};

// Handle Tab out / focus out
const handleFocusOut = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.relatedTarget)) {
    isOpen.value = false;
    resetQuery();
  }
};

// Lowercase Turkish search match helper
const lowerTurkish = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c');
};

// Compute filtered patients (performans için en fazla 50 kayıt listelenir)
const filteredPatients = computed(() => {
  const query = searchQuery.value.trim();
  const selectedName = selectedPatient.value ? `${selectedPatient.value.firstName} ${selectedPatient.value.lastName}` : '';
  
  if (!query || query === selectedName) {
    return effectivePatients.value.slice(0, 50);
  }
  
  const searchLower = lowerTurkish(query);
  return effectivePatients.value.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`;
    return lowerTurkish(fullName).includes(searchLower) || (p.phone && lowerTurkish(p.phone).includes(searchLower));
  }).slice(0, 50);
});

// Click outside handler (fallback/additional safety)
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
    resetQuery();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (!props.patients || props.patients.length === 0) {
    loadFallbackPatients();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
