import { useState, useEffect, useRef } from "react";

// ======================== DATA ========================
const PIPELINE_STAGES = [
  { id: "new_lead", label: "Lead Mới", color: "#6366f1", bg: "#eef2ff", icon: "📥", desc: "Vừa tiếp nhận, chưa liên hệ" },
  { id: "contacted", label: "Đã Liên Hệ", color: "#f59e0b", bg: "#fffbeb", icon: "📞", desc: "Đã gọi/nhắn, đang khai thác nhu cầu" },
  { id: "qualified", label: "Đủ Điều Kiện", color: "#8b5cf6", bg: "#f5f3ff", icon: "✅", desc: "Có tài chính, đúng nhu cầu sản phẩm" },
  { id: "site_visit", label: "Đặt Lịch Xem", color: "#06b6d4", bg: "#ecfeff", icon: "🏠", desc: "Đã hẹn hoặc đã xem thực địa" },
  { id: "negotiating", label: "Đàm Phán", color: "#f97316", bg: "#fff7ed", icon: "🤝", desc: "Đang thương lượng giá / điều khoản" },
  { id: "deposited", label: "Đặt Cọc", color: "#10b981", bg: "#ecfdf5", icon: "💰", desc: "Đã cọc, chờ ký HĐMB" },
  { id: "closed_won", label: "Chốt Thành Công", color: "#059669", bg: "#d1fae5", icon: "🏆", desc: "Ký hợp đồng thành công" },
  { id: "closed_lost", label: "Không Thành Công", color: "#ef4444", bg: "#fee2e2", icon: "❌", desc: "Khách từ chối hoặc mua nơi khác" },
];

const LEAD_SOURCES = ["Facebook Ads", "Zalo Ads", "Referral / Giới thiệu", "Cold Call", "Telesale", "Sàn BĐS", "Khác"];
const PROPERTY_TYPES = ["Căn hộ chung cư", "Nhà phố", "Biệt thự", "Đất nền", "Shophouse", "Officetel"];
const PRICE_RANGES = ["Dưới 2 tỷ", "2–5 tỷ", "5–10 tỷ", "10–15 tỷ", "Trên 15 tỷ"];
const ACTIVITY_TYPES = ["Gọi điện", "Nhắn tin Zalo", "Gặp mặt", "Email", "Gửi tài liệu", "Xem thực địa", "Đàm phán", "Khác"];

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Nguyễn Văn Thành", phone: "0901234567", email: "thanh.nv@gmail.com", stage: "negotiating", source: "Facebook Ads", propertyType: "Căn hộ chung cư", priceRange: "5–10 tỷ", budget: 7.5, project: "Vinhomes Grand Park", area: "Quận 9, TP.HCM", notes: "Quan tâm tầng cao, view sông. Cần tư vấn thêm về pháp lý.", createdAt: "2025-01-10", lastContact: "2025-01-20", nextContact: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), score: 85, tags: ["Hot", "Có tài chính"], activities: [{ id: 1, type: "Gọi điện", date: "2025-01-20", note: "KH hỏi thêm về tiến độ bàn giao", done: true }] },
  { id: 2, name: "Trần Thị Minh Châu", phone: "0912345678", email: "minhchau@gmail.com", stage: "site_visit", source: "Referral / Giới thiệu", propertyType: "Nhà phố", priceRange: "10–15 tỷ", budget: 12, project: "Khu Đô Thị Sala", area: "Quận 2, TP.HCM", notes: "Được giới thiệu qua anh Hùng. Muốn mua để ở, ưu tiên gần trường quốc tế.", createdAt: "2025-01-05", lastContact: "2025-01-18", nextContact: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), score: 72, tags: ["Warm", "Để ở"], activities: [{ id: 2, type: "Gặp mặt", date: "2025-01-18", note: "Đã dẫn xem 2 căn, KH thích căn góc", done: true }] },
  { id: 3, name: "Lê Hoàng Phúc", phone: "0987654321", email: "hoangphuc.le@company.vn", stage: "qualified", source: "Cold Call", propertyType: "Biệt thự", priceRange: "Trên 15 tỷ", budget: 20, project: "Đang tìm kiếm", area: "TP. Thủ Đức", notes: "Giám đốc DN, muốn đầu tư BĐS cao cấp. Cần tư vấn thêm dự án.", createdAt: "2025-01-15", lastContact: "2025-01-22", nextContact: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), score: 60, tags: ["VIP", "Đầu tư"], activities: [] },
  { id: 4, name: "Phạm Thị Lan Anh", phone: "0978563412", email: "lananh.pham@gmail.com", stage: "new_lead", source: "Zalo Ads", propertyType: "Căn hộ chung cư", priceRange: "2–5 tỷ", budget: 3.5, project: "Masteri Thảo Điền", area: "Quận 2", notes: "Chạy quảng cáo Zalo. Chưa liên hệ lần nào.", createdAt: "2025-01-23", lastContact: "", nextContact: new Date(Date.now()).toISOString().slice(0, 10), score: 40, tags: ["Mới"], activities: [] },
  { id: 5, name: "Võ Đình Khải", phone: "0945678901", email: "vodinhthai@gmail.com", stage: "deposited", source: "Referral / Giới thiệu", propertyType: "Nhà phố", priceRange: "5–10 tỷ", budget: 8, project: "Nhà phố Lovera Vista", area: "Bình Chánh", notes: "Đã đặt cọc 200tr. Dự kiến ký HĐ tuần sau.", createdAt: "2024-12-20", lastContact: "2025-01-21", nextContact: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), score: 95, tags: ["Hot", "Gần chốt"], activities: [{ id: 3, type: "Gặp mặt", date: "2025-01-21", note: "Đặt cọc 200tr, chờ ngân hàng duyệt vay", done: true }] },
  { id: 6, name: "Ngô Thị Hương", phone: "0934567890", email: "huong.ngo@gmail.com", stage: "closed_won", source: "Facebook Ads", propertyType: "Căn hộ chung cư", priceRange: "5–10 tỷ", budget: 6.5, project: "Lumiere Boulevard", area: "TP. Thủ Đức", notes: "Đã ký HĐ thành công. Hoa hồng 1.5%.", createdAt: "2024-11-10", lastContact: "2025-01-15", nextContact: "", score: 100, tags: ["Đã chốt"], activities: [], dealValue: 6500000000, commission: 97500000 },
  { id: 7, name: "Đinh Văn Toàn", phone: "0923456789", email: "dinhvantoan@gmail.com", stage: "contacted", source: "Telesale", propertyType: "Nhà phố", priceRange: "10–15 tỷ", budget: 11, project: "Đang khảo sát", area: "Bình Thạnh", notes: "Gọi cold call, KH có nhu cầu nhưng cần thời gian. Hẹn gặp tuần sau.", createdAt: "2025-01-19", lastContact: "2025-01-19", nextContact: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10), score: 50, tags: ["Warm"], activities: [{ id: 4, type: "Gọi điện", date: "2025-01-19", note: "KH có nhu cầu nhưng bận, hẹn gặp tuần sau", done: true }] },
];

