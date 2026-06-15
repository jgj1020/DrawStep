import { useState, useEffect } from "react";

const STEPS = [
  {
    id: 0, label: "영상 보고 영감 얻기", icon: "ti-player-play",
    desc: "마음에 드는 그림 영상을 보고 영감을 얻어보세요!",
    detail: "아래 추천 목록에서 영상을 선택하고 시청하세요. 구도, 색감, 표현 방식을 주의깊게 관찰해보세요.",
    hasVideo: true,
    checklist: ["영상 끝까지 시청하기", "마음에 드는 장면 메모하기"],
  },
  {
    id: 1, label: "노트에 밑그림 그리고 구상하기", icon: "ti-notebook",
    desc: "노트에 러프하게 밑그림을 구상하고 전체 구도를 잡아보세요.",
    detail: "구도, 비율, 머리 방향, 포즈를 대략적으로 잡아보세요. 완벽하지 않아도 됩니다!",
    hasVideo: false,
    checklist: ["전체 구도 잡기", "머리와 몸 비율 확인", "포즈 러프 스케치"],
  },
  {
    id: 2, label: "다리부터 그리기", icon: "ti-pencil",
    desc: "나만의 방식대로 다리부터 그림을 시작합니다.",
    detail: "다리 비율을 먼저 잡으면 전체 균형을 맞추기 쉬워요. 무릎 위치와 발 방향을 의식하면서 그려보세요.",
    hasVideo: false,
    checklist: ["다리 비율 맞추기", "무릎 위치 확인하기", "신발 완성하기"],
  },
  {
    id: 3, label: "몸통 그리기", icon: "ti-pencil-plus",
    desc: "상체 비율에 맞게 몸통을 완성해보세요.",
    detail: "어깨 너비와 허리 라인을 자연스럽게 연결하세요. 옷의 주름 방향도 함께 잡아두면 나중에 편해요.",
    hasVideo: false,
    checklist: ["어깨 너비 잡기", "허리 라인 그리기", "팔 위치 확인"],
  },
  {
    id: 4, label: "얼굴 완성하기", icon: "ti-mood-smile",
    desc: "눈, 코, 입, 머리 스타일을 완성합니다.",
    detail: "눈 간격은 눈 하나 너비가 기준이에요. 코는 눈에서 얼굴 길이의 1/3, 입은 코에서 다시 1/2 지점에 위치해요.",
    hasVideo: false,
    checklist: ["눈 간격 맞추기", "코/입 비율 확인", "머리카락 완성"],
  },
  {
    id: 5, label: "그림자 넣고 마무리하기", icon: "ti-brush",
    desc: "빛 방향을 정하고 그림자로 입체감을 더해요.",
    detail: "빛 방향을 먼저 정하고, 그 반대편에 일관되게 그림자를 넣으세요. 핵심 부위(눈 아래, 턱 아래, 옷 주름)에만 넣어도 충분해요.",
    hasVideo: false,
    checklist: ["빛 방향 정하기", "몸통 그림자 추가", "얼굴 그림자 완성", "전체 한 번 더 보기"],
  },
];

// 보내주신 실제 유튜브 링크와 공식 썸네일 주소로 전면 교체했습니다!
const SAMPLE_VIDEOS = [
  { title: "초보자 필수! 매력적인 얼굴 그리는 공식", channel: "그림 유튜버", duration: "재생시간", thumb: "https://img.youtube.com/vi/gWxouYN9sAA/mqdefault.jpg", url: "https://www.youtube.com/watch?v=gWxouYN9sAA&list=PLRIgvyrv5XV6i_7bqI6YlDrq2BsNbxslN" },
  { title: "인체 비율 완전 정복 캐릭터 데생 기초", channel: "그림 유튜버", duration: "재생시간", thumb: "https://img.youtube.com/vi/P27c4qqAIgI/mqdefault.jpg", url: "https://www.youtube.com/watch?v=P27c4qqAIgI" },
  { title: "얼굴 그리기 - 다양한 각도별 완벽 가이드", channel: "그림 유튜버", duration: "재생시간", thumb: "https://img.youtube.com/vi/QA8zG-U7Gdc/mqdefault.jpg", url: "https://www.youtube.com/watch?v=QA8zG-U7Gdc" },
  { title: "자연스러운 옷 주름과 명암 넣는 법", channel: "그림 유튜버", duration: "재생시간", thumb: "https://img.youtube.com/vi/4nEugHG4n-Y/mqdefault.jpg", url: "https://www.youtube.com/watch?v=4nEugHG4n-Y" },
];

