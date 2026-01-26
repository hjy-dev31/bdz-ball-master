<template>
  <div class="min-h-screen bg-[#f2f4f6] text-[#191f28] pb-20">
    
    <header class="bg-white px-6 pt-16 pb-8 border-b border-[#f2f4f6]">
      <div class="max-w-md mx-auto">
        <h1 class="text-[28px] font-bold tracking-tight mb-2">Bulldozer Team</h1>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#e8f3ff] text-[#0064ff] text-xs font-bold">
            {{ dDayText }}
          </span>
          <span class="text-[#8b95a1] text-sm font-medium">{{ formattedDate }}</span>
        </div>
      </div>
    </header>

    <section class="max-w-md mx-auto px-5 mt-6">
      <div class="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white">
        <p class="text-[13px] font-bold text-[#8b95a1] mb-1 leading-none">우리팀 누적 기부금</p>
        <h2 class="text-[26px] font-bold text-[#191f28]">
          {{ totalDonationFund.toLocaleString() }} <span class="text-lg font-medium ml-0.5 text-[#8b95a1]">원</span>
        </h2>
      </div>
    </section>

    <nav class="sticky top-0 z-20 bg-[#f2f4f6]/80 backdrop-blur-xl border-b border-[#e5e8eb]">
      <div class="max-w-md mx-auto px-4 py-3 flex justify-center items-center gap-1 overflow-x-auto no-scrollbar">
        <button v-for="t in tabs" :key="t.id" @click="currentTab = t.id"
          :class="['px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0', 
                  currentTab === t.id ? 'bg-white text-[#0064ff] shadow-sm' : 'text-[#4e5968] active:bg-gray-200']">
          {{ t.name }}
        </button>
      </div>
    </nav>

    <main class="max-w-md mx-auto px-5 mt-4 space-y-4">
      <div v-if="loading" class="text-center py-20 text-[#8b95a1] font-medium">데이터 로딩 중...</div>

      <template v-else>
        <div v-for="(member, index) in sortedMembers" :key="member.name"
             :class="['bg-white rounded-[28px] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border transition-all relative',
                      index === 0 ? 'king-border bg-amber-50/20' : 'border-white']">
          
          <div v-if="index === 0" class="absolute -top-4 left-6 text-3xl drop-shadow-md">👑</div>

          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 flex items-center justify-center bg-[#f9fafb] rounded-xl font-bold text-[#adb5bd]">
                {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}
              </div>
              <span class="text-[19px] font-bold" :class="index === 0 ? 'text-[#f59e0b]' : 'text-[#191f28]'">
                {{ member.name }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[22px] font-black text-[#0064ff]">{{ member.displayCount }}</span>
              <span class="text-[13px] text-[#8b95a1] ml-1">회</span>
            </div>
          </div>

          <div class="bg-[#f9fafb] rounded-[20px] p-4 mb-5 flex justify-between items-center border border-[#f2f4f6]">
            <div>
              <p class="text-[11px] font-bold text-[#8b95a1] mb-1">환급 예정액</p>
              <p class="text-[17px] font-bold" :class="member.totalDeduction > 0 ? 'text-[#f04452]' : 'text-[#00d082]'">
                {{ member.refundAmount.toLocaleString() }}원
              </p>
            </div>
            <div v-if="member.totalDeduction > 0" class="text-right">
              <span class="text-[11px] font-bold px-2.5 py-1 bg-[#fff0f1] text-[#f04452] rounded-lg">
                -{{ member.totalDeduction.toLocaleString() }}
              </span>
            </div>
          </div>
          
          <div class="flex gap-2">
            <div v-for="(status, idx) in member.weeklyStatus" :key="idx" class="flex-1 text-center">
              <p class="text-[10px] font-bold text-[#adb5bd] mb-1.5 uppercase">W{{ idx + 1 }}</p>
              <div :class="['py-1.5 rounded-lg text-[10px] font-black border transition-all',
                           status === 'PASS' ? 'bg-[#e7f9f3] border-[#00d082] text-[#00d082]' : 
                           status === 'FAIL' ? 'bg-[#fff0f1] border-[#f04452] text-[#f04452]' : 
                           status === 'PROGRESS' ? 'bg-[#e8f3ff] border-[#0064ff] text-[#0064ff] animate-pulse' :
                           'bg-[#f2f4f6] border-transparent text-[#adb5bd]']">
                {{ status === 'PASS' ? '성공' : status === 'FAIL' ? '실패' : status === 'PROGRESS' ? '진행중' : '대기' }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <footer class="mt-12 text-center px-10">
      <p class="text-[13px] font-medium text-[#8b95a1] leading-relaxed italic">
        "우리의 발밑은 배신하지 않는다"<br>
        2/1 시작 · 일요일 시작 기준 · 주 5회 이상 PASS
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Papa from 'papaparse';

const loading = ref(true);
const currentTab = ref('all');
const members = ref([]);
const tabs = [{id:'all', name:'전체'}, {id:'1', name:'1주'}, {id:'2', name:'2주'}, {id:'3', name:'3주'}, {id:'4', name:'4주'}];

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQr9cBZShKoKnp0Baw-sB-pb26LvsbENLyrK-hHk7JIZpZRIdzDOed-OHFlhHpknPrjxNpDs1AvNCJz/pub?gid=0&single=true&output=csv';

const today = new Date("2026-02-15");
const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const targetDate = new Date(2026, 1, 1); 
const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일`;
const todayDay = ['일','월','화','수','목','금','토'][today.getDay()];

const dDayText = computed(() => {
  const diff = Math.round((targetDate - todayNormalized) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `시작 D-${diff}`;
  if (diff === 0) return "챌린지 시작! 🔥";
  const weekNo = Math.ceil((today.getDate() + new Date(2026, 1, 1).getDay()) / 7);
  return `${weekNo > 4 ? 4 : weekNo}주차 진행 중`;
});

const fetchData = async () => {
  try {
    const { data } = await axios.get(CSV_URL);
    const parsed = Papa.parse(data, { header: true }).data;
    
    // 2026년 2월 주차별 일요일~토요일 경계
    const weekRanges = [
      { start: new Date(2026, 1, 1), end: new Date(2026, 1, 7, 23, 59, 59) },
      { start: new Date(2026, 1, 8), end: new Date(2026, 1, 14, 23, 59, 59) },
      { start: new Date(2026, 1, 15), end: new Date(2026, 1, 21, 23, 59, 59) },
      { start: new Date(2026, 1, 22), end: new Date(2026, 1, 28, 23, 59, 59) }
    ];

    members.value = parsed.map(row => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
      Object.keys(row).forEach(key => {
        if (key.includes('/') && row[key] === 'O') {
          const d = parseInt(key.split('/')[1]);
          const weekNo = Math.ceil((d + new Date(2026, 1, 1).getDay()) / 7);
          if (counts[weekNo] !== undefined) counts[weekNo]++;
        }
      });

      const weeklyStatus = weekRanges.map((range, i) => {
        const count = counts[i + 1];
        if (count >= 5) return 'PASS';
        if (today > range.end) return 'FAIL';
        if (today >= range.start && today <= range.end) return 'PROGRESS';
        return 'READY';
      });

      const failedCount = weeklyStatus.filter(s => s === 'FAIL').length;
      const deposit = Number(row['챌린지금액']) || 0;
      const deduction = (deposit / 4) * failedCount;

      return {
        name: row['이름'],
        weeklyCounts: counts,
        weeklyStatus,
        total: Object.values(counts).reduce((a, b) => a + b, 0),
        totalDeduction: deduction,
        refundAmount: deposit - deduction
      };
    });
  } catch (e) { console.error(e); } finally { loading.value = false; }
};

const totalDonationFund = computed(() => members.value.reduce((acc, m) => acc + m.totalDeduction, 0));

const sortedMembers = computed(() => {
  const list = [...members.value];
  if (currentTab.value === 'all') return list.sort((a,b) => b.total - a.total).map(m => ({...m, displayCount: m.total}));
  const w = parseInt(currentTab.value);
  return list.sort((a,b) => b.weeklyCounts[w] - a.weeklyCounts[w]).map(m => ({...m, displayCount: m.weeklyCounts[w]}));
});

onMounted(fetchData);
</script>