const INITIAL_REMINDERS = [
  { id: 1, customerId: 1, customerName: "Nguyễn Văn Thành", type: "Gọi điện", date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), time: "10:00", note: "Follow-up sau buổi đàm phán, hỏi quyết định", done: false, priority: "high" },
  { id: 2, customerId: 2, customerName: "Trần Thị Minh Châu", type: "Xem thực địa", date: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), time: "14:00", note: "Dẫn xem lần 2, đã hẹn trước", done: false, priority: "high" },
  { id: 3, customerId: 5, customerName: "Võ Đình Khải", type: "Gặp mặt", date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), time: "09:00", note: "Ký hợp đồng mua bán chính thức", done: false, priority: "urgent" },
  { id: 4, customerId: 3, customerName: "Lê Hoàng Phúc", type: "Nhắn tin Zalo", date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), time: "11:00", note: "Gửi thêm thông tin dự án mới", done: false, priority: "medium" },
  { id: 5, customerId: 4, customerName: "Phạm Thị Lan Anh", type: "Gọi điện", date: new Date(Date.now()).toISOString().slice(0, 10), time: "15:00", note: "Lead mới từ Zalo, liên hệ lần đầu", done: false, priority: "urgent" },
];

const STAGE_ACTIONS = {
  new_lead: ["Gọi điện lần đầu", "Gửi tin nhắn Zalo giới thiệu", "Gửi brochure dự án"],
  contacted: ["Khai thác nhu cầu chi tiết", "Gửi thêm tài liệu dự án", "Hẹn lịch xem thực địa"],
  qualified: ["Tư vấn phương án tài chính", "Đề xuất sản phẩm phù hợp", "Hẹn dẫn xem thực địa"],
  site_visit: ["Dẫn xem thực địa", "Tư vấn sau xem", "Gửi so sánh các căn"],
  negotiating: ["Thương lượng giá", "Tư vấn chính sách ưu đãi", "Xin phê duyệt giảm giá"],
  deposited: ["Chuẩn bị hợp đồng", "Hỗ trợ thủ tục ngân hàng", "Hẹn ký HĐMB"],
  closed_won: ["Chúc mừng, gửi quà", "Hỏi thăm sau mua", "Xin giới thiệu khách mới"],
  closed_lost: ["Hỏi lý do từ chối", "Giữ liên lạc dài hạn", "Offer dự án khác phù hợp hơn"],
};

// ======================== UTILS ========================
const fmt = (n) => n?.toLocaleString("vi-VN") || "0";
const fmtB = (n) => (n >= 1e9 ? (n / 1e9).toFixed(2) + " tỷ" : n >= 1e6 ? (n / 1e6).toFixed(0) + " triệu" : fmt(n));
const today = new Date().toISOString().slice(0, 10);
const diffDays = (d) => Math.ceil((new Date(d) - new Date(today)) / 86400000);

// ======================== COMPONENTS ========================

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#059669" : score >= 60 ? "#f59e0b" : score >= 40 ? "#6366f1" : "#9ca3af";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: color + "20", color, padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      🔥 {score}
    </span>
  );
}