// 세부 항목 체크 상태를 모두 따로 저장하기 위해 구조를 확장했습니다.
const INIT = {
  // 각 단계별 하위 체크리스트 개수만큼 false 배열 생성
  checks: STEPS.map(s => s.checklist.map(() => false)),
  stepMemos: ["","","","","",""],
  globalMemo: "",
  history: [],
  streak: 0,
  totalSessions: 0,
  totalTime: 0,
  lastDate: null,
};

function load() {
  try { 
    const r = localStorage.getItem("ds3"); 
    if (r) {
      const parsed = JSON.parse(r);
      // 구버전 데이터(1차원 배열)가 있을 경우 안전하게 마이그레이션 포맷팅 처리
      if (parsed.checks && typeof parsed.checks[0] === 'boolean') {
        parsed.checks = STEPS.map(s => s.checklist.map(() => false));
      }
      return { ...INIT, ...parsed }; 
    } 
  } catch {}
  return INIT;
}
function save(d) { try { localStorage.setItem("ds3", JSON.stringify(d)); } catch {} }

// 모든 단계의 모든 세부 체크박스가 다 켜졌을 때의 총 퍼센트 계산
function pct(checks) { 
  const total = checks.reduce((acc, curr) => acc + curr.length, 0);
  const dones = checks.reduce((acc, curr) => acc + curr.filter(Boolean).length, 0);
  return total > 0 ? Math.round((dones / total) * 100) : 0;
}

// 특정 단계(idx) 내의 모든 세부 항목이 완료되었는지 확인하는 함수
function isStepAllDone(checks, idx) {
  return checks[idx] && checks[idx].every(Boolean);
}

