import { useState } from "react";

const SEASONS = {
  "12": "зима", "1": "зима", "2": "зима",
  "3": "весна", "4": "весна", "5": "весна",
  "6": "лето", "7": "лето", "8": "лето",
  "9": "осень", "10": "осень", "11": "осень"
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
  { code: "RUB", symbol: "₽", name: "Рубль" },
  { code: "GBP", symbol: "£", name: "Фунт стерлингов" },
  { code: "AED", symbol: "د.إ", name: "Дирхам ОАЭ" },
  { code: "TRY", symbol: "₺", name: "Турецкая лира" },
  { code: "GEL", symbol: "₾", name: "Грузинский лари" },
  { code: "THB", symbol: "฿", name: "Тайский бат" },
];

const CATEGORY_CONFIG = {
  flights:    { icon: "✈️", name: "Перелёты",    color: "#6ee7f7" },
  hotel:      { icon: "🏨", name: "Проживание",  color: "#f9d976" },
  transport:  { icon: "🚌", name: "Транспорт",   color: "#a78bfa" },
  food:       { icon: "🍽️", name: "Питание",     color: "#f39f86" },
  activities: { icon: "🎭", name: "Развлечения", color: "#6ee7b7" },
  misc:       { icon: "💼", name: "Прочее",      color: "#94a3b8" },
};

// Источники данных для каждого типа поездки
const SOURCES_INDEPENDENT = [
  { name: "Aviasales", url: "aviasales.ru", icon: "✈️", desc: "авиабилеты" },
  { name: "Booking.com", url: "booking.com", icon: "🏨", desc: "отели" },
  { name: "Airbnb", url: "airbnb.com", icon: "🏠", desc: "апартаменты" },
  { name: "Numbeo", url: "numbeo.com", icon: "💰", desc: "стоимость жизни" },
  { name: "TripAdvisor", url: "tripadvisor.com", icon: "🎭", desc: "развлечения" },
  { name: "Rome2Rio", url: "rome2rio.com", icon: "🚌", desc: "транспорт" },
];

const SOURCES_TOUR = [
  { name: "Tez Tour", url: "tez-tour.com", icon: "🌴", desc: "туроператор" },
  { name: "Coral Travel", url: "coral.ru", icon: "🐚", desc: "туроператор" },
  { name: "Anex Tour", url: "anextour.com", icon: "🌍", desc: "туроператор" },
  { name: "Pegas Touristik", url: "pegast.ru", icon: "🦅", desc: "туроператор" },
  { name: "Level.Travel", url: "level.travel", icon: "📦", desc: "пакетные туры" },
  { name: "Onlinetours", url: "onlinetours.ru", icon: "💻", desc: "пакетные туры" },
];