function Tag({ label }) {
  const colors = { "Hot": "#ef4444", "Warm": "#f59e0b", "VIP": "#8b5cf6", "Mới": "#6366f1", "Gần chốt": "#10b981", "Đã chốt": "#059669", "Đầu tư": "#06b6d4", "Để ở": "#3b82f6", "Có tài chính": "#10b981" };
  const c = colors[label] || "#6b7280";
  return <span style={{ background: c + "20", color: c, padding: "1px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function Avatar({ name, size = 36 }) {
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#f97316"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "#6366f1", trend }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{label}</div>
          <div style={{ color: "#0f172a", fontSize: 26, fontWeight: 800 }}>{value}</div>
          {sub && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{sub}</div>}
        </div>
        {trend !== undefined && (
          <div style={{ color: trend >= 0 ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 600, background: (trend >= 0 ? "#10b981" : "#ef4444") + "15", padding: "4px 10px", borderRadius: 8 }}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ height: 3, background: color + "30", borderRadius: 2, marginTop: 16 }}>
        <div style={{ height: "100%", background: color, borderRadius: 2, width: "65%" }} />
      </div>
    </div>
  );
}

// ======================== MAIN APP ========================
export default function BDSCRM() {
  const [tab, setTab] = useState("dashboard");
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [filterStage, setFilterStage] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [pipelineView, setPipelineView] = useState("kanban");
  const [editCustomer, setEditCustomer] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityTarget, setActivityTarget] = useState(null);
  const [kpiPeriod, setKpiPeriod] = useState("month");

  // Derived
  const todayReminders = reminders.filter(r => !r.done && r.date === today);
  const urgentReminders = reminders.filter(r => !r.done && diffDays(r.date) <= 1);
  const activeCustomers = customers.filter(c => !["closed_won", "closed_lost"].includes(c.stage));
  const wonCustomers = customers.filter(c => c.stage === "closed_won");
  const totalRevenue = wonCustomers.reduce((s, c) => s + (c.dealValue || c.budget * 1e9), 0);
  const totalCommission = wonCustomers.reduce((s, c) => s + (c.commission || (c.budget * 1e9 * 0.015)), 0);
  const hotLeads = customers.filter(c => c.score >= 80 && !["closed_won", "closed_lost"].includes(c.stage));

  const filteredCustomers = customers.filter(c => {
    if (filterStage !== "all" && c.stage !== filterStage) return false;
    if (filterSource !== "all" && c.source !== filterSource) return false;
    if (searchQ && !c.name.toLowerCase().includes(searchQ.toLowerCase()) && !c.phone.includes(searchQ)) return false;
    return true;
  });

  const addCustomer = (data) => {
    setCustomers(prev => [...prev, { ...data, id: Date.now(), createdAt: today, activities: [], score: 30, tags: ["Mới"] }]);
    setShowAddCustomer(false);
  };

  const updateCustomer = (id, data) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    if (selectedCustomer?.id === id) setSelectedCustomer(prev => ({ ...prev, ...data }));
  };

  const moveStage = (id, stage) => updateCustomer(id, { stage });

  const addActivity = (customerId, act) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return { ...c, activities: [...(c.activities || []), { ...act, id: Date.now(), done: true }], lastContact: today };
    }));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, activities: [...(prev.activities || []), { ...act, id: Date.now(), done: true }], lastContact: today }));
    }
  };

  const addReminder = (data) => {
    setReminders(prev => [...prev, { ...data, id: Date.now(), done: false }]);
    setShowAddReminder(false);
  };

  const completeReminder = (id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, done: true } : r));

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Tổng Quan" },
    { id: "pipeline", icon: "🔁", label: "Pipeline" },
    { id: "customers", icon: "👥", label: "Khách Hàng" },
    { id: "calendar", icon: "📅", label: "Lịch Nhắc" },
    { id: "reports", icon: "📈", label: "Báo Cáo" },
    { id: "kpi", icon: "🎯", label: "KPI" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>🏢 PropCRM</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>BĐS Cao Cấp TP.HCM</div>
        </div>
        <div style={{ padding: "0 12px", flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 4, background: tab === n.id ? "#6366f1" : "transparent", color: tab === n.id ? "#fff" : "#94a3b8", fontWeight: tab === n.id ? 600 : 400, fontSize: 14, textAlign: "left", transition: "all .15s" }}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
        {/* Urgent reminders badge */}
        {urgentReminders.length > 0 && (
          <div style={{ margin: 12, background: "#ef4444", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>🔔 {urgentReminders.length} việc cần làm ngay!</div>
            {urgentReminders.slice(0, 2).map(r => (
              <div key={r.id} style={{ color: "#fecaca", fontSize: 11, marginTop: 4 }}>• {r.customerName}: {r.type}</div>
            ))}
          </div>
        )}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="Agent" size={32} />
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Sales Agent</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>BĐS TP.HCM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard" && <Dashboard customers={customers} reminders={reminders} todayReminders={todayReminders} hotLeads={hotLeads} wonCustomers={wonCustomers} totalRevenue={totalRevenue} totalCommission={totalCommission} setTab={setTab} setSelectedCustomer={setSelectedCustomer} completeReminder={completeReminder} />}
        {tab === "pipeline" && <Pipeline customers={customers} moveStage={moveStage} setSelectedCustomer={setSelectedCustomer} pipelineView={pipelineView} setPipelineView={setPipelineView} setShowAddCustomer={setShowAddCustomer} />}
        {tab === "customers" && <CustomerList customers={filteredCustomers} allCustomers={customers} filterStage={filterStage} setFilterStage={setFilterStage} filterSource={filterSource} setFilterSource={setFilterSource} searchQ={searchQ} setSearchQ={setSearchQ} setSelectedCustomer={setSelectedCustomer} setShowAddCustomer={setShowAddCustomer} />}
        {tab === "calendar" && <CalendarView reminders={reminders} customers={customers} completeReminder={completeReminder} setShowAddReminder={setShowAddReminder} setSelectedCustomer={setSelectedCustomer} addReminder={addReminder} />}
        {tab === "reports" && <Reports customers={customers} />}
        {tab === "kpi" && <KPIView customers={customers} totalRevenue={totalRevenue} totalCommission={totalCommission} kpiPeriod={kpiPeriod} setKpiPeriod={setKpiPeriod} />}
      </div>

      {/* Customer Detail Panel */}
      {selectedCustomer && (
        <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} onUpdate={(data) => updateCustomer(selectedCustomer.id, data)} onMoveStage={(stage) => moveStage(selectedCustomer.id, stage)} onAddActivity={(act) => addActivity(selectedCustomer.id, act)} onAddReminder={(r) => addReminder({ ...r, customerId: selectedCustomer.id, customerName: selectedCustomer.name })} />
      )}

      {/* Modals */}
      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onSave={addCustomer} />}
      {showAddReminder && <AddReminderModal customers={customers} onClose={() => setShowAddReminder(false)} onSave={addReminder} />}
    </div>
  );
}

