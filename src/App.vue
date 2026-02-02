<template>
  <div class="min-h-screen bg-[#f2f4f6] text-[#191f28] pb-24 font-sans">
    <header class="bg-white px-6 pt-16 pb-8 border-b border-[#f2f4f6]">
      <div class="max-w-md mx-auto text-center">
        <h1 class="text-[28px] font-bold tracking-tight mb-2 leading-tight">Bulldozer Team ⚽️</h1>
        <div class="flex items-center justify-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#e8f3ff] text-[#0064ff] text-xs font-bold shadow-sm">
            {{ dDayText }}
          </span>
          <span class="text-[#8b95a1] text-sm font-medium">{{ formattedDate }} ({{ todayDay }})</span>
        </div>
      </div>
    </header>

    <section v-if="currentTab !== 'rules'" class="max-w-md mx-auto px-5 mt-6">
      <div class="bg-white rounded-[24px] p-6 shadow-sm border border-white">
        <p class="text-[13px] font-bold text-[#8b95a1] mb-1">우리팀 누적 기부금</p>
        <h2 class="text-[24px] font-bold text-[#191f28]">
          {{ totalDonationFund.toLocaleString() }} <span class="text-lg font-medium ml-0.5 text-[#8b95a1]">원</span>
        </h2>
      </div>
    </section>

    <nav class="sticky top-0 z-20 bg-[#f2f4f6]/80 backdrop-blur-xl px-4 py-3 flex justify-center border-b border-[#e5e8eb] mt-4 overflow-x-auto no-scrollbar">
      <div class="flex gap-1 max-w-md w-full justify-center">
        <button v-for="t in tabs" :key="t.id" @click="currentTab = t.id"
          :class="['px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0', 
                   currentTab === t.id ? 'bg-white text-[#0064ff] shadow-sm' : 'text-[#4e5968] active:bg-gray-200']">
          {{ t.name }}
        </button>
      </div>
    </nav>

    <main class="max-w-md mx-auto px-5 mt-4">
      
      <!-- <template v-if="currentTab === 'today'">
        <div v-if="!isChallengePeriod" class="bg-white rounded-[24px] p-10 text-center text-[#8b95a1] font-medium shadow-sm border border-white">
          현재는 챌린지 기간이 아닙니다 🏃‍♂️
        </div>
        <div v-else class="space-y-3">
          <div v-for="member in members" :key="member.name" 
               class="bg-white rounded-[20px] p-5 flex items-center justify-between shadow-sm border border-white transition-all active:scale-[0.98]">
            <span class="text-[17px] font-bold text-[#191f28]">{{ member.name }}</span>
            <div class="flex items-center gap-2">
              <span v-if="member.doneToday" class="px-4 py-1.5 rounded-full bg-[#e7f9f3] text-[#00d082] text-sm font-black">완료 ✨</span>
              <span v-else class="px-4 py-1.5 rounded-full bg-[#f2f4f6] text-[#adb5bd] text-sm font-bold">미완료 🏃‍♂️</span>
            </div>
          </div>
        </div>
      </template> -->

      <template v-if="currentTab !== 'rules'">
        <div v-if="loading" class="text-center py-20 text-[#8b95a1] font-medium animate-pulse">데이터 로드 중...</div>
        <div v-else class="space-y-3">
          <div v-for="member in sortedMembers" :key="member.name"
               :class="['bg-white rounded-[28px] p-6 shadow-sm border transition-all relative',
                        member.rank === 1 && currentTab === 'all' ? 'king-border bg-amber-50/20' : 'border-white']">
            
            <div v-if="member.rank === 1 && currentTab === 'all'" class="absolute -top-4 left-6 text-3xl drop-shadow-sm">👑</div>

            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 flex items-center justify-center bg-[#f9fafb] rounded-xl font-bold shadow-inner">
                  <span v-if="member.rank === 1" class="text-xl">🥇</span>
                  <span v-else-if="member.rank === 2" class="text-xl">🥈</span>
                  <span v-else-if="member.rank === 3" class="text-xl">🥉</span>
                  <span v-else class="text-sm font-bold text-[#adb5bd]">{{ member.rank }}</span>
                </div>
                <span class="text-[18px] font-bold">{{ member.name }}</span>
              </div>
              <div class="text-right">
                <span class="text-[22px] font-black text-[#0064ff]">{{ member.displayCount }}</span>
                <span class="text-[13px] text-[#8b95a1] ml-1">회</span>
              </div>
            </div>

            <div class="bg-[#f9fafb] rounded-[18px] p-4 mb-5 flex justify-between items-center border border-[#f2f4f6]">
              <div>
                <p class="text-[11px] font-bold text-[#8b95a1] mb-1 leading-none uppercase tracking-tighter">환급 예정액</p>
                <p class="text-[16px] font-bold" :class="member.totalDeduction > 0 ? 'text-[#f04452]' : 'text-[#00d082]'">
                  {{ member.refundAmount.toLocaleString() }}원
                </p>
              </div>
              <span v-if="member.totalDeduction > 0" class="text-[11px] font-bold px-2 py-1 bg-[#fff0f1] text-[#f04452] rounded-lg">
                -{{ member.totalDeduction.toLocaleString() }}
              </span>
            </div>
            
            <div class="flex gap-2 text-center">
              <div v-for="(status, idx) in member.weeklyStatus" :key="idx" class="flex-1">
                <p class="text-[9px] font-bold text-[#adb5bd] mb-1 uppercase tracking-tighter">Week {{ idx + 1 }}</p>
                <div :class="['py-1.5 rounded-lg text-[10px] font-black border transition-all',
                             status === 'PASS' ? 'bg-[#e7f9f3] border-[#00d082] text-[#00d082]' : 
                             status === 'FAIL' ? 'bg-[#fff0f1] border-[#f04452] text-[#f04452]' : 
                             status === 'PROGRESS' ? 'bg-[#e8f3ff] border-[#0064ff] text-[#0064ff] animate-status-pulse' :
                             'bg-[#f2f4f6] border-transparent text-[#adb5bd]']">
                  {{ status === 'PASS' ? '성공' : status === 'FAIL' ? '실패' : status === 'PROGRESS' ? '진행' : '대기' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="space-y-4 pb-10">
          <div class="bg-white rounded-[24px] p-6 shadow-sm border-2 border-[#0064ff]/10">
            <h3 class="text-[13px] font-bold text-[#8b95a1] mb-3 uppercase tracking-widest text-center italic">Challenge Deposit</h3>
            <div class="text-center mb-5">
              <p class="text-[19px] font-bold text-[#191f28] mb-1">{{ BANK_ACCOUNT }}</p>
              <p class="text-[14px] text-[#4e5968] font-medium">예금주: 강민경(불도저 밀어버려)</p>
            </div>
            <button @click="copyAccount" 
                    :class="['w-full py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95',
                             isCopied ? 'bg-[#00d082] text-white' : 'bg-[#0064ff] text-white']">
              {{ isCopied ? '✅ 복사되었습니다!' : '계좌번호 복사하기' }}
            </button>
          </div>
        </div>

        <div class="space-y-4 pb-10">
          <div class="bg-white rounded-[24px] p-6 shadow-sm border border-white">
            <h3 class="text-[17px] font-bold text-[#191f28] mb-4 flex items-center gap-2">
              📅 챌린지 기간 및 인증
            </h3>
            <ul class="space-y-4 text-[14px] text-[#4e5968] leading-relaxed">
              <li class="flex gap-3">
                <span class="text-blue-600 font-bold shrink-0">기간</span>
                <span>2026년 2월 1일 ~ 2월 28일 (설 연휴 포함)</span>
              </li>
              <li class="flex gap-3">
                <span class="text-blue-600 font-bold shrink-0">내용</span>
                <span>볼마스터리 영상 또는 풋살 관련 개인 연습 (10분 이상)</span>
              </li>
              <li class="flex gap-3">
                <span class="text-blue-600 font-bold shrink-0">시간</span>
                <span>매일 잠들기 전까지 카톡방에 공유</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-4 pb-10">
          <div class="bg-white rounded-[24px] p-6 shadow-sm border border-white">
            <h3 class="text-[17px] font-bold text-[#191f28] mb-4 flex items-center gap-2">
              💰 보증금 및 벌금
            </h3>
            <div class="bg-[#f9fafb] rounded-xl p-4 mb-4 text-[13px] text-[#4e5968]">
              주 단위로 성공 여부를 판단하며, 실패 시 보증금에서 25%씩 차감됩니다.
            </div>
            <ul class="space-y-4 text-[14px] text-[#4e5968]">
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 bg-[#e8f3ff] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span class="text-[10px] text-[#0064ff]">✓</span>
                </div>
                <span><strong>주 5회 이상</strong> 참여 시 해당 주차 성공</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 bg-[#fff0f1] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span class="text-[10px] text-[#f04452]">!</span>
                </div>
                <span>미달 시 주차별 보증금의 <strong>25% 차감</strong></span>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-4 pb-10">
          <div class="bg-white rounded-[24px] p-6 shadow-sm border border-white">
            <h3 class="text-[17px] font-bold text-[#191f28] mb-4">📝 참가 방법</h3>
            <ol class="space-y-4 text-[14px] text-[#4e5968]">
              <li class="flex gap-3">
                <b class="text-[#adb5bd]">1.</b>
                <span><strong>1/31(토)</strong>까지 참가비 입금 (최소 2만원~)</span>
              </li>
              <li class="flex gap-3">
                <b class="text-[#adb5bd]">2.</b>
                <span>공식 오픈카톡방 입장</span>
              </li>
              <li class="flex gap-3">
                <b class="text-[#adb5bd]">3.</b>
                <span>매일 <strong>타임랩스</strong> 영상으로 인증 (첫날/마지막날은 달라진 모습 확인을 위해 <strong>풀영상</strong> 공유)</span>
              </li>
            </ol>
          </div>
        </div>

        <div class="space-y-4 pb-10">
          <div class="bg-gradient-to-br from-[#0064ff] to-[#00d082] rounded-[24px] p-6 text-white shadow-lg">
            <h3 class="text-[17px] font-bold mb-2">🎁 Special Prize</h3>
            <p class="text-[14px] opacity-90 leading-relaxed">
              만근자 또는 최다 참여자에게는 특별한 상품이 지급될 수 있습니다!<br>
              <span class="text-[12px] font-medium text-yellow-200">* 실패자들이 모은 기부금으로 선물을 준비합니다.</span>
            </p>
          </div>
        </div>
      </template>

      
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Papa from 'papaparse';

const loading = ref(true);
const currentTab = ref('1');
const members = ref([]);
const isCopied = ref(false);
const tabs = [/*{id:'today', name:'오늘'}, */{id:'all', name:'전체'}, {id:'1', name:'1주'}, {id:'2', name:'2주'}, {id:'3', name:'3주'}, {id:'4', name:'4주'}, {id:'rules', name:'규칙'}];

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQr9cBZShKoKnp0Baw-sB-pb26LvsbENLyrK-hHk7JIZpZRIdzDOed-OHFlhHpknPrjxNpDs1AvNCJz/pub?gid=0&single=true&output=csv';
const BANK_ACCOUNT = '토스뱅크 1000-6133-7921'

// 1. 날짜 정규화 및 D-Day (문자열 형식 적용)
const today = new Date();
const todayDateString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD 형식
const todayNormalized = new Date(todayDateString);
const targetDate = new Date("2026-02-01");

const formattedDate = `${today.getMonth() + 1}월 ${today.getDate()}일`;
const todayDay = ['일','월','화','수','목','금','토'][today.getDay()];

const isChallengePeriod = computed(() => {
  return todayNormalized >= new Date("2026-02-01") && todayNormalized <= new Date("2026-02-28");
});

const dDayText = computed(() => {
  const diff = Math.round((targetDate - todayNormalized) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `시작까지 ${diff}일`;
  if (diff === 0) return "드디어 오늘 시작! 🔥";
  
  // 주차 계산용 오프셋 (2026-02-01은 일요일이므로 getDay()가 0)
  const offset = new Date("2026-02-01").getDay(); 
  const weekNo = Math.ceil((today.getDate() + offset) / 7);
  return `${weekNo > 4 ? 4 : weekNo}주차 챌린지 중`;
});

// 2. 데이터 처리 및 주차 판별
const fetchData = async () => {
  try {
    const { data } = await axios.get(CSV_URL + `&t=${Date.now()}`);
    const parsed = Papa.parse(data, { header: true }).data;
    
    // 2026년 2월 주차별 일요일~토요일 경계 (문자열 형식 적용)
    const weekRanges = [
      { start: new Date("2026-02-01"), end: new Date("2026-02-07T23:59:59") },
      { start: new Date("2026-02-08"), end: new Date("2026-02-14T23:59:59") },
      { start: new Date("2026-02-15"), end: new Date("2026-02-21T23:59:59") },
      { start: new Date("2026-02-22"), end: new Date("2026-02-28T23:59:59") }
    ];

    const todayCol = `${today.getMonth() + 1}/${today.getDate()}`;

    members.value = parsed.map(row => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
      Object.keys(row).forEach(key => {
        if (key.includes('/') && row[key] === 'O') {
          const d = parseInt(key.split('/')[1]);
          const weekNo = Math.ceil((d + new Date("2026-02-01").getDay()) / 7);
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
        name: row['이름'], weeklyCounts: counts, weeklyStatus, 
        total: Object.values(counts).reduce((a, b) => a + b, 0),
        totalDeduction: deduction, refundAmount: deposit - deduction,
        doneToday: row[todayCol] === 'O'
      };
    });
  } catch (e) { console.error(e); } finally { loading.value = false; }
};

// 3. 랭킹 및 동점 처리
const sortedMembers = computed(() => {
  let list = [...members.value];
  const tab = currentTab.value;
  if (tab === 'today' || tab === 'rules') return [];

  list.sort((a, b) => {
    const countA = tab === 'all' ? a.total : a.weeklyCounts[parseInt(tab)];
    const countB = tab === 'all' ? b.total : b.weeklyCounts[parseInt(tab)];
    if (countB !== countA) return countB - countA;
    return a.name.localeCompare(b.name);
  });

  let currentRank = 1;
  return list.map((m, index) => {
    const count = tab === 'all' ? m.total : m.weeklyCounts[parseInt(tab)];
    if (index > 0) {
      const prevCount = tab === 'all' ? list[index-1].total : list[index-1].weeklyCounts[parseInt(tab)];
      if (count !== prevCount) currentRank = index + 1;
    }
    return { ...m, displayCount: count, rank: currentRank };
  });
});

const totalDonationFund = computed(() => members.value.reduce((acc, m) => acc + m.totalDeduction, 0));

const copyAccount = () => {
  navigator.clipboard.writeText(BANK_ACCOUNT).then(() => {
    isCopied.value = true;
    setTimeout(() => isCopied.value = false, 2000);
  });
};

onMounted(fetchData);
</script>