function DonutChart({ data, total }) {
  const size = 180, cx = 90, cy = 90, R = 72, r = 46;
  let cumAngle = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cumAngle), y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle), y2 = cy + R * Math.sin(cumAngle);
    const ix1 = cx + r * Math.cos(cumAngle), iy1 = cy + r * Math.sin(cumAngle);
    const ix2 = cx + r * Math.cos(cumAngle - angle), iy2 = cy + r * Math.sin(cumAngle - angle);
    const large = angle > Math.PI ? 1 : 0;
    return { ...d, path: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z` };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.9" stroke="rgba(15,12,41,0.6)" strokeWidth="1.5"/>)}
      <circle cx={cx} cy={cy} r={r - 2} fill="rgba(15,12,41,0.85)"/>
    </svg>
  );
}

function BarRow({ label, icon, color, pct, formatted }) {
  return (
    <div style={{ marginBottom: "13px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "rgba(240,236,228,0.75)" }}>{icon} {label}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color }}>{formatted}</span>
          <span style={{ fontSize: "10px", color: "rgba(240,236,228,0.3)", minWidth: "28px", textAlign: "right" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 1s ease" }}/>
      </div>
    </div>
  );
}

export default function TravelCalculator() {
  const [form, setForm] = useState({
    destination: "", departureCity: "", startDate: "", endDate: "",
    people: 2, budget_class: "economy", currency: "USD", travel_type: "independent"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const getDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    return Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000));
  };
  const getSeason = () => {
    if (!form.startDate) return "";
    return SEASONS[String(new Date(form.startDate).getMonth() + 1)] || "";
  };

  const extractJSON = (text) => {
    const results = [];
    let depth = 0, start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') { if (depth === 0) start = i; depth++; }
      else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) { results.push(text.slice(start, i + 1)); start = -1; }
      }
    }
    results.sort((a, b) => b.length - a.length);
    for (const c of results) {
      try { const p = JSON.parse(c); if (p && p.categories) return p; } catch (e) {}
    }
    return null;
  };

  const calculate = async () => {
    if (!form.destination || !form.startDate || !form.endDate || !form.departureCity) {
      setError("Заполните все поля"); return;
    }
    setLoading(true); setError(null); setResult(null); setDebugInfo("");
    setStatusText("🔍 Ищу актуальные цены...");

    const days = getDays();
    const season = getSeason();
    const budgetClass = form.budget_class === "economy" ? "эконом" : form.budget_class === "comfort" ? "комфорт" : "люкс";
    const nPeople = form.people;
    const cur = form.currency;
    const isIndependent = form.travel_type === "independent";

    const sourcesHint = isIndependent
      ? "Ищи цены на: Aviasales/Skyscanner (авиабилеты), Booking.com/Airbnb (отели), Numbeo (стоимость жизни), TripAdvisor (развлечения), Rome2Rio (транспорт)."
      : "Ищи цены на пакетные туры у туроператоров: Tez Tour, Coral Travel, Anex Tour, Pegas Touristik, Level.Travel, Onlinetours. Учитывай что пакетные туры включают перелёт+отель+трансфер в одной цене (чартеры дешевле регулярных рейсов).";

    const typeDesc = isIndependent
      ? "самостоятельное путешествие (турист сам покупает билеты, бронирует отель, организует транспорт)"
      : "тур через туроператора (пакетный тур: чартерный перелёт + отель + трансферы включены, экскурсии отдельно)";

    // Для туроператоров — используем знания модели + 1 поиск для актуальности
    // Для самостоятельных — полный веб-поиск
    const searchInstruction = isIndependent
      ? "Сделай 2-3 веб-поиска для актуальных цен на билеты и отели."
      : "Используй свои знания о ценах туроператоров. Сделай максимум 1 веб-поиск если нужно уточнить цену тура.";

    const prompt = `Ты — эксперт по туризму. Отвечай ТОЛЬКО на русском языке. Составь бюджет поездки.
ПАРАМЕТРЫ: из ${form.departureCity} в ${form.destination}, ${form.startDate} — ${form.endDate} (${days} дней), сезон: ${season}, туристов: ${nPeople}, класс: ${budgetClass}.
ТИП ПОЕЗДКИ: ${typeDesc}.
${searchInstruction}
Все суммы в валюте ${cur}. Используй реальные актуальные цены 2024-2025.
В поле "sources" укажи сайты-источники цен (название + URL).
Верни ТОЛЬКО валидный JSON без лишнего текста:
{"destination":"...","summary":"...","travel_type":"${form.travel_type}","currency":"${cur}","sources":[{"name":"Aviasales","url":"aviasales.ru","category":"авиабилеты"},{"name":"Booking.com","url":"booking.com","category":"отели"}],"categories":{"flights":{"total":500,"perPerson":250,"details":"..."},"hotel":{"total":400,"perPerson":200,"details":"..."},"transport":{"total":100,"perPerson":50,"details":"..."},"food":{"total":200,"perPerson":100,"details":"..."},"activities":{"total":150,"perPerson":75,"details":"..."},"misc":{"total":80,"perPerson":40,"details":"..."}},"grandTotal":1430,"grandTotalPerPerson":715,"tips":["...","...","..."],"bestTime":"...","warnings":["..."]}
Замени все числа на реальные. grandTotal = сумма всех total. grandTotalPerPerson = grandTotal / ${nPeople}.`;

    // Таймер отображения времени ожидания
    let elapsed = 0;
    const ticker = setInterval(() => {
      elapsed += 1;
      setStatusText(`⏳ Анализирую... ${elapsed} сек`);
    }, 1000);

    // AbortController — таймаут 70 секунд
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000);

    try {
      setStatusText("🌐 Отправляю запрос...");
      let response;
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2500,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: prompt }]
          })
        });
      } catch (fetchErr) {
        if (fetchErr.name === "AbortError") {
          throw new Error("Превышено время ожидания (70 сек). Попробуйте ещё раз или смените тип поездки.");
        }
        throw new Error("Ошибка сети: " + fetchErr.message);
      }

      setStatusText("📥 Получаю ответ...");
      const data = await response.json();
      if (!response.ok || data.error) {
        const msg = data?.error?.message || `HTTP ${response.status}`;
        setDebugInfo("API Error: " + msg);
        throw new Error(msg);
      }

      setStatusText("✅ Обрабатываю данные...");
      const rawText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setDebugInfo("Длина: " + rawText.length + " симв. Начало: " + rawText.slice(0, 120));
      if (!rawText) throw new Error("Пустой ответ. Попробуйте ещё раз.");

      let parsed = extractJSON(rawText);
      if (!parsed) throw new Error("Не удалось разобрать JSON. Отладка: " + rawText.slice(0, 200));

      if (!parsed.grandTotal && parsed.categories)
        parsed.grandTotal = Object.values(parsed.categories).reduce((s, c) => s + (Number(c.total) || 0), 0);
      if (!parsed.grandTotalPerPerson)
        parsed.grandTotalPerPerson = (parsed.grandTotal || 0) / nPeople;

      // Fallback sources if AI didn't provide them
      if (!parsed.sources || parsed.sources.length === 0) {
        parsed.sources = isIndependent ? SOURCES_INDEPENDENT : SOURCES_TOUR;
      }

      setResult({ ...parsed, days, people: nPeople, currency: cur, travel_type: form.travel_type });
      setDebugInfo("");
      setActiveTab("dashboard");
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      clearInterval(ticker);
      clearTimeout(timeoutId);
      setLoading(false); setStatusText("");
    }
  };

  const fmt = (num, cur) => {
    if (!num) return "0";
    const c = CURRENCIES.find(x => x.code === (cur || form.currency)) || CURRENCIES[0];
    return c.symbol + Math.round(num).toLocaleString("ru-RU");
  };

  const chartData = result ? Object.entries(result.categories || {}).map(([key, cat]) => ({
    key, value: cat.total || 0,
    color: CATEGORY_CONFIG[key]?.color || "#888",
    name: CATEGORY_CONFIG[key]?.name || key,
    icon: CATEGORY_CONFIG[key]?.icon || "💡",
  })).filter(d => d.value > 0) : [];

  const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: "9px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#f0ece4", fontSize: "13px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: "10px", color: "rgba(240,236,228,0.45)", letterSpacing: "1px", display: "block", marginBottom: "5px" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Georgia', serif", color: "#f0ece4" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "28px" }}>🌍</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "700", background: "linear-gradient(90deg, #f9d976, #f39f86)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TravelBudget AI</div>
            <div style={{ fontSize: "10px", color: "rgba(240,236,228,0.4)", letterSpacing: "1px" }}>УМНЫЙ КАЛЬКУЛЯТОР ПУТЕШЕСТВИЙ</div>
          </div>
        </div>
        {result && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "10px", color: "rgba(240,236,228,0.35)", marginRight: "4px" }}>ДАННЫЕ ИЗ:</span>
            {(result.sources || []).slice(0, 5).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "3px 10px" }}>
                <span style={{ fontSize: "11px" }}>{s.icon || "🔗"}</span>
                <span style={{ fontSize: "11px", color: "rgba(240,236,228,0.7)", fontFamily: "monospace" }}>{s.name || s.url}</span>
              </div>
            ))}
            {(result.sources || []).length > 5 && (
              <div style={{ fontSize: "10px", color: "rgba(240,236,228,0.35)" }}>+{result.sources.length - 5} ещё</div>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "24px 18px" }}>

        {/* ── FORM ── */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>

          {/* Travel type toggle */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "22px" }}>
            {[
              ["independent", "🎒", "Самостоятельное путешествие", "Сам покупаю билеты, бронирую отель, организую маршрут"],
              ["tour", "📦", "Тур через туроператора", "Пакетный тур: чартер + отель + трансфер включены"]
            ].map(([val, icon, title, desc]) => (
              <button key={val} onClick={() => setForm({...form, travel_type: val})}
                style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: "2px solid", textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                  borderColor: form.travel_type === val ? (val === "independent" ? "#6ee7b7" : "#f9d976") : "rgba(255,255,255,0.1)",
                  background: form.travel_type === val ? (val === "independent" ? "rgba(110,231,183,0.08)" : "rgba(249,217,118,0.08)") : "rgba(255,255,255,0.03)"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "20px" }}>{icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: form.travel_type === val ? (val === "independent" ? "#6ee7b7" : "#f9d976") : "rgba(240,236,228,0.7)" }}>{title}</span>
                  {form.travel_type === val && <span style={{ marginLeft: "auto", fontSize: "14px" }}>✓</span>}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(240,236,228,0.38)", lineHeight: "1.4", paddingLeft: "28px" }}>{desc}</div>
              </button>
            ))}
          </div>

          {/* Source chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "10px", color: "rgba(240,236,228,0.3)", letterSpacing: "1px", alignSelf: "center", marginRight: "4px" }}>ИСТОЧНИКИ ЦЕН:</span>
            {(form.travel_type === "independent" ? SOURCES_INDEPENDENT : SOURCES_TOUR).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "2px 9px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "10px" }}>{s.icon}</span>
                <span style={{ fontSize: "10px", color: "rgba(240,236,228,0.55)" }}>{s.name}</span>
                <span style={{ fontSize: "9px", color: "rgba(240,236,228,0.25)" }}>· {s.desc}</span>
              </div>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>ОТКУДА</label>
              <input value={form.departureCity} onChange={e => setForm({...form, departureCity: e.target.value})} placeholder="Москва..." style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>КУДА</label>
              <input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="Тбилиси, Париж..." style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>ВАЛЮТА</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(240,236,228,0.4)'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code} style={{ background: "#1a1630" }}>{c.symbol} {c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ДАТА ОТЪЕЗДА</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} style={{ ...inputStyle, colorScheme: "dark" }}/>
            </div>
            <div>
              <label style={labelStyle}>ДАТА ВОЗВРАЩЕНИЯ</label>
              <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} style={{ ...inputStyle, colorScheme: "dark" }}/>
            </div>
            <div>
              <label style={labelStyle}>ТУРИСТОВ И КЛАСС</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9px", padding: "5px 10px" }}>
                  <button onClick={() => setForm({...form, people: Math.max(1, form.people-1)})} style={{ background: "none", border: "none", color: "#f9d976", fontSize: "16px", cursor: "pointer" }}>−</button>
                  <span style={{ fontSize: "16px", fontWeight: "700", minWidth: "18px", textAlign: "center" }}>{form.people}</span>
                  <button onClick={() => setForm({...form, people: Math.min(20, form.people+1)})} style={{ background: "none", border: "none", color: "#f9d976", fontSize: "16px", cursor: "pointer" }}>+</button>
                </div>
                <div style={{ display: "flex", gap: "4px", flex: 1 }}>
                  {[["economy","💰"],["comfort","⭐"],["luxury","👑"]].map(([v,l]) => (
                    <button key={v} onClick={() => setForm({...form, budget_class: v})}
                      style={{ flex:1, padding:"7px 4px", borderRadius:"7px", border:"1px solid", borderColor: form.budget_class===v?"#f9d976":"rgba(255,255,255,0.12)", background: form.budget_class===v?"rgba(249,217,118,0.15)":"rgba(255,255,255,0.04)", color: form.budget_class===v?"#f9d976":"rgba(240,236,228,0.45)", fontSize:"12px", cursor:"pointer" }}>{l}</button>
                  ))}
                </div>
              </div>
              {form.startDate && form.endDate && getDays() > 0 &&
                <div style={{ fontSize: "10px", color: "rgba(240,236,228,0.3)", marginTop: "4px" }}>📅 {getDays()} дней · {getSeason()}</div>}
            </div>
          </div>

          {error && <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:"8px", color:"#ff8080", fontSize:"12px" }}>⚠️ {error}</div>}
          {debugInfo && <div style={{ marginTop:"8px", padding:"8px 12px", background:"rgba(0,200,255,0.06)", border:"1px solid rgba(0,200,255,0.18)", borderRadius:"7px", color:"rgba(0,220,255,0.7)", fontSize:"10px", fontFamily:"monospace", wordBreak:"break-all" }}>🐛 {debugInfo}</div>}

          <button onClick={calculate} disabled={loading} style={{ marginTop:"20px", width:"100%", padding:"14px", background: loading?"rgba(249,217,118,0.2)":"linear-gradient(90deg,#f9d976,#f39f86)", border:"none", borderRadius:"11px", color:"#1a1630", fontSize:"14px", fontWeight:"700", cursor: loading?"not-allowed":"pointer" }}>
            {loading ? statusText || "⏳ Анализирую..." : `🚀 Рассчитать бюджет — ${form.travel_type === "independent" ? "Самостоятельная поездка" : "Пакетный тур"}`}
          </button>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* Summary + Sources banner */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"16px 20px", marginBottom:"16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                <span style={{ fontSize:"12px", color:"rgba(240,236,228,0.4)", letterSpacing:"1px" }}>ДАННЫЕ СОБРАНЫ С САЙТОВ:</span>
                <span style={{ fontSize:"11px", color: result.travel_type==="independent"?"#6ee7b7":"#f9d976", background: result.travel_type==="independent"?"rgba(110,231,183,0.1)":"rgba(249,217,118,0.1)", padding:"2px 8px", borderRadius:"10px" }}>
                  {result.travel_type==="independent"?"🎒 Самостоятельно":"📦 Туроператор"}
                </span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {(result.sources || []).map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:"5px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"18px", padding:"4px 11px" }}>
                    <span style={{ fontSize:"12px" }}>{s.icon || "🔗"}</span>
                    <span style={{ fontSize:"12px", fontWeight:"600", color:"rgba(240,236,228,0.8)" }}>{s.name || s.url}</span>
                    {s.category && <span style={{ fontSize:"10px", color:"rgba(240,236,228,0.3)" }}>· {s.category}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div style={{ background:"rgba(249,217,118,0.07)", border:"1px solid rgba(249,217,118,0.18)", borderRadius:"16px", padding:"18px 22px", marginBottom:"16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
              <div>
                <div style={{ fontSize:"17px", fontWeight:"700", marginBottom:"3px" }}>🗺️ {result.destination}</div>
                <div style={{ fontSize:"11px", color:"rgba(240,236,228,0.4)" }}>{result.days} дней · {result.people} чел · {result.currency}</div>
              </div>
              <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
                {[["ИТОГО", result.grandTotal, "38px", "linear-gradient(90deg,#f9d976,#f39f86)"],["НА ЧЕЛОВЕКА", result.grandTotalPerPerson, "24px", "#f9d976"],["В ДЕНЬ/ЧЕЛ", result.grandTotalPerPerson/result.days, "24px", "#f39f86"]].map(([label, val, size, color], i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"10px", color:"rgba(240,236,228,0.35)", marginBottom:"2px" }}>{label}</div>
                    <div style={{ fontSize:size, fontWeight:"700", background: color.includes("gradient") ? color : undefined, color: color.includes("gradient") ? undefined : color, WebkitBackgroundClip: color.includes("gradient") ? "text" : undefined, WebkitTextFillColor: color.includes("gradient") ? "transparent" : undefined }}>{fmt(val, result.currency)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"14px" }}>
              {[["dashboard","📊 Дашборд"],["details","📋 По категориям"],["sources","🔗 Источники"],["tips","💡 Советы"]].map(([tab,label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding:"8px 15px", borderRadius:"9px", border:"1px solid", borderColor: activeTab===tab?"#f9d976":"rgba(255,255,255,0.1)", background: activeTab===tab?"rgba(249,217,118,0.1)":"rgba(255,255,255,0.03)", color: activeTab===tab?"#f9d976":"rgba(240,236,228,0.45)", fontSize:"12px", cursor:"pointer", fontWeight: activeTab===tab?"600":"400" }}>{label}</button>
              ))}
            </div>

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:"14px" }}>
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ fontSize:"11px", fontWeight:"600", color:"rgba(240,236,228,0.5)", marginBottom:"14px", alignSelf:"flex-start" }}>СТРУКТУРА РАСХОДОВ</div>
                  <DonutChart data={chartData} total={result.grandTotal}/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginTop:"14px", width:"100%" }}>
                    {chartData.map(d => (
                      <div key={d.key} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                        <div style={{ width:"8px", height:"8px", borderRadius:"2px", background:d.color, flexShrink:0 }}/>
                        <span style={{ fontSize:"10px", color:"rgba(240,236,228,0.55)" }}>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px" }}>
                  <div style={{ fontSize:"11px", fontWeight:"600", color:"rgba(240,236,228,0.5)", marginBottom:"18px" }}>РАСХОДЫ ПО КАТЕГОРИЯМ</div>
                  {[...chartData].sort((a,b)=>b.value-a.value).map(d => (
                    <BarRow key={d.key} label={d.name} icon={d.icon} color={d.color}
                      pct={Math.round((d.value/result.grandTotal)*100)} formatted={fmt(d.value,result.currency)}/>
                  ))}
                  <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"12px", color:"rgba(240,236,228,0.4)" }}>Итого</span>
                    <span style={{ fontSize:"15px", fontWeight:"700", color:"#f9d976" }}>{fmt(result.grandTotal,result.currency)}</span>
                  </div>
                </div>
                <div style={{ gridColumn:"1/-1", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px" }}>
                  <div style={{ fontSize:"11px", fontWeight:"600", color:"rgba(240,236,228,0.5)", marginBottom:"14px" }}>НА 1 ЧЕЛОВЕКА ПО КАТЕГОРИЯМ</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"10px" }}>
                    {chartData.map(d => (
                      <div key={d.key} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"12px 8px", textAlign:"center", border:`1px solid ${d.color}22` }}>
                        <div style={{ fontSize:"22px", marginBottom:"5px" }}>{d.icon}</div>
                        <div style={{ fontSize:"9px", color:"rgba(240,236,228,0.4)", marginBottom:"4px" }}>{d.name}</div>
                        <div style={{ fontSize:"13px", fontWeight:"700", color:d.color }}>{fmt(result.categories[d.key]?.perPerson,result.currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            {activeTab === "details" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {Object.entries(result.categories||{}).map(([key,cat]) => {
                  const cfg = CATEGORY_CONFIG[key]||{icon:"💡",name:key,color:"#888"};
                  const pct = Math.round((cat.total/result.grandTotal)*100);
                  return (
                    <div key={key} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${cfg.color}22`, borderRadius:"12px", padding:"16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                          <span style={{ fontSize:"20px" }}>{cfg.icon}</span>
                          <span style={{ fontSize:"13px", fontWeight:"600" }}>{cfg.name}</span>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:"16px", fontWeight:"700", color:cfg.color }}>{fmt(cat.total,result.currency)}</div>
                          <div style={{ fontSize:"10px", color:"rgba(240,236,228,0.3)" }}>{fmt(cat.perPerson,result.currency)}/чел</div>
                        </div>
                      </div>
                      <div style={{ fontSize:"11px", color:"rgba(240,236,228,0.6)", lineHeight:"1.55", marginBottom:"8px" }}>{cat.details}</div>
                      <div style={{ height:"3px", background:"rgba(255,255,255,0.07)", borderRadius:"3px" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:cfg.color, borderRadius:"3px" }}/>
                      </div>
                      <div style={{ fontSize:"9px", color:"rgba(240,236,228,0.25)", marginTop:"3px" }}>{pct}% от бюджета</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sources */}
            {activeTab === "sources" && (
              <div>
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"20px", marginBottom:"14px" }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"rgba(240,236,228,0.7)", marginBottom:"4px" }}>
                    {result.travel_type==="independent" ? "🎒 Самостоятельное путешествие" : "📦 Тур через туроператора"}
                  </div>
                  <div style={{ fontSize:"12px", color:"rgba(240,236,228,0.4)", marginBottom:"16px" }}>
                    {result.travel_type==="independent"
                      ? "Бюджет рассчитан на основе открытых цен — билеты, отели и сервисы бронируются напрямую."
                      : "Бюджет рассчитан по ценам туроператоров. Пакетный тур включает чартерный перелёт, трансфер и отель."}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                    {(result.sources||[]).map((s, i) => (
                      <div key={i} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", padding:"14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"5px" }}>
                          <span style={{ fontSize:"18px" }}>{s.icon||"🔗"}</span>
                          <span style={{ fontSize:"13px", fontWeight:"600", color:"#f9d976" }}>{s.name||s.url}</span>
                        </div>
                        {s.url && <div style={{ fontSize:"10px", color:"rgba(240,236,228,0.3)", fontFamily:"monospace", marginBottom:"4px" }}>{s.url}</div>}
                        {s.category && <div style={{ fontSize:"11px", color:"rgba(240,236,228,0.5)" }}>{s.category}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:"rgba(255,165,0,0.06)", border:"1px solid rgba(255,165,0,0.15)", borderRadius:"10px", padding:"12px 16px", fontSize:"11px", color:"rgba(240,236,228,0.4)", lineHeight:"1.6" }}>
                  ℹ️ Цены являются приблизительными ориентирами на основе открытых данных с указанных сайтов. Финальная стоимость может отличаться в зависимости от наличия мест, сезона и акций. Рекомендуем проверять актуальные цены напрямую на сайтах.
                </div>
              </div>
            )}

            {/* Tips */}
            {activeTab === "tips" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                {result.tips?.length > 0 && (
                  <div style={{ background:"rgba(99,179,237,0.06)", border:"1px solid rgba(99,179,237,0.15)", borderRadius:"13px", padding:"18px" }}>
                    <div style={{ fontSize:"13px", fontWeight:"600", marginBottom:"12px", color:"#90cdf4" }}>💡 Советы по экономии</div>
                    {result.tips.map((tip,i) => (
                      <div key={i} style={{ display:"flex", gap:"7px", marginBottom:"9px", fontSize:"12px", color:"rgba(240,236,228,0.75)", lineHeight:"1.55" }}>
                        <span style={{ color:"#90cdf4", flexShrink:0 }}>→</span>{tip}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {result.bestTime && (
                    <div style={{ background:"rgba(110,231,183,0.06)", border:"1px solid rgba(110,231,183,0.15)", borderRadius:"12px", padding:"16px" }}>
                      <div style={{ fontSize:"12px", fontWeight:"600", color:"#6ee7b7", marginBottom:"6px" }}>⏰ Лучшее время</div>
                      <div style={{ fontSize:"12px", color:"rgba(240,236,228,0.7)" }}>{result.bestTime}</div>
                    </div>
                  )}
                  {result.warnings?.length > 0 && (
                    <div style={{ background:"rgba(255,165,0,0.06)", border:"1px solid rgba(255,165,0,0.15)", borderRadius:"12px", padding:"16px" }}>
                      <div style={{ fontSize:"12px", fontWeight:"600", color:"#fbd38d", marginBottom:"8px" }}>⚠️ Важно знать</div>
                      {result.warnings.map((w,i) => <div key={i} style={{ fontSize:"12px", color:"rgba(240,236,228,0.65)", marginBottom:"5px" }}>• {w}</div>)}
                    </div>
                  )}
                  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px", padding:"16px" }}>
                    <div style={{ fontSize:"11px", fontWeight:"600", color:"rgba(240,236,228,0.35)", marginBottom:"10px" }}>📊 СВОДКА</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                      {[["Дней",result.days],["Туристов",result.people],["В день/чел",fmt(result.grandTotalPerPerson/result.days,result.currency)],["Тип",result.travel_type==="independent"?"Самост.":"Туроператор"]].map(([l,v]) => (
                        <div key={l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"7px", padding:"8px 10px" }}>
                          <div style={{ fontSize:"9px", color:"rgba(240,236,228,0.3)", marginBottom:"2px" }}>{l}</div>
                          <div style={{ fontSize:"14px", fontWeight:"600", color:"#f9d976" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign:"center", marginTop:"18px", fontSize:"10px", color:"rgba(240,236,228,0.2)" }}>* Цены приблизительные. Данные актуальны на момент запроса.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}input::placeholder{color:rgba(240,236,228,0.22)}input:focus,select:focus{border-color:rgba(249,217,118,0.4)!important}`}</style>
    </div>
  );
}
