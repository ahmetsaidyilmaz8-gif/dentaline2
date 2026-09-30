<template>
  <div class="relative flex flex-col items-center group cursor-pointer select-none">
    <!-- Diş SVG Vektör Alanı (Gerçekçi Anatomik Model) -->
    <div
      :class="[
        'relative transition-all duration-200 transform group-hover:scale-110 flex items-center justify-center p-0.5 rounded-xl',
        isSelected ? 'ring-2 ring-teal-500 bg-teal-500/15 shadow-sm' : ''
      ]"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <svg
        viewBox="0 0 46 72"
        class="w-full h-full drop-shadow-sm overflow-visible transition-all duration-200"
        :class="{ 'opacity-30 filter grayscale': activeProcedures.includes('missing') }"
      >
        <defs>
          <!-- Gerçekçi Kemik / Sement Kök Gradyanı (Üst Çene: Kök yukarıda) -->
          <linearGradient :id="'rootGradUpper-' + toothNumber" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#dfbe95" />
            <stop offset="35%" stop-color="#ebd0aa" />
            <stop offset="75%" stop-color="#f5e1c3" />
            <stop offset="100%" stop-color="#fcf5ea" />
          </linearGradient>

          <!-- Gerçekçi Kemik / Sement Kök Gradyanı (Alt Çene: Kök aşağıda) -->
          <linearGradient :id="'rootGradLower-' + toothNumber" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#fcf5ea" />
            <stop offset="25%" stop-color="#f5e1c3" />
            <stop offset="65%" stop-color="#ebd0aa" />
            <stop offset="100%" stop-color="#dfbe95" />
          </linearGradient>

          <!-- Doğal Mine / Kuron Parlak Beyaz Gradyan -->
          <linearGradient :id="'crownGrad-' + toothNumber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="60%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>

          <!-- Kuron Kaplama (Altın / Zirkon) Gradyanı -->
          <linearGradient :id="'capGrad-' + toothNumber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="45%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>

          <!-- Titanyum İmplant Vidası Gradyanı -->
          <linearGradient :id="'implantGrad-' + toothNumber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#475569" />
            <stop offset="50%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#334155" />
          </linearGradient>
        </defs>

        <!-- Ayna Yansıtma: Sol Kadranlar (21..28 ve 31..38) X Ekseninde Yansıtılır -->
        <g :transform="isLeftQuadrant ? 'translate(46, 0) scale(-1, 1)' : ''">

          <!-- ========================================== -->
          <!-- 1. ÜST ÇENE DİŞLERİ (KÖK YUKARIDA, KURON AŞAĞIDA) -->
          <!-- ========================================== -->
          <g v-if="isUpper">
            
            <!-- A. KÖK BÖLÜMÜ (ROOTS - YUKARI DOĞRU) -->
            <g v-if="!activeProcedures.includes('implant')">
              
              <!-- Üst Büyük Azı Kökü (18, 17, 16): 3 KÖK (2 Bukkal + 1 Palatinal) -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 8,34 C 5,22 4,6 10,4 C 13,3 14,14 16,23 C 18,14 19,3 23,3 C 27,3 28,14 30,23 C 32,14 33,6 37,7 C 41,8 39,22 37,34 Q 23,36 8,34 Z"
                :fill="`url(#rootGradUpper-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Üst Küçük Azı Kökü (15, 14): 2 Kök Ucu (Bifurkasyon) veya Tek Güçlü Kök -->
              <path
                v-else-if="toothCategory === 'premolar'"
                d="M 12,34 C 9,20 11,6 16,4 C 19,3 20,15 22,23 C 24,15 25,3 28,4 C 33,6 33,20 31,34 Q 22,36 12,34 Z"
                :fill="`url(#rootGradUpper-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Üst Köpek Dişi Kökü (13): En Uzun, Sağlam, Sivri Kök -->
              <path
                v-else-if="toothCategory === 'canine'"
                d="M 13,34 C 11,20 15,2 22,2 C 29,2 32,20 30,34 Q 22,36 13,34 Z"
                :fill="`url(#rootGradUpper-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Üst Kesici Diş Kökü (12 Lateral, 11 Santral): Geniş Koni Kök -->
              <path
                v-else
                :d="isCentralIncisor 
                  ? 'M 14,34 C 12,18 16,3 22,3 C 28,3 31,18 29,34 Q 22,36 14,34 Z'
                  : 'M 14,34 C 13,19 17,4 22,4 C 27,4 30,19 28,34 Q 22,36 14,34 Z'"
                :fill="`url(#rootGradUpper-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Kök Derinlik ve Gölge Çizgisi -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 16,23 Q 23,28 30,23"
                stroke="#d4b484"
                stroke-width="1"
                fill="none"
              />
            </g>

            <!-- Titanyum İmplant Vidası (Kök Yerine Geçer) -->
            <g v-else transform="translate(14, 4)">
              <rect x="2" y="0" width="14" height="28" rx="3" :fill="`url(#implantGrad-${toothNumber})`" stroke="#1e293b" stroke-width="1.5" />
              <line x1="0" y1="6" x2="18" y2="6" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="11" x2="18" y2="11" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="16" x2="18" y2="16" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="21" x2="18" y2="21" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="2" y1="26" x2="16" y2="26" stroke="#cbd5e1" stroke-width="1.8" />
            </g>

            <!-- Kanal Tedavisi (Kök Kanallarından Aşağı İnen Kırmızı Hat) -->
            <g v-if="activeProcedures.includes('rootcanal')">
              <template v-if="toothCategory === 'molar'">
                <path d="M 11,8 L 15,32" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
                <path d="M 23,7 L 23,32" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
                <path d="M 35,10 L 31,32" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
              </template>
              <template v-else-if="toothCategory === 'premolar'">
                <path d="M 17,8 L 18,32" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
                <path d="M 27,8 L 26,32" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
              </template>
              <template v-else>
                <path d="M 22,6 L 22,32" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
              </template>
            </g>

            <!-- B. KURON BÖLÜMÜ (CROWNS - AŞAĞI DOĞRU BITE LINE'A BAKAR) -->
            <g>
              <!-- Üst Molar Kuron (Geniş 4 Tüberküllü) -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 7,33 C 5,42 4,57 7,63 C 11,67 16,68 22,67 C 28,68 34,67 38,63 C 41,57 40,42 38,33 C 33,35 28,34 22,35 C 16,34 11,35 7,33 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Üst Premolar Kuron (2 Tüberküllü Yuvarlak) -->
              <path
                v-else-if="toothCategory === 'premolar'"
                d="M 9,33 C 7,42 6,56 10,63 C 14,67 18,68 22,67 C 26,68 31,67 34,63 C 38,56 37,42 35,33 C 30,35 26,34 22,35 C 18,34 14,35 9,33 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Üst Köpek Dişi Kuron (Sivri Tüberküllü Elmas Şekli) -->
              <path
                v-else-if="toothCategory === 'canine'"
                d="M 10,33 C 8,43 7,57 12,64 C 16,68 22,70 22,70 C 22,70 28,68 32,64 C 37,57 36,43 34,33 C 29,35 26,34 22,35 C 18,34 15,35 10,33 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Üst Kesici Diş Kuron (Geniş Kürek / Keski Uçlu) -->
              <path
                v-else
                :d="isCentralIncisor
                  ? 'M 8,33 C 7,43 7,59 10,65 C 13,68 18,69 22,69 C 27,69 31,68 35,65 C 37,59 37,43 36,33 C 31,35 27,34 22,35 C 17,34 13,35 8,33 Z'
                  : 'M 10,33 C 9,43 8,58 12,65 C 15,68 18,69 22,69 C 26,69 29,68 32,65 C 36,58 35,43 34,33 C 30,35 26,34 22,35 C 18,34 14,35 10,33 Z'"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Mine Anatomik Fissür ve Tüberkül Detay Çizgileri -->
              <g stroke="#94a3b8" stroke-width="1" fill="none" opacity="0.75">
                <path v-if="toothCategory === 'molar'" d="M 15,48 Q 22,54 29,48 M 22,51 L 22,64" />
                <path v-else-if="toothCategory === 'premolar'" d="M 16,48 Q 22,52 28,48 M 22,50 L 22,63" />
                <path v-else-if="toothCategory === 'canine'" d="M 22,38 L 22,66 M 15,50 Q 22,56 29,50" />
                <path v-else d="M 16,42 L 16,65 M 28,42 L 28,65" />
              </g>

              <!-- Servikal Diş Boyun Çizgisi (Kök-Kuron Birleşimi) -->
              <path d="M 9,34 Q 22,37 36,34" stroke="#1e293b" stroke-width="1.4" fill="none" />
            </g>
          </g>

          <!-- ========================================== -->
          <!-- 2. ALT ÇENE DİŞLERİ (KURON YUKARIDA, KÖK AŞAĞIDA) -->
          <!-- ========================================== -->
          <g v-else>
            
            <!-- A. KURON BÖLÜMÜ (CROWNS - YUKARIDA BITE LINE'A BAKAR) -->
            <g>
              <!-- Alt Molar Kuron (Geniş Dikdörtgen 5 Tüberkül) -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 7,37 C 5,28 4,14 7,8 C 11,4 16,3 22,4 C 28,3 34,4 38,8 C 41,14 40,28 38,37 C 33,35 28,36 22,35 C 16,36 11,35 7,37 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Alt Premolar Kuron (Yuvarlak Tüberküllü) -->
              <path
                v-else-if="toothCategory === 'premolar'"
                d="M 9,37 C 7,28 6,15 10,8 C 14,4 18,3 22,4 C 26,3 31,4 34,8 C 38,15 37,28 35,37 C 30,35 26,36 22,35 C 18,36 14,35 9,37 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Alt Köpek Dişi Kuron (Sivri Tüberkül Yukarıda) -->
              <path
                v-else-if="toothCategory === 'canine'"
                d="M 10,37 C 8,27 7,14 12,7 C 16,3 22,2 22,2 C 22,2 28,3 32,7 C 37,14 36,27 34,37 C 29,35 26,36 22,35 C 18,36 15,35 10,37 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Alt Kesici Diş Kuron (Küçük, Narin, Düz Keski Kenar) -->
              <path
                v-else
                d="M 12,37 C 10,27 10,14 13,7 C 15,4 18,3 22,3 C 26,3 29,4 31,7 C 34,14 34,27 32,37 C 28,35 26,36 22,35 C 18,36 15,35 12,37 Z"
                :fill="crownFill"
                stroke="#1e293b"
                stroke-width="1.8"
                stroke-linejoin="round"
              />

              <!-- Alt Çene Fissür Detay Çizgileri -->
              <g stroke="#94a3b8" stroke-width="1" fill="none" opacity="0.75">
                <path v-if="toothCategory === 'molar'" d="M 15,22 Q 22,16 29,22 M 22,19 L 22,7" />
                <path v-else-if="toothCategory === 'premolar'" d="M 16,22 Q 22,17 28,22 M 22,20 L 22,8" />
                <path v-else-if="toothCategory === 'canine'" d="M 22,33 L 22,6 M 15,21 Q 22,15 29,21" />
                <path v-else d="M 17,28 L 17,8 M 27,28 L 27,8" />
              </g>

              <!-- Servikal Boyun Çizgisi -->
              <path d="M 9,36 Q 22,33 36,36" stroke="#1e293b" stroke-width="1.4" fill="none" />
            </g>

            <!-- B. KÖK BÖLÜMÜ (ROOTS - AŞAĞI DOĞRU) -->
            <g v-if="!activeProcedures.includes('implant')">
              
              <!-- Alt Molar Kökü (46..48, 36..38): 2 GÜÇLÜ KÖK (Mezial ve Distal) -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 8,36 C 6,48 5,64 12,68 C 16,70 17,54 21,46 C 25,54 26,70 30,68 C 37,64 36,48 34,36 Q 21,34 8,36 Z"
                :fill="`url(#rootGradLower-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Alt Premolar Kökü (44, 45, 34, 35): Tek Konik Kök -->
              <path
                v-else-if="toothCategory === 'premolar'"
                d="M 11,36 C 10,48 15,67 22,69 C 29,67 32,48 31,36 Q 21,34 11,36 Z"
                :fill="`url(#rootGradLower-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Alt Köpek Dişi Kökü (43, 33): Uzun Sağlam Kök -->
              <path
                v-else-if="toothCategory === 'canine'"
                d="M 12,36 C 11,50 15,69 22,71 C 29,69 32,50 30,36 Q 21,34 12,36 Z"
                :fill="`url(#rootGradLower-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Alt Kesici Diş Kökü (41, 42, 31, 32): İnce Uzun Düz Kök -->
              <path
                v-else
                d="M 14,36 C 13,48 17,67 22,69 C 27,67 29,48 28,36 Q 21,34 14,36 Z"
                :fill="`url(#rootGradLower-${toothNumber})`"
                stroke="#1e293b"
                stroke-width="1.6"
                stroke-linejoin="round"
              />

              <!-- Kök Derinlik Gölgesi -->
              <path
                v-if="toothCategory === 'molar'"
                d="M 16,46 Q 21,42 26,46"
                stroke="#d4b484"
                stroke-width="1"
                fill="none"
              />
            </g>

            <!-- Titanyum İmplant Vidası (Alt Çene Kök Yerine) -->
            <g v-else transform="translate(14, 38)">
              <rect x="2" y="0" width="14" height="28" rx="3" :fill="`url(#implantGrad-${toothNumber})`" stroke="#1e293b" stroke-width="1.5" />
              <line x1="0" y1="5" x2="18" y2="5" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="10" x2="18" y2="10" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="15" x2="18" y2="15" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="0" y1="20" x2="18" y2="20" stroke="#cbd5e1" stroke-width="1.8" />
              <line x1="2" y1="25" x2="16" y2="25" stroke="#cbd5e1" stroke-width="1.8" />
            </g>

            <!-- Kanal Tedavisi (Alt Kök Kanallarına İnen Kırmızı Hat) -->
            <g v-if="activeProcedures.includes('rootcanal')">
              <template v-if="toothCategory === 'molar'">
                <path d="M 13,38 L 13,62" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
                <path d="M 28,38 L 28,62" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
              </template>
              <template v-else>
                <path d="M 22,38 L 22,64" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
              </template>
            </g>
          </g>

          <!-- ========================================== -->
          <!-- 3. EŞZAMANLI İŞLEM KATMANLARI (KLİNİK OVERLAYS) -->
          <!-- ========================================== -->

          <!-- Kuron Kaplama (Crown / Veneer - Altın / Porselen Başlık) -->
          <g v-if="activeProcedures.includes('crown') || activeProcedures.includes('veneer')">
            <path
              :d="isUpper
                ? 'M 8,34 L 37,34 L 36,62 Q 22,68 9,62 Z'
                : 'M 8,36 L 37,36 L 36,9 Q 22,3 9,9 Z'"
              :fill="`url(#capGrad-${toothNumber})`"
              stroke="#b45309"
              stroke-width="2"
              opacity="0.9"
            />
          </g>

          <!-- Kompozit / Amalgam Dolgu Katmanı (Filled) -->
          <g v-if="activeProcedures.includes('filled')">
            <path
              :d="isUpper
                ? 'M 14,44 Q 22,48 30,44 Q 32,56 30,60 Q 22,64 14,60 Z'
                : 'M 14,26 Q 22,22 30,26 Q 32,14 30,10 Q 22,6 14,10 Z'"
              fill="#0d9488"
              stroke="#0f766e"
              stroke-width="1.6"
              opacity="0.9"
            />
          </g>

          <!-- Çürük Katmanı (Decay - Kavitasyonlu Çürük Noktası) -->
          <g v-if="activeProcedures.includes('decay')">
            <circle
              :cx="22"
              :cy="isUpper ? 52 : 18"
              r="6"
              fill="#dc2626"
              stroke="#7f1d1d"
              stroke-width="1.4"
              class="animate-pulse"
            />
          </g>

          <!-- Kist / Lezyon Katmanı (Lesion / Cyst - Kök Ucunda) -->
          <g v-if="activeProcedures.includes('lesion_cyst')">
            <circle
              :cx="22"
              :cy="isUpper ? 6 : 66"
              r="7"
              fill="#dc2626"
              fill-opacity="0.4"
              stroke="#ef4444"
              stroke-width="1.5"
              stroke-dasharray="2 2"
            />
          </g>

          <!-- Diş Taşı / Tartar Katmanı (Boyun Çevresi) -->
          <g v-if="activeProcedures.includes('scaling') || activeProcedures.includes('curettage')">
            <path
              :d="isUpper
                ? 'M 8,32 Q 22,36 36,32 Q 34,38 8,38 Z'
                : 'M 8,38 Q 22,34 36,38 Q 34,32 8,32 Z'"
              fill="#eab308"
              opacity="0.8"
            />
          </g>

          <!-- Çekim (Extraction - Kırmızı Çarpı) -->
          <g v-if="activeProcedures.includes('extraction')" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round">
            <line x1="7" y1="8" x2="38" y2="64" />
            <line x1="38" y1="8" x2="7" y2="64" />
          </g>
        </g>
      </svg>

      <!-- Aktif İşlem Rozetleri (Multi-Procedure Badges) -->
      <div v-if="displayBadges.length > 0" class="absolute -bottom-1 -right-1 flex items-center -space-x-1 z-10">
        <div
          v-for="(badge, idx) in displayBadges"
          :key="idx"
          :class="[
            badge.bg, badge.color,
            width < 28 ? 'w-2.5 h-2.5 text-[6px]' : 'w-4 h-4 text-[9px]',
            'rounded-full border border-white dark:border-slate-900 flex items-center justify-center font-bold shadow-md'
          ]"
          :title="badge.label"
        >
          {{ width < 28 ? '•' : badge.icon }}
        </div>
      </div>
    </div>

    <!-- FDI Diş Numarası Etiketi (Kategoriye Göre Renkli Rozet) -->
    <span
      :class="[
        width < 28 ? 'text-[8px] tracking-tighter px-0.5' : 'text-[11px] tracking-tight px-1 py-0.2',
        categoryBadgeClass,
        'font-bold font-mono rounded mt-0.5 leading-none transition-colors border'
      ]"
    >
      {{ toothNumber }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUtils } from '~/composables/useUtils';