// 완료된 총 단계(Step) 개수 계산
function getDoneStepCount(checks) {
  return checks.filter(stepChecks => stepChecks.every(Boolean)).length;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
function fmtTime(m) { const h = Math.floor(m / 60); return h > 0 ? `${h}시간 ${m%60}분` : `${m}분`; }

function Ring({ p, size = 60 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, dash = (p / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E6FB" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#7B6FE8" strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .4s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600, fill: "#555",
          transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
        {p}%
      </text>
    </svg>
  );
}

function ProgressBar({ p }) {
  return (
    <div style={{ background: "#E8E6FB", borderRadius: 4, height: 6, overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${p}%`, height: "100%", background: "#7B6FE8", borderRadius: 4, transition: "width .4s ease" }}/>
    </div>
  );
}

function VideoCard({ v, onSelect, selected }) {
  return (
    <div onClick={() => onSelect(v)}
      style={{
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
        border: selected ? "2px solid #7B6FE8" : "1px solid #eeedf8",
        background: "#fff", transition: "border .15s",
      }}>
      <div style={{ position: "relative" }}>
        <img src={v.thumb} alt={v.title} style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLElement).style.background = "#e8e6fb"; (e.target as HTMLElement).style.height = "96px"; }}/>
        <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,.7)", color: "#fff",
          fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>{v.duration}</div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-player-play" style={{ color: "#fff", fontSize: 14 }} aria-hidden/>
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "#333",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</p>
        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{v.channel}</p>
      </div>
    </div>
  );
}

// ─── Step Detail Modal ────────────────────────────────────────────────────────
interface StepModalProps {
  step: typeof STEPS[0];
  idx: number;
  stepChecks: boolean[];
  memo: string;
  onMemo: (val: string) => void;
  onToggleItem: (itemIdx: number) => void;
  onToggleAll: () => void;
  onClose: () => void;
  data: any;
}

function StepModal({ step, idx, stepChecks, memo, onMemo, onToggleItem, onToggleAll, onClose, data }: StepModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<typeof SAMPLE_VIDEOS[0] | null>(null);
  const isAllDone = stepChecks.every(Boolean);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620,
        maxHeight: "85vh", overflow: "auto", padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, background: "#f0effe", color: "#7B6FE8", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
              {idx+1}단계
            </span>
            <h2 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 700, color: "#333" }}>{step.label}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{step.detail}</p>
          </div>
          <button onClick={onClose}
            style={{ background: "#f5f4fb", border: "none", borderRadius: "50%", width: 32, height: 32,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
            <i className="ti ti-x" style={{ fontSize: 16, color: "#888" }} aria-hidden/>
          </button>
        </div>

        {/* VIDEO SECTION — only for step 0 */}
        {step.hasVideo && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#555" }}>
              <i className="ti ti-player-play" style={{ marginRight: 5, color: "#7B6FE8" }} aria-hidden/>
              추천 그림 연습 강좌 목록
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {SAMPLE_VIDEOS.map(v => (
                <VideoCard key={v.title} v={v} selected={selectedVideo?.title === v.title} onSelect={setSelectedVideo}/>
              ))}
            </div>
            {selectedVideo && (
              <div style={{ background: "#f0effe", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <i className="ti ti-external-link" style={{ fontSize: 20, color: "#7B6FE8", flexShrink: 0 }} aria-hidden/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#333",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedVideo.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#7B6FE8" }}>유튜브에서 실제 강좌 시청하기</p>
                </div>
                <a href={selectedVideo.url} target="_blank" rel="noreferrer"
                  style={{ background: "#7B6FE8", color: "#fff", borderRadius: 8, padding: "8px 16px",
                    fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                  영상 보러 가기
                </a>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST — 세부 항목이 각각 따로 클릭되도록 수정 완료 */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#555" }}>
            <i className="ti ti-checklist" style={{ marginRight: 5, color: "#7B6FE8" }} aria-hidden/>
            세부 체크리스트 (항목을 직접 누르면 체크됩니다)
          </p>
          <div style={{ background: "#f8f7ff", borderRadius: 10, padding: "12px 16px", border: "1px solid #e8e6fb" }}>
            {step.checklist.map((item, i) => {
              const itemDone = stepChecks[i];
              return (
                <div key={i} 
                  onClick={() => onToggleItem(i)}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    padding: "8px 0", borderBottom: i < step.checklist.length-1 ? "1px solid #ede9fb" : "none" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, 
                    background: itemDone ? "#7B6FE8" : "transparent",
                    border: itemDone ? "2px solid #7B6FE8" : "2px solid #d0ceee",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                    {itemDone && <i className="ti ti-check" style={{ color: "#fff", fontSize: 10 }} aria-hidden/>}
                  </div>
                  <span style={{ fontSize: 13, color: itemDone ? "#7B6FE8" : "#666", textDecoration: itemDone ? "line-through" : "none", transition: "all .15s" }}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MEMO */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#555" }}>
            <i className="ti ti-notes" style={{ marginRight: 5, color: "#7B6FE8" }} aria-hidden/>
            이 단계 메모
          </p>
          <textarea value={memo} onChange={e => onMemo(e.target.value)}
            placeholder={`${step.label} 단계에서 느낀 점을 적어보세요...`}
            style={{
              width: "100%", minHeight: 80, padding: "10px 12px", fontSize: 13,
              border: "1px solid #e8e6fb", borderRadius: 8, resize: "vertical",
              fontFamily: "inherit", outline: "none", background: "#faf9ff",
              color: "#555", boxSizing: "border-box",
            }}/>
        </div>

        {/* Action */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, background: "#f5f4fb", color: "#888", border: "none", borderRadius: 8,
              padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            닫기
          </button>
          <button onClick={() => { onToggleAll(); onClose(); }}
            style={{
              flex: 2, background: isAllDone ? "#e8e6fb" : "#7B6FE8",
              color: isAllDone ? " #7B6FE8" : "#fff", border: "none", borderRadius: 8,
              padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s",
            }}>
            {isAllDone ? "✓ 전체 완료 취소하기" : `${idx+1}단계 모든 항목 일괄 완료`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DrawStep() {
  const [data, setData] = useState(load);
  const [page, setPage] = useState("home");
  const [openStep, setOpenStep] = useState<number | null>(null); 
  const [sessionStart] = useState(Date.now());
  const [toast, setToast] = useState("");

  useEffect(() => { save(data); }, [data]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2200); }

  // 세부 항목 단위로 체크 상태 토글 기능 추가
  function toggleStepItem(stepIdx: number, itemIdx: number) {
    setData(prev => {
      const nextChecks = prev.checks.map((stepArr: boolean[], sIdx: number) => {
        if (sIdx === stepIdx) {
          const nextStepArr = [...stepArr];
          nextStepArr[itemIdx] = !nextStepArr[itemIdx];
          return nextStepArr;
        }
        return stepArr;
      });
      return { ...prev, checks: nextChecks };
    });
  }

  // 기존 단계 통째로 완료/취소하는 마스터 버튼용 로직 유지
  function toggleStepAll(stepIdx: number) {
    setData(prev => {
      const isCurrentlyAllDone = prev.checks[stepIdx].every(Boolean);
      const nextChecks = prev.checks.map((stepArr: boolean[], sIdx: number) => {
        if (sIdx === stepIdx) {
          return stepArr.map(() => !isCurrentlyAllDone);
        }
        return stepArr;
      });
      return { ...prev, checks: nextChecks };
    });
  }

  function setStepMemo(idx: number, val: string) {
    setData(prev => {
      const m = [...prev.stepMemos]; m[idx] = val;
      return { ...prev, stepMemos: m };
    });
  }

  function finishSession() {
    const mins = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
    const today = new Date().toISOString().slice(0, 10);
    const combinedMemo = data.stepMemos.filter(Boolean).join(" / ") || data.globalMemo;
    const entry = {
      date: new Date().toISOString(),
      progress: pct(data.checks),
      memo: combinedMemo,
      steps: STEPS.filter((_, i) => isStepAllDone(data.checks, i)).map(s => s.label),
      duration: mins,
    };
    setData(prev => {
      const isYesterday = prev.lastDate === new Date(Date.now()-86400000).toISOString().slice(0,10);
      const isToday = prev.lastDate === today;
      const streak = isYesterday ? prev.streak+1 : isToday ? prev.streak : 1;
      return {
        ...prev,
        history: [entry, ...prev.history].slice(0, 30),
        totalSessions: prev.totalSessions + 1,
        totalTime: prev.totalTime + mins,
        streak, lastDate: today,
        checks: STEPS.map(s => s.checklist.map(() => false)),
        stepMemos: ["","","","","",""],
        globalMemo: "",
      };
    });
    showToast("✓ 학습이 기록되었어요!");
    setTimeout(() => setPage("history"), 1000);
  }

  const progress = pct(data.checks);
  const doneCount = getDoneStepCount(data.checks);

  const navItems = [
    { id: "home",     icon: "ti-home",    label: "홈" },
    { id: "learn",    icon: "ti-school",  label: "오늘의 학습" },
    { id: "record",   icon: "ti-notes",   label: "나의 기록" },
    { id: "history",  icon: "ti-history", label: "학습 기록" },
    { id: "settings", icon: "ti-settings",label: "설정" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Noto Sans KR',sans-serif", background: "#f5f4fb", fontSize: 14 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" rel="stylesheet"/>

      {/* ── Sidebar ── */}
      <aside style={{ width: 168, background: "#fff", borderRight: "1px solid #eeedf8",
        display: "flex", flexDirection: "column", padding: "20px 0", gap: 2, flexShrink: 0 }}>
        <div style={{ padding: "0 16px 18px", borderBottom: "1px solid #f0effe", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#7B6FE8",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-pencil" style={{ color: "#fff", fontSize: 14 }} aria-hidden/>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#333" }}>DrawStep</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#bbb" }}>나만의 그림 학습법</p>
        </div>

        {navItems.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{
              display: "flex", alignItems: "center", gap: 9, padding: "9px 16px",
              background: page === n.id ? "#f0effe" : "transparent",
              border: "none", cursor: "pointer",
              color: page === n.id ? "#7B6FE8" : "#888",
              fontWeight: page === n.id ? 600 : 400,
              fontSize: 13, textAlign: "left", transition: "background .15s",
            }}>
            <i className={`ti ${n.icon}`} style={{ fontSize: 17 }} aria-hidden/>
            {n.label}
          </button>
        ))}
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: "auto" }}>

        {/* ═══ HOME ═══ */}
        {page === "home" && (
          <div style={{ padding: "28px 28px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Welcome */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eeedf8" }}>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: "#333" }}>안녕하세요, 장경준님! 👋</p>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: "#999" }}>오늘도 그림 학습 성공해봐요!</p>
                <div style={{ background: "#f8f7ff", borderRadius: 10, padding: "18px 20px", textAlign: "center", marginBottom: 20, border: "1px solid #e8e6fb" }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15, color: "#333" }}>오늘의 그림 시작하기!</p>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "#aaa" }}>"마무리는 손보다 눈이 먼저 완성된 것을 알아본다"</p>
                  <button onClick={() => setPage("learn")}
                    style={{ background: "#7B6FE8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    시작하기
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "연속 학습", val: `${data.streak}일` },
                    { label: "완성한 그림", val: `${data.totalSessions}개` },
                    { label: "총 학습 시간", val: fmtTime(data.totalTime) },
                    { label: "진행률", ring: true },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      {s.ring
                        ? <Ring p={progress} size={44}/>
                        : <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "#333" }}>{s.val}</p>}
                      <p style={{ margin: s.ring ? "4px 0 0" : 0, fontSize: 10, color: "#aaa" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step checklist */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eeedf8" }}>
                <div style={{ display: "flex", alignItems: "center", justifyValue: "space-between", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#555" }}>오늘의 학습 단계</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
                    <ProgressBar p={progress}/>
                    <span style={{ fontSize: 12, color: "#7B6FE8", fontWeight: 600, minWidth: 36, textAlign: "right" }}>{doneCount}/6 단계</span>
                  </div>
                </div>
                {STEPS.map((step, idx) => {
                  const done = isStepAllDone(data.checks, idx);
                  const unlocked = idx === 0 || isStepAllDone(data.checks, idx-1);
                  return (
                    <div key={idx}
                      onClick={() => { if (unlocked) setOpenStep(idx); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "8px 6px", borderRadius: 8, marginBottom: 2,
                        cursor: unlocked ? "pointer" : "default",
                        opacity: unlocked ? 1 : 0.38,
                        background: "transparent",
                        transition: "background .1s",
                      }}
                      onMouseEnter={e => unlocked && (e.currentTarget.style.background = "#f8f7ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: done ? "#7B6FE8" : "transparent",
                        border: done ? "2px solid #7B6FE8" : "2px solid #d0ceee",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .2s",
                      }}>
                        {done && <i className="ti ti-check" style={{ color: "#fff", fontSize: 11 }} aria-hidden/>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: done ? "#7B6FE8" : "#444",
                          fontWeight: done ? 600 : 400, textDecoration: done ? "line-through" : "none",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {idx+1}단계. {step.label}
                        </p>
                      </div>
                      {unlocked && !done && <i className="ti ti-chevron-right" style={{ color: "#ccc", fontSize: 14, flexShrink: 0 }} aria-hidden/>}
                      {done && <i className="ti ti-circle-check-filled" style={{ color: "#7B6FE8", fontSize: 16, flexShrink: 0 }} aria-hidden/>}
                    </div>
                  );
                })}

                {progress === 100 && (
                  <button onClick={finishSession}
                    style={{ width: "100%", marginTop: 12, background: "#7B6FE8", color: "#fff",
                      border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    🎉 학습 기록 저장하기
                  </button>
                )}
              </div>
            </div>

            {/* Current active step hint */}
            {progress < 100 && (() => {
              const cur = data.checks.findIndex((stepArr: boolean[]) => !stepArr.every(Boolean));
              if (cur === -1) return null;
              const step = STEPS[cur];
              return (
                <div style={{ background: "#fff", borderRadius: 12, padding: "18px 24px",
                  border: "1px solid #e8e6fb", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0effe",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${step.icon}`} style={{ fontSize: 22, color: "#7B6FE8" }} aria-hidden/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, color: "#aaa" }}>현재 진행 중인 단계 ({cur+1}/6)</p>
                    <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#333" }}>{step.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{step.desc}</p>
                  </div>
                  <button onClick={() => setOpenStep(cur)}
                    style={{ background: "#7B6FE8", color: "#fff", border: "none", borderRadius: 8,
                      padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                    단계 열기
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ LEARN ═══ */}
        {page === "learn" && (
          <div style={{ padding: "28px 28px 40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#333" }}>오늘의 학습</h1>
                <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>단계를 클릭하면 상세 세부 항목들을 체크할 수 있어요</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Ring p={progress} size={58}/>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#aaa" }}>전체 진행률</p>
                  <ProgressBar p={progress}/>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7B6FE8", fontWeight: 600 }}>{doneCount}/6 단계 완료</p>
                </div>
              </div>
            </div>

            {/* Step list — 모든 6단계 표시 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {STEPS.map((step, idx) => {
                const done = isStepAllDone(data.checks, idx);
                const unlocked = idx === 0 || isStepAllDone(data.checks, idx-1);
                return (
                  <div key={idx}
                    onClick={() => unlocked && setOpenStep(idx)}
                    style={{
                      background: "#fff", borderRadius: 12,
                      border: done ? "1.5px solid #b8b2f0" : "1px solid #eeedf8",
                      padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                      cursor: unlocked ? "pointer" : "default",
                      opacity: unlocked ? 1 : 0.4, transition: "border .2s, transform .1s",
                    }}
                    onMouseEnter={e => unlocked && (e.currentTarget.style.transform = "translateY(-1px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>

                    {/* number badge */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: done ? "#7B6FE8" : unlocked ? "#f0effe" : "#f0f0f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {done
                        ? <i className="ti ti-check" style={{ color: "#fff", fontSize: 18 }} aria-hidden/>
                        : <span style={{ fontSize: 14, fontWeight: 700, color: unlocked ? "#7B6FE8" : "#bbb" }}>{idx+1}</span>}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 600,
                        color: done ? "#7B6FE8" : "#333", textDecoration: done ? "line-through" : "none" }}>
                        {step.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#aaa",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {step.desc}
                      </p>
                    </div>

                    {step.hasVideo && unlocked && !done && (
                      <span style={{ fontSize: 11, background: "#fff0e8", color: "#e0793a",
                        padding: "3px 9px", borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>
                        강좌 포함
                      </span>
                    )}
                    {data.stepMemos[idx] && (
                      <i className="ti ti-notes" style={{ fontSize: 16, color: "#b8b2f0", flexShrink: 0 }} aria-hidden/>
                    )}
                    {unlocked
                      ? <i className="ti ti-chevron-right" style={{ color: "#ccc", fontSize: 16, flexShrink: 0 }} aria-hidden/>
                      : <i className="ti ti-lock" style={{ color: "#ddd", fontSize: 16, flexShrink: 0 }} aria-hidden/>}
                  </div>
                );
              })}
            </div>

            {progress === 100 && (
              <div style={{ background: "#e8f8f0", border: "1px solid #a7dfc4", borderRadius: 12, padding: 24, textAlign: "center" }}>
                <i className="ti ti-trophy" style={{ fontSize: 40, color: "#1a9e6e", display: "block", marginBottom: 8 }} aria-hidden/>
                <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1a9e6e" }}>모든 단계 완료! 🎉</p>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#2dc88e" }}>오늘 그림 완성을 축하해요!</p>
                <button onClick={finishSession}
                  style={{ background: "#1a9e6e", color: "#fff", border: "none", borderRadius: 8, padding: "11px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  학습 기록 저장
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ RECORD ═══ */}
        {page === "record" && (
          <div style={{ padding: "28px 28px 40px", maxWidth: 700 }}>
            <h1 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#333" }}>나의 기록</h1>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eeedf8", marginBottom: 18 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#333" }}>오늘 학습 현황</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <Ring p={progress} size={72}/>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: "#555" }}>{doneCount}/{STEPS.length} 단계 전체 완료</p>
                  <ProgressBar p={progress}/>
                </div>
              </div>
              {STEPS.map((step, idx) => {
                const stepDone = isStepAllDone(data.checks, idx);
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%",
                      background: stepDone ? "#7B6FE8" : "#e0dff5", flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: stepDone ? "#7B6FE8" : "#aaa",
                      textDecoration: stepDone ? "line-through" : "none", flex: 1 }}>
                      {step.label}
                    </span>
                    {data.stepMemos[idx] && (
                      <span style={{ fontSize: 11, color: "#bbb", maxWidth: 160,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {data.stepMemos[idx]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eeedf8" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: "#333" }}>전체 메모</h2>
              <textarea value={data.globalMemo} onChange={e => setData(d => ({ ...d, globalMemo: e.target.value }))}
                placeholder="오늘 연습 전체적인 느낀 점을 적어보세요..."
                style={{ width: "100%", minHeight: 100, padding: "10px 12px", fontSize: 13,
                  border: "1px solid #e8e6fb", borderRadius: 8, resize: "vertical",
                  fontFamily: "inherit", outline: "none", background: "#faf9ff",
                  color: "#555", boxSizing: "border-box" }}/>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#bbb" }}>자동 저장됩니다</p>
            </div>
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {page === "history" && (
          <div style={{ padding: "28px 28px 40px", maxWidth: 700 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>학습 기록</h1>
              <span style={{ fontSize: 13, color: "#aaa" }}>총 {data.history.length}회</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "연속 학습", val: `${data.streak}일`, icon: "ti-flame", c: "#FF8B3D" },
                { label: "총 완성", val: `${data.totalSessions}개`, icon: "ti-photo", c: "#7B6FE8" },
                { label: "총 학습 시간", val: fmtTime(data.totalTime), icon: "ti-clock", c: "#2dc88e" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px",
                  border: "1px solid #eeedf8", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.c}18`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.c }} aria-hidden/>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "#aaa" }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#333" }}>{s.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "0 20px", border: "1px solid #eeedf8" }}>
              {data.history.length === 0
                ? <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <i className="ti ti-notes" style={{ fontSize: 40, color: "#e0dff5", display: "block", marginBottom: 12 }} aria-hidden/>
                    <p style={{ margin: "0 0 4px", color: "#bbb", fontSize: 14 }}>아직 기록이 없어요.</p>
                    <button onClick={() => setPage("learn")}
                      style={{ background: "#7B6FE8", color: "#fff", border: "none", borderRadius: 8,
                        padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 12 }}>
                      학습 시작하기
                    </button>
                  </div>
                : data.history.map((entry: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 0", borderBottom: i < data.history.length-1 ? "1px solid #f0effe" : "none" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f0effe",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="ti ti-photo" style={{ fontSize: 20, color: "#7B6FE8" }} aria-hidden/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#333" }}>
                          {fmtDate(entry.date)} 그림 연습
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          {entry.steps.slice(0,3).map((s: string, j: number) => (
                            <span key={j} style={{ fontSize: 10, background: "#f0effe", color: "#7B6FE8",
                              padding: "2px 7px", borderRadius: 20 }}>{s}</span>
                          ))}
                          {entry.steps.length > 3 && (
                            <span style={{ fontSize: 10, color: "#bbb" }}>+{entry.steps.length-3}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#7B6FE8" }}>{entry.progress}%</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>{fmtTime(entry.duration)}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {page === "settings" && (
          <div style={{ padding: "28px 28px 40px", maxWidth: 560 }}>
            <h1 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#333" }}>설정</h1>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eeedf8" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#333" }}>학습 데이터 초기화</p>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "#aaa" }}>모든 학습 기록과 진행 상황이 삭제됩니다.</p>
              <button onClick={() => { if (confirm("모든 데이터를 삭제할까요?")) { setData(INIT); showToast("초기화되었어요"); }}}
                style={{ background: "#fff0f0", color: "#e05050", border: "1px solid #f5c0c0",
                  borderRadius: 8, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                데이터 초기화
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ═══ Step Modal ═══ */}
      {openStep !== null && (
        <StepModal
          step={STEPS[openStep]}
          idx={openStep}
          stepChecks={data.checks[openStep]}
          memo={data.stepMemos[openStep]}
          onMemo={val => setStepMemo(openStep, val)}
          onToggleItem={itemIdx => toggleStepItem(openStep, itemIdx)}
          onToggleAll={() => toggleStepAll(openStep)}
          onClose={() => setOpenStep(null)}
          data={data}
        />
      )}

      {/* ═══ Toast ═══ */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#333", color: "#fff", borderRadius: 10, padding: "11px 24px",
          fontSize: 13, fontWeight: 600, zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}