// ======================== DASHBOARD ========================
function Dashboard({ customers, reminders, todayReminders, hotLeads, wonCustomers, totalRevenue, totalCommission, setTab, setSelectedCustomer, completeReminder }) {
  const active = customers.filter(c => !["closed_won", "closed_lost"].includes(c.stage));
  const convRate = customers.length > 0 ? Math.round((wonCustomers.length / customers.length) * 100) : 0;

  const stageData = PIPELINE_STAGES.slice(0, 6).map(s => ({
    ...s, count: customers.filter(c => c.stage === s.id).length
  }));

  const sourceData = LEAD_SOURCES.map(s => ({ name: s, count: customers.filter(c => c.source === s).length })).filter(s => s.count > 0);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Tổng Quan Hôm Nay</h1>
        <div style={{ color: "#64748b", fontSize: 14 }}>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="👥" label="Tổng khách hàng" value={customers.length} sub={`${active.length} đang chăm sóc`} color="#6366f1" trend={12} />
        <StatCard icon="🔥" label="Lead nóng" value={hotLeads.length} sub="Điểm ≥ 80" color="#ef4444" trend={8} />
        <StatCard icon="🏆" label="Đã chốt" value={wonCustomers.length} sub={`Tỷ lệ ${convRate}%`} color="#10b981" trend={5} />
        <StatCard icon="💰" label="Hoa hồng ước tính" value={fmtB(totalCommission)} sub="Từ các deal thành công" color="#f59e0b" trend={15} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Today reminders */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📅 Việc Cần Làm Hôm Nay</h3>
            <button onClick={() => setTab("calendar")} style={{ background: "#6366f110", color: "#6366f1", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Xem tất cả</button>
          </div>
          {todayReminders.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>✅ Không có việc nào hôm nay!</div>
          ) : todayReminders.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: r.priority === "urgent" ? "#fee2e2" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {r.type === "Gọi điện" ? "📞" : r.type === "Gặp mặt" ? "🤝" : r.type === "Xem thực địa" ? "🏠" : "💬"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customerName}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{r.type} · {r.time}</div>
              </div>
              {r.priority === "urgent" && <span style={{ background: "#fee2e2", color: "#ef4444", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>KHẨN</span>}
              <button onClick={() => completeReminder(r.id)} style={{ background: "#10b98115", color: "#10b981", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>✓ Xong</button>
            </div>
          ))}
        </div>

        {/* Hot Leads */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🔥 Lead Nóng Nhất</h3>
            <button onClick={() => setTab("customers")} style={{ background: "#ef444410", color: "#ef4444", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Xem tất cả</button>
          </div>
          {hotLeads.length === 0 ? <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>Chưa có lead nóng</div> : hotLeads.slice(0, 5).map(c => (
            <div key={c.id} onClick={() => setSelectedCustomer(c)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
              <Avatar name={c.name} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{PIPELINE_STAGES.find(s => s.id === c.stage)?.label} · {c.priceRange}</div>
              </div>
              <ScoreBadge score={c.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Progress */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🔁 Phân Bổ Pipeline</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stageData.map(s => (
            <div key={s.id} style={{ flex: "1 1 120px", background: s.bg, borderRadius: 12, padding: "14px", textAlign: "center", border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ color: s.color, fontWeight: 800, fontSize: 22 }}>{s.count}</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================== PIPELINE ========================
function Pipeline({ customers, moveStage, setSelectedCustomer, pipelineView, setPipelineView, setShowAddCustomer }) {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Pipeline Bán Hàng</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>Theo dõi hành trình từng khách hàng</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddCustomer(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ Thêm Khách</button>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12 }}>
        {PIPELINE_STAGES.map(stage => {
          const stageCustomers = customers.filter(c => c.stage === stage.id);
          const totalBudget = stageCustomers.reduce((s, c) => s + (c.budget || 0), 0);
          return (
            <div key={stage.id} style={{ minWidth: 240, maxWidth: 260, flexShrink: 0 }}>
              <div style={{ background: stage.bg, borderRadius: 12, border: `2px solid ${stage.color}30`, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{stage.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: stage.color }}>{stage.label}</span>
                  </div>
                  <span style={{ background: stage.color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{stageCustomers.length}</span>
                </div>
                {totalBudget > 0 && <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>💰 {totalBudget.toFixed(1)} tỷ tiềm năng</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stageCustomers.map(c => (
                  <div key={c.id} onClick={() => setSelectedCustomer(c)} style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Avatar name={c.name} size={30} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{c.phone}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>🏠 {c.propertyType} · {c.priceRange}</div>
                    {c.project && <div style={{ fontSize: 11, color: "#94a3b8" }}>📍 {c.project}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{c.tags?.slice(0, 2).map(t => <Tag key={t} label={t} />)}</div>
                      <ScoreBadge score={c.score} />
                    </div>
                    {c.nextContact && !["closed_won", "closed_lost"].includes(c.stage) && (
                      <div style={{ marginTop: 8, fontSize: 11, color: diffDays(c.nextContact) < 0 ? "#ef4444" : diffDays(c.nextContact) === 0 ? "#f59e0b" : "#10b981", background: diffDays(c.nextContact) < 0 ? "#fee2e2" : diffDays(c.nextContact) === 0 ? "#fffbeb" : "#ecfdf5", padding: "3px 8px", borderRadius: 6 }}>
                        📅 {diffDays(c.nextContact) < 0 ? `Quá hạn ${Math.abs(diffDays(c.nextContact))} ngày` : diffDays(c.nextContact) === 0 ? "Hôm nay" : `Còn ${diffDays(c.nextContact)} ngày`}
                      </div>
                    )}
                    {/* Move buttons */}
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {PIPELINE_STAGES.findIndex(s => s.id === stage.id) > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); moveStage(c.id, PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) - 1].id); }} style={{ flex: 1, padding: "4px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#64748b" }}>← Lùi</button>
                      )}
                      {PIPELINE_STAGES.findIndex(s => s.id === stage.id) < PIPELINE_STAGES.length - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); moveStage(c.id, PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1].id); }} style={{ flex: 1, padding: "4px", background: "#6366f110", border: "1px solid #6366f130", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>Tiến →</button>
                      )}
                    </div>
                  </div>
                ))}
                {stageCustomers.length === 0 && (
                  <div style={{ textAlign: "center", color: "#cbd5e1", padding: "20px 0", fontSize: 13, borderRadius: 10, border: "2px dashed #e2e8f0" }}>Chưa có khách</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================== CUSTOMER LIST ========================
function CustomerList({ customers, allCustomers, filterStage, setFilterStage, filterSource, setFilterSource, searchQ, setSearchQ, setSelectedCustomer, setShowAddCustomer }) {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Danh Sách Khách Hàng</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>{customers.length} khách hàng</div>
        </div>
        <button onClick={() => setShowAddCustomer(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ Thêm Khách Hàng</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Tìm theo tên, SĐT..." style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, width: 240 }} />
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, cursor: "pointer" }}>
          <option value="all">Tất cả giai đoạn</option>
          {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, cursor: "pointer" }}>
          <option value="all">Tất cả nguồn</option>
          {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Khách Hàng", "Giai Đoạn", "Loại BĐS", "Ngân Sách", "Nguồn", "Liên Hệ Tiếp", "Điểm", "Hành Động"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const stage = PIPELINE_STAGES.find(s => s.id === c.stage);
              const days = c.nextContact ? diffDays(c.nextContact) : null;
              return (
                <tr key={c.id} onClick={() => setSelectedCustomer(c)} style={{ cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background .1s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name} size={34} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: stage?.bg, color: stage?.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{stage?.icon} {stage?.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{c.propertyType}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.priceRange}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>{c.source}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {days !== null ? (
                      <span style={{ fontSize: 12, color: days < 0 ? "#ef4444" : days === 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                        {days < 0 ? `⚠️ Quá ${Math.abs(days)}d` : days === 0 ? "🔔 Hôm nay" : `✅ ${days} ngày`}
                      </span>
                    ) : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px" }}><ScoreBadge score={c.score} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }} style={{ background: "#6366f110", color: "#6366f1", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Chi tiết</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Không tìm thấy khách hàng nào</div>}
      </div>
    </div>
  );
}

// ======================== CALENDAR VIEW ========================
function CalendarView({ reminders, customers, completeReminder, setShowAddReminder, setSelectedCustomer, addReminder }) {
  const [view, setView] = useState("list");
  const upcoming = reminders.filter(r => !r.done).sort((a, b) => new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time));
  const done = reminders.filter(r => r.done);

  const priorityColor = { urgent: "#ef4444", high: "#f59e0b", medium: "#6366f1", low: "#10b981" };
  const priorityLabel = { urgent: "Khẩn", high: "Cao", medium: "Trung bình", low: "Thấp" };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Lịch Nhắc & Chăm Sóc</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>{upcoming.length} việc cần làm · {done.length} đã hoàn thành</div>
        </div>
        <button onClick={() => setShowAddReminder(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ Thêm Lịch</button>
      </div>

      {/* Stage-based care guide */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 16, padding: 20, marginBottom: 20, color: "#fff" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>📋 Hướng Dẫn Chăm Sóc Theo Giai Đoạn BĐS 5–15 Tỷ (Chu kỳ 3–6 tháng)</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { stage: "Lead Mới", rule: "Liên hệ trong 2h đầu", freq: "Ngày 1, 3, 7" },
            { stage: "Đã Liên Hệ", rule: "Gọi 2 lần/tuần", freq: "Mỗi 3–4 ngày" },
            { stage: "Đủ ĐK", rule: "Tư vấn tài chính", freq: "Hẹn gặp 1 lần/tuần" },
            { stage: "Xem Thực Địa", rule: "Follow-up sau 24h", freq: "Mỗi 2–3 ngày" },
            { stage: "Đàm Phán", rule: "Phản hồi trong ngày", freq: "Hàng ngày" },
            { stage: "Đặt Cọc", rule: "Hỗ trợ pháp lý", freq: "Theo tiến độ" },
          ].map(g => (
            <div key={g.stage} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", flex: "1 1 130px" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{g.stage}</div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>📌 {g.rule}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>🔄 {g.freq}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming reminders */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🔔 Lịch Chăm Sóc Sắp Tới</h3>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>✅ Không có lịch sắp tới!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(r => {
              const days = diffDays(r.date);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, border: `1px solid ${priorityColor[r.priority]}30`, background: priorityColor[r.priority] + "08" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: priorityColor[r.priority] + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {r.type === "Gọi điện" ? "📞" : r.type === "Gặp mặt" ? "🤝" : r.type === "Xem thực địa" ? "🏠" : r.type === "Nhắn tin Zalo" ? "💬" : "📌"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{r.customerName}</span>
                      <span style={{ background: priorityColor[r.priority] + "20", color: priorityColor[r.priority], fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{priorityLabel[r.priority]}</span>
                    </div>
                    <div style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>{r.type} · {r.time} · {new Date(r.date).toLocaleDateString("vi-VN")}</div>
                    {r.note && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{r.note}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: days < 0 ? "#ef4444" : days === 0 ? "#f59e0b" : "#64748b" }}>
                      {days < 0 ? `Quá hạn ${Math.abs(days)}d` : days === 0 ? "HÔM NAY" : `${days} ngày nữa`}
                    </div>
                    <button onClick={() => completeReminder(r.id)} style={{ marginTop: 6, background: "#10b98115", color: "#10b981", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Hoàn thành</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Done reminders */}
      {done.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginTop: 16, opacity: 0.7 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#64748b" }}>✅ Đã Hoàn Thành ({done.length})</h3>
          {done.slice(0, 5).map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc", textDecoration: "line-through", color: "#94a3b8", fontSize: 13 }}>
              <span>✓</span> <span>{r.customerName}</span> · <span>{r.type}</span> · <span>{r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== REPORTS ========================
function Reports({ customers }) {
  const byStage = PIPELINE_STAGES.map(s => ({ ...s, count: customers.filter(c => c.stage === s.id).length, value: customers.filter(c => c.stage === s.id).reduce((sum, c) => sum + (c.budget || 0), 0) }));
  const bySource = LEAD_SOURCES.map(s => ({ name: s, count: customers.filter(c => c.source === s).length })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  const byType = PROPERTY_TYPES.map(t => ({ name: t, count: customers.filter(c => c.propertyType === t).length })).filter(t => t.count > 0);
  const won = customers.filter(c => c.stage === "closed_won");
  const lost = customers.filter(c => c.stage === "closed_lost");
  const convRate = customers.length > 0 ? ((won.length / customers.length) * 100).toFixed(1) : 0;
  const avgScore = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.score, 0) / customers.length) : 0;
  const maxSource = bySource[0];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Báo Cáo & Phân Tích</h1>
        <div style={{ color: "#64748b", fontSize: 14 }}>Phân tích hiệu quả bán hàng BĐS</div>
      </div>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="📊" label="Tổng leads" value={customers.length} color="#6366f1" />
        <StatCard icon="✅" label="Tỷ lệ chuyển đổi" value={`${convRate}%`} sub={`${won.length} deals thành công`} color="#10b981" />
        <StatCard icon="❌" label="Tỷ lệ thất bại" value={`${customers.length > 0 ? ((lost.length / customers.length) * 100).toFixed(1) : 0}%`} color="#ef4444" />
        <StatCard icon="🏆" label="Điểm TB khách" value={avgScore} sub="Trên thang 100" color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* By stage */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📊 Phân Bổ Theo Giai Đoạn</h3>
          {byStage.map(s => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.icon} {s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count} ({s.value.toFixed(1)} tỷ)</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                <div style={{ height: "100%", background: s.color, borderRadius: 4, width: `${customers.length > 0 ? (s.count / customers.length) * 100 : 0}%`, transition: "width .5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* By source */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📣 Hiệu Quả Nguồn Lead</h3>
          {maxSource && <div style={{ background: "#ecfdf5", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#059669", fontWeight: 600 }}>🏆 Nguồn tốt nhất: {maxSource.name} ({maxSource.count} leads)</div>}
          {bySource.map((s, i) => {
            const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
            return (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: colors[i % colors.length] }}>{s.count}</span>
                <div style={{ width: 80, height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                  <div style={{ height: "100%", background: colors[i % colors.length], borderRadius: 4, width: `${(s.count / customers.length) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* By property type */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🏠 Loại BĐS Được Quan Tâm</h3>
          {byType.map((t, i) => {
            const icons = { "Căn hộ chung cư": "🏢", "Nhà phố": "🏠", "Biệt thự": "🏰", "Đất nền": "🌍", "Shophouse": "🏪", "Officetel": "💼" };
            return (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 22 }}>{icons[t.name] || "🏠"}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                <div style={{ width: 100, height: 10, background: "#f1f5f9", borderRadius: 5 }}>
                  <div style={{ height: "100%", background: "#6366f1", borderRadius: 5, width: `${(t.count / customers.length) * 100}%` }} />
                </div>
                <span style={{ fontWeight: 700, color: "#6366f1", minWidth: 20 }}>{t.count}</span>
              </div>
            );
          })}
        </div>

        {/* Score distribution */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>🔥 Phân Bổ Chất Lượng Lead</h3>
          {[{ label: "🔴 Nóng (80–100)", min: 80, max: 100, color: "#ef4444" }, { label: "🟡 Ấm (60–79)", min: 60, max: 79, color: "#f59e0b" }, { label: "🔵 Tiềm năng (40–59)", min: 40, max: 59, color: "#6366f1" }, { label: "⚪ Lạnh (< 40)", min: 0, max: 39, color: "#94a3b8" }].map(b => {
            const count = customers.filter(c => c.score >= b.min && c.score <= b.max).length;
            return (
              <div key={b.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{b.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{count} ({customers.length > 0 ? Math.round(count / customers.length * 100) : 0}%)</span>
                </div>
                <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5 }}>
                  <div style={{ height: "100%", background: b.color, borderRadius: 5, width: `${customers.length > 0 ? (count / customers.length) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ======================== KPI VIEW ========================
function KPIView({ customers, totalRevenue, totalCommission, kpiPeriod, setKpiPeriod }) {
  const targets = { leads: 20, siteVisits: 8, deals: 2, commission: 200000000, contactRate: 90, convRate: 10 };
  const actual = {
    leads: customers.length,
    siteVisits: customers.filter(c => ["site_visit", "negotiating", "deposited", "closed_won"].includes(c.stage)).length,
    deals: customers.filter(c => c.stage === "closed_won").length,
    commission: totalCommission,
    contactRate: Math.round(customers.filter(c => c.lastContact).length / Math.max(customers.length, 1) * 100),
    convRate: Math.round(customers.filter(c => c.stage === "closed_won").length / Math.max(customers.length, 1) * 100),
  };

  const kpis = [
    { key: "leads", icon: "📥", label: "Leads mới", unit: "KH", target: targets.leads, actual: actual.leads, color: "#6366f1" },
    { key: "siteVisits", icon: "🏠", label: "Lịch xem nhà", unit: "lượt", target: targets.siteVisits, actual: actual.siteVisits, color: "#06b6d4" },
    { key: "deals", icon: "🏆", label: "Deals chốt", unit: "hợp đồng", target: targets.deals, actual: actual.deals, color: "#10b981" },
    { key: "commission", icon: "💰", label: "Hoa hồng", unit: "đ", target: targets.commission, actual: actual.commission, color: "#f59e0b", format: fmtB },
    { key: "contactRate", icon: "📞", label: "Tỷ lệ liên hệ", unit: "%", target: targets.contactRate, actual: actual.contactRate, color: "#8b5cf6" },
    { key: "convRate", icon: "📊", label: "Tỷ lệ chốt", unit: "%", target: targets.convRate, actual: actual.convRate, color: "#ef4444" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>KPI & Hiệu Suất</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>Theo dõi mục tiêu bán hàng BĐS</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["week", "month", "quarter", "year"].map(p => (
            <button key={p} onClick={() => setKpiPeriod(p)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: kpiPeriod === p ? "#6366f1" : "#fff", color: kpiPeriod === p ? "#fff" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {{ week: "Tuần", month: "Tháng", quarter: "Quý", year: "Năm" }[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map(k => {
          const pct = Math.min(Math.round((k.actual / k.target) * 100), 100);
          const fmt2 = k.format || ((v) => v + " " + k.unit);
          const status = pct >= 100 ? "✅" : pct >= 70 ? "⚠️" : "❌";
          return (
            <div key={k.key} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${k.color}20` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 24 }}>{k.icon}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{k.label}</div>
                </div>
                <span style={{ fontSize: 20 }}>{status}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{fmt2(k.actual)}</span>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>/ {fmt2(k.target)}</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                <div style={{ height: "100%", background: pct >= 100 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444", borderRadius: 4, width: `${pct}%`, transition: "width .5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Đạt được</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444" }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall score */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 20, padding: 28, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>🎯 Tổng Điểm KPI Tháng Này</h3>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Dựa trên 6 chỉ số theo dõi</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#6366f1" }}>{Math.round(kpis.reduce((s, k) => s + Math.min((k.actual / k.target) * 100, 100), 0) / kpis.length)}%</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>Hoàn thành mục tiêu</div>
          </div>
        </div>
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 8, fontWeight: 600 }}>💡 Gợi Ý Cải Thiện:</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
            • Ưu tiên follow-up {customers.filter(c => c.stage === "site_visit").length} KH đang trong giai đoạn xem nhà — đây là nhóm gần chốt nhất<br />
            • {customers.filter(c => c.score >= 80 && !["closed_won", "closed_lost"].includes(c.stage)).length} lead nóng cần được gọi điện trong 24h tới<br />
            • Tăng lịch xem thực địa từ nguồn Facebook Ads — tỷ lệ ROI cao nhất hiện tại
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== CUSTOMER DETAIL PANEL ========================
function CustomerDetail({ customer, onClose, onUpdate, onMoveStage, onAddActivity, onAddReminder }) {
  const [actType, setActType] = useState(ACTIVITY_TYPES[0]);
  const [actNote, setActNote] = useState("");
  const [remType, setRemType] = useState(ACTIVITY_TYPES[0]);
  const [remDate, setRemDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [remTime, setRemTime] = useState("09:00");
  const [remNote, setRemNote] = useState("");
  const [editScore, setEditScore] = useState(customer.score);
  const [activeTab, setActiveTab] = useState("overview");

  const stage = PIPELINE_STAGES.find(s => s.id === customer.stage);
  const stageActions = STAGE_ACTIONS[customer.stage] || [];

  const handleAddActivity = () => {
    if (!actNote.trim()) return;
    onAddActivity({ type: actType, date: today, note: actNote });
    setActNote("");
  };

  const handleAddReminder = () => {
    onAddReminder({ type: remType, date: remDate, time: remTime, note: remNote, priority: "high" });
    setRemNote("");
  };

  return (
    <div style={{ width: 420, background: "#fff", borderLeft: "1px solid #f1f5f9", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={customer.name} size={46} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{customer.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>📞 {customer.phone}</div>
              {customer.email && <div style={{ color: "#94a3b8", fontSize: 12 }}>✉ {customer.email}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {customer.tags?.map(t => <Tag key={t} label={t} />)}
          <ScoreBadge score={customer.score} />
        </div>
        {/* Stage badge */}
        <div style={{ background: stage?.bg, borderRadius: 10, padding: "8px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{stage?.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: stage?.color, fontSize: 14 }}>{stage?.label}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>{stage?.desc}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {[["overview", "📋 Tổng quan"], ["activities", "📞 Hoạt động"], ["schedule", "📅 Lịch"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: "8px 0", border: "none", borderBottom: `2px solid ${activeTab === id ? "#6366f1" : "transparent"}`, background: "none", color: activeTab === id ? "#6366f1" : "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: activeTab === id ? 700 : 400 }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {activeTab === "overview" && (
          <div>
            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["🏠 Loại BĐS", customer.propertyType], ["💰 Ngân sách", customer.priceRange], ["📍 Khu vực", customer.area || "—"], ["🏗️ Dự án", customer.project || "—"], ["📣 Nguồn", customer.source], ["📅 Ngày tạo", new Date(customer.createdAt).toLocaleDateString("vi-VN")]].map(([label, val]) => (
                <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {customer.notes && (
              <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12, marginBottom: 16, border: "1px solid #fef3c7" }}>
                <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 4 }}>📝 Ghi chú</div>
                <div style={{ fontSize: 13, color: "#475569" }}>{customer.notes}</div>
              </div>
            )}

            {/* Score editor */}
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>🔥 Điểm tiềm năng</div>
                <ScoreBadge score={editScore} />
              </div>
              <input type="range" min={0} max={100} value={editScore} onChange={e => setEditScore(+e.target.value)} style={{ width: "100%" }} />
              <button onClick={() => onUpdate({ score: editScore })} style={{ marginTop: 8, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Lưu điểm</button>
            </div>

            {/* Move stage */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🔁 Chuyển giai đoạn</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PIPELINE_STAGES.filter(s => s.id !== customer.stage).slice(0, 6).map(s => (
                  <button key={s.id} onClick={() => onMoveStage(s.id)} style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{s.icon} {s.label}</button>
                ))}
              </div>
            </div>

            {/* Suggested actions for this stage */}
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginBottom: 8 }}>✅ Hành động gợi ý cho giai đoạn này:</div>
              {stageActions.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: "#065f46", marginBottom: 4 }}>• {a}</div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div>
            {/* Add activity */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>+ Ghi lại hoạt động</div>
              <select value={actType} onChange={e => setActType(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 8, fontSize: 13 }}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <textarea value={actNote} onChange={e => setActNote(e.target.value)} placeholder="Ghi chú nội dung..." rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
              <button onClick={handleAddActivity} style={{ marginTop: 8, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}>Lưu hoạt động</button>
            </div>

            {/* Activity list */}
            {(customer.activities || []).length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>Chưa có hoạt động nào</div>
            ) : [...(customer.activities || [])].reverse().map(a => (
              <div key={a.id} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "12px", background: "#f8fafc", borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6366f120", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {a.type === "Gọi điện" ? "📞" : a.type === "Gặp mặt" ? "🤝" : a.type === "Xem thực địa" ? "🏠" : "💬"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.type}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(a.date).toLocaleDateString("vi-VN")}</div>
                  <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{a.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>+ Đặt lịch nhắc</div>
              <select value={remType} onChange={e => setRemType(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 8, fontSize: 13 }}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="date" value={remDate} onChange={e => setRemDate(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              </div>
              <textarea value={remNote} onChange={e => setRemNote(e.target.value)} placeholder="Ghi chú lịch hẹn..." rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
              <button onClick={handleAddReminder} style={{ marginTop: 8, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}>📅 Đặt lịch nhắc</button>
            </div>
            <div style={{ background: "#fffbeb", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>💡 Gợi ý tần suất chăm sóc:</div>
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
                {customer.stage === "new_lead" && "Gọi trong 2h đầu • Follow-up ngày 1, 3, 7"}
                {customer.stage === "contacted" && "Gọi 2 lần/tuần • Gửi tài liệu mỗi 3 ngày"}
                {customer.stage === "qualified" && "Hẹn gặp 1 lần/tuần • Tư vấn tài chính"}
                {customer.stage === "site_visit" && "Follow-up sau 24h xem nhà • Gọi mỗi 2 ngày"}
                {customer.stage === "negotiating" && "Liên hệ hàng ngày • Phản hồi ngay khi có tin"}
                {customer.stage === "deposited" && "Theo dõi tiến độ ngân hàng • Hỗ trợ pháp lý"}
                {customer.stage === "closed_won" && "Hỏi thăm sau 1 tuần • Xin giới thiệu khách mới"}
                {customer.stage === "closed_lost" && "Giữ liên lạc 1 tháng/lần • Offer dự án khác"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================== ADD CUSTOMER MODAL ========================
function AddCustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", stage: "new_lead", source: "Facebook Ads", propertyType: "Căn hộ chung cư", priceRange: "5–10 tỷ", budget: 7, project: "", area: "", notes: "", nextContact: new Date(Date.now() + 86400000).toISOString().slice(0, 10) });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>➕ Thêm Khách Hàng Mới</h2>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Họ tên *", "name", "text"], ["Số điện thoại *", "phone", "text"], ["Email", "email", "email"], ["Ngân sách (tỷ)", "budget", "number"]].map(([label, key, type]) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
              <input type={type} value={form[key]} onChange={e => set(key, type === "number" ? +e.target.value : e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          {[["Giai đoạn", "stage", PIPELINE_STAGES.map(s => [s.id, s.label])], ["Nguồn lead", "source", LEAD_SOURCES.map(s => [s, s])], ["Loại BĐS", "propertyType", PROPERTY_TYPES.map(t => [t, t])], ["Mức giá", "priceRange", PRICE_RANGES.map(p => [p, p])]].map(([label, key, opts]) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
              <select value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
                {opts.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
              </select>
            </div>
          ))}
          {[["Dự án quan tâm", "project"], ["Khu vực", "area"]].map(([label, key]) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
              <input value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Lịch liên hệ tiếp</div>
            <input type="date" value={form.nextContact} onChange={e => set("nextContact", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Ghi chú</div>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>Hủy</button>
          <button onClick={() => form.name && form.phone && onSave(form)} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>✓ Lưu Khách Hàng</button>
        </div>
      </div>
    </div>
  );
}

// ======================== ADD REMINDER MODAL ========================
function AddReminderModal({ customers, onClose, onSave }) {
  const [form, setForm] = useState({ customerId: customers[0]?.id || "", customerName: customers[0]?.name || "", type: "Gọi điện", date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: "09:00", note: "", priority: "high" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📅 Thêm Lịch Nhắc</h2>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Khách hàng</div>
            <select value={form.customerId} onChange={e => { const c = customers.find(c => c.id === +e.target.value); set("customerId", +e.target.value); set("customerName", c?.name || ""); }} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Loại hoạt động</div>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
              {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Ngày</div>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ width: 100 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Giờ</div>
              <input type="time" value={form.time} onChange={e => set("time", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Độ ưu tiên</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["urgent", "🔴 Khẩn"], ["high", "🟡 Cao"], ["medium", "🔵 TB"], ["low", "⚪ Thấp"]].map(([val, lbl]) => (
                <button key={val} onClick={() => set("priority", val)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `2px solid ${form.priority === val ? "#6366f1" : "#e2e8f0"}`, background: form.priority === val ? "#eef2ff" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: form.priority === val ? "#6366f1" : "#64748b" }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Ghi chú</div>
            <textarea value={form.note} onChange={e => set("note", e.target.value)} rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14 }}>Hủy</button>
          <button onClick={() => onSave(form)} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>📅 Lưu Lịch Nhắc</button>
        </div>
      </div>
    </div>
  );
}