const props = defineProps({
  toothNumber: {
    type: Number,
    required: true
  },
  procedures: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: 'healthy'
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isUpper: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 38
  },
  height: {
    type: Number,
    default: 58
  }
});

const { getToothStatusInfo } = useUtils();

// Çene Yönü (Üst / Alt)
const isUpper = computed(() => {
  if (typeof props.isUpper === 'boolean') return props.isUpper;
  const tens = Math.floor(props.toothNumber / 10);
  return tens === 1 || tens === 2;
});

// Sol Kadran mı? (21..28 ve 31..38 X ekseninde simetrik yansıtılır)
const isLeftQuadrant = computed(() => {
  const tens = Math.floor(props.toothNumber / 10);
  return tens === 2 || tens === 3;
});

// Diş Morfoloji Kategorisi
const toothCategory = computed(() => {
  const digit = props.toothNumber % 10;
  if (digit >= 6) return 'molar';
  if (digit >= 4) return 'premolar';
  if (digit === 3) return 'canine';
  return 'incisor';
});

// Santral Kesici mi? (11, 21 geniş kürek mine)
const isCentralIncisor = computed(() => {
  const digit = props.toothNumber % 10;
  return digit === 1;
});

// Aktif İşlemler Listesi
const activeProcedures = computed(() => {
  if (Array.isArray(props.procedures) && props.procedures.length > 0) {
    return props.procedures;
  }
  if (props.status && props.status !== 'healthy') {
    return [props.status];
  }
  return ['healthy'];
});

// Kuron Dolgu Rengi
const crownFill = computed(() => {
  if (activeProcedures.value.includes('crown') || activeProcedures.value.includes('veneer')) {
    return `url(#capGrad-${props.toothNumber})`;
  }
  return `url(#crownGrad-${props.toothNumber})`;
});

// Rozetler
const displayBadges = computed(() => {
  const filtered = activeProcedures.value.filter(p => p !== 'healthy');
  return filtered.slice(0, 3).map(p => getToothStatusInfo(p));
});

// Kategoriye Göre Renk Rozeti (Referans Resimdeki Renk Kodlaması: Molar Pembe, Premolar Yeşil, Kanin Turuncu, İnsiziv Mavi)
const categoryBadgeClass = computed(() => {
  const cat = toothCategory.value;
  if (cat === 'molar') {
    return 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/60';
  }
  if (cat === 'premolar') {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  }
  if (cat === 'canine') {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }
  return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
});
</script>
