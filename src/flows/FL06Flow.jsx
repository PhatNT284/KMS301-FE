import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileClock,
  GitBranch,
  KeyRound,
  Layers,
  ListTree,
  Lock,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users
} from "lucide-react";
import {
  adminActionLabels,
  adminResourceLabels,
  adminRoleLabels,
  adminNowIso,
  hasPermission,
  makeAdminId,
  validateTaxonomyPublish
} from "../data/fl06Data.js";

const adminTabs = [
  { label: "Dashboard", screen: "admin-dashboard", icon: ShieldCheck },
  { label: "Người dùng", screen: "admin-users", icon: Users },
  { label: "Quyền", screen: "admin-permissions", icon: KeyRound },
  { label: "Taxonomy", screen: "admin-taxonomy", icon: ListTree },
  { label: "Metadata", screen: "admin-metadata-templates", icon: Layers },
  { label: "Tìm kiếm", screen: "admin-search-config", icon: Search },
  { label: "Lifecycle", screen: "admin-lifecycle-policy", icon: FileClock },
  { label: "Audit", screen: "admin-audit-log", icon: Eye },
  { label: "Seed data", screen: "admin-demo-data", icon: Database }
];

const resourceIds = ["KNOWLEDGE", "SOP", "SUBMISSION", "REQUEST", "LIFECYCLE", "ADMIN"];
const actionIds = ["VIEW", "CREATE", "EDIT_OWN", "EDIT_ANY", "REVIEW", "APPROVE", "ARCHIVE", "MANAGE"];

export function FL06Flow({
  screen,
  id,
  currentRole,
  currentUser,
  config,
  setConfig,
  auditEvents,
  setAuditEvents,
  navigate,
  verifySearch,
  setToast,
  setCurrentRole,
  adminSimulation,
  setAdminSimulation,
  resetAdminSeed
}) {
  const activeScreen = screen === "admin-entry" ? "admin-dashboard" : screen;
  const isAdmin = currentRole === "ADMINISTRATOR";

  function updateConfig(updater) {
    setConfig((current) => {
      const draft = structuredClone(current);
      updater(draft);
      return draft;
    });
  }

  function addAudit(payload) {
    const event = {
      eventId: makeAdminId("ADM-EVT"),
      actorId: currentUser.id,
      actorRole: currentRole,
      createdAt: adminNowIso(),
      ...payload
    };
    setAuditEvents((events) => [event, ...events]);
    return event;
  }

  function createPendingChange(change) {
    updateConfig((draft) => {
      draft.pendingChange = {
        changeId: makeAdminId("CHG"),
        status: "READY_TO_PUBLISH",
        createdAt: adminNowIso(),
        actorId: currentUser.id,
        ...change
      };
    });
    navigate("admin-impact-preview", { id: "latest" });
  }

  function publishPendingChange() {
    const errors = config.pendingChange?.type === "TAXONOMY" ? validateTaxonomyPublish(config) : [];
    const blockedBySod = config.pendingChange?.type === "PERMISSION_RISK";
    if (blockedBySod || errors.length) {
      updateConfig((draft) => {
        draft.pendingChange = {
          ...draft.pendingChange,
          status: "INVALID",
          errors: blockedBySod ? ["Không cho phép Contributor tự có quyền phê duyệt SOP trong prototype."] : errors
        };
      });
      setToast("Change đang bị chặn bởi rule cấu hình.");
      return;
    }

    const event = addAudit({
      action: config.pendingChange?.auditAction || "PUBLISH_CONFIG",
      objectType: config.pendingChange?.objectType || "ConfigurationChange",
      objectId: config.pendingChange?.objectId || config.pendingChange?.changeId || "FL-06",
      result: "SUCCESS",
      reason: config.pendingChange?.reason || "Publish cấu hình mock FL-06.",
      before: config.pendingChange?.before || config.publishedVersion,
      after: config.pendingChange?.after || `${config.publishedVersion}+1`
    });

    updateConfig((draft) => {
      draft.publishedVersion = nextVersion(draft.publishedVersion);
      draft.pendingChange = null;
    });
    setToast("Đã publish cấu hình và ghi audit event.");
    navigate("admin-operation-result", { id: event.eventId });
  }

  if (!isAdmin) {
    return <AdminAccessDenied currentRole={currentRole} adminSimulation={adminSimulation} navigate={navigate} />;
  }

  if (activeScreen === "admin-dashboard") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><AdminDashboard config={config} auditEvents={auditEvents} navigate={navigate} adminSimulation={adminSimulation} /></AdminFrame>;
  }
  if (activeScreen === "admin-users") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><AdminUsers config={config} updateConfig={updateConfig} navigate={navigate} addAudit={addAudit} /></AdminFrame>;
  }
  if (activeScreen === "admin-user-detail") {
    return <AdminFrame activeScreen="admin-users" navigate={navigate}><AdminUserDetail id={id} config={config} updateConfig={updateConfig} navigate={navigate} addAudit={addAudit} /></AdminFrame>;
  }
  if (activeScreen === "admin-role-simulator") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><RoleSimulator config={config} currentRole={currentRole} setCurrentRole={setCurrentRole} setAdminSimulation={setAdminSimulation} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-permissions") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><PermissionMatrix config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} addAudit={addAudit} /></AdminFrame>;
  }
  if (activeScreen === "admin-taxonomy") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><TaxonomyHome config={config} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-taxonomy-tree") {
    return <AdminFrame activeScreen="admin-taxonomy" navigate={navigate}><TaxonomyTree id={id} config={config} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-concept-editor") {
    return <AdminFrame activeScreen="admin-taxonomy" navigate={navigate}><ConceptEditor id={id} config={config} updateConfig={updateConfig} navigate={navigate} createPendingChange={createPendingChange} /></AdminFrame>;
  }
  if (activeScreen === "admin-synonyms") {
    return <AdminFrame activeScreen="admin-taxonomy" navigate={navigate}><SynonymManager config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} /></AdminFrame>;
  }
  if (activeScreen === "admin-metadata-templates") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><MetadataTemplates config={config} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-metadata-template") {
    return <AdminFrame activeScreen="admin-metadata-templates" navigate={navigate}><MetadataTemplateDetail id={id} config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} /></AdminFrame>;
  }
  if (activeScreen === "admin-content-types") {
    return <AdminFrame activeScreen="admin-metadata-templates" navigate={navigate}><ContentTypes config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} /></AdminFrame>;
  }
  if (activeScreen === "admin-search-config") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><SearchConfig config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} verifySearch={verifySearch} /></AdminFrame>;
  }
  if (activeScreen === "admin-lifecycle-policy") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><LifecyclePolicy config={config} updateConfig={updateConfig} createPendingChange={createPendingChange} /></AdminFrame>;
  }
  if (activeScreen === "admin-audit-log") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><AuditLog auditEvents={auditEvents} id={id} /></AdminFrame>;
  }
  if (activeScreen === "admin-demo-data") {
    return <AdminFrame activeScreen={activeScreen} navigate={navigate}><DemoData config={config} resetAdminSeed={resetAdminSeed} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-system-settings") {
    return <AdminFrame activeScreen="admin-dashboard" navigate={navigate}><SystemSettings config={config} /></AdminFrame>;
  }
  if (activeScreen === "admin-impact-preview") {
    return <AdminFrame activeScreen="admin-dashboard" navigate={navigate}><ImpactPreview config={config} publishPendingChange={publishPendingChange} navigate={navigate} /></AdminFrame>;
  }
  if (activeScreen === "admin-operation-result") {
    return <AdminFrame activeScreen="admin-audit-log" navigate={navigate}><OperationResult id={id} auditEvents={auditEvents} navigate={navigate} verifySearch={verifySearch} /></AdminFrame>;
  }
  return <AdminFrame activeScreen="admin-dashboard" navigate={navigate}><AdminDashboard config={config} auditEvents={auditEvents} navigate={navigate} adminSimulation={adminSimulation} /></AdminFrame>;
}

function AdminFrame({ activeScreen, navigate, children }) {
  return (
    <section className="page admin-page">
      <div className="admin-tabs">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeScreen === tab.screen || (tab.screen === "admin-taxonomy" && activeScreen.startsWith("admin-taxonomy"));
          return (
            <button key={tab.screen} className={active ? "admin-tab active" : "admin-tab"} type="button" onClick={() => navigate(tab.screen)}>
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {children}
    </section>
  );
}

function AdminDashboard({ config, auditEvents, navigate, adminSimulation }) {
  const activeUsers = config.demoUsers.filter((user) => user.status === "ACTIVE").length;
  const activeConcepts = config.taxonomyConcepts.filter((concept) => concept.status === "ACTIVE").length;
  const deprecatedConcepts = config.taxonomyConcepts.filter((concept) => concept.status === "DEPRECATED").length;
  return (
    <>
      <PageHeading eyebrow="FL-06" title="Quản trị hệ thống và phân loại tri thức" description="Admin Console mock để cấu hình role, permission, taxonomy, metadata, search behavior, lifecycle policy và seed data cho toàn bộ prototype.">
        <button className="primary-btn" type="button" onClick={() => navigate("admin-role-simulator")}><ShieldCheck size={16} />Mô phỏng role</button>
        <button className="secondary-btn" type="button" onClick={() => navigate("admin-impact-preview")}><Eye size={16} />Impact preview</button>
      </PageHeading>
      {adminSimulation && <div className="warning-banner neutral"><AlertTriangle size={18} /><span>Đang có simulation context. Nếu role hiện tại không còn là Admin, Admin Console sẽ bị chặn như direct URL thật.</span></div>}
      <div className="metric-grid">
        <Metric label="Demo users" value={activeUsers} note={`${config.demoUsers.length} user mock`} />
        <Metric label="Permission rules" value={config.permissionRules.length} note="Menu, route và action guard" />
        <Metric label="Concept đang dùng" value={activeConcepts} note={`${deprecatedConcepts} deprecated`} />
        <Metric label="Audit events" value={auditEvents.length} note={`Version ${config.publishedVersion}`} />
      </div>
      <div className="two-column">
        <article className="panel">
          <div className="panel-head"><h3>Cấu hình chính</h3></div>
          <div className="admin-card-grid">
            <ActionCard icon={Users} title="User & Role" text="Xem 6 demo users, role hiện tại và domain được gán." onClick={() => navigate("admin-users")} />
            <ActionCard icon={KeyRound} title="Permission Matrix" text="Kiểm tra quyền theo resource/action và rule SoD." onClick={() => navigate("admin-permissions")} />
            <ActionCard icon={ListTree} title="Taxonomy" text="Quản lý domain, loại lỗi, loại tài sản, danh mục và synonym." onClick={() => navigate("admin-taxonomy")} />
            <ActionCard icon={Settings} title="System Settings" text="Thông tin trạng thái, import/export mock và route guard." onClick={() => navigate("admin-system-settings")} />
          </div>
        </article>
        <article className="panel">
          <div className="panel-head"><h3>Audit gần đây</h3><button className="secondary-btn" type="button" onClick={() => navigate("admin-audit-log")}>Xem tất cả</button></div>
          <Timeline events={auditEvents.slice(0, 5)} />
        </article>
      </div>
    </>
  );
}

function AdminUsers({ config, updateConfig, navigate, addAudit }) {
  function toggleStatus(user) {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateConfig((draft) => {
      const target = draft.demoUsers.find((item) => item.userId === user.userId);
      target.status = nextStatus;
    });
    addAudit({ action: "UPDATE_USER_STATUS", objectType: "DemoUser", objectId: user.userId, result: "SUCCESS", reason: "Thay đổi trạng thái user mock.", before: user.status, after: nextStatus });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.2" title="Quản lý demo users" description="Danh sách user mock dùng cho role switcher, role simulator và route/action preview." />
      <div className="submission-list">
        {config.demoUsers.map((user) => (
          <article className="submission-card" key={user.userId}>
            <div>
              <div className="card-badges">
                <Badge tone={user.status === "ACTIVE" ? "good" : "neutral"}>{user.status === "ACTIVE" ? "Đang hoạt động" : "Tạm khóa"}</Badge>
                {user.roleIds.map((role) => <Badge key={role}>{adminRoleLabels[role]}</Badge>)}
              </div>
              <h3>{user.fullName}</h3>
              <p>{user.email} - {user.departmentId}</p>
            </div>
            <div className="sop-row-actions">
              <button className="secondary-btn" type="button" onClick={() => navigate("admin-user-detail", { id: user.userId })}>Chi tiết</button>
              <button className="ghost-btn" type="button" onClick={() => toggleStatus(user)}>{user.status === "ACTIVE" ? "Khóa mock" : "Mở lại"}</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function AdminUserDetail({ id, config, updateConfig, navigate, addAudit }) {
  const user = config.demoUsers.find((item) => item.userId === id) || config.demoUsers[0];
  const [selectedRoles, setSelectedRoles] = useState(user.roleIds);
  function saveRoles() {
    updateConfig((draft) => {
      draft.demoUsers.find((item) => item.userId === user.userId).roleIds = selectedRoles;
    });
    addAudit({ action: "UPDATE_USER_ROLES", objectType: "DemoUser", objectId: user.userId, result: "SUCCESS", reason: "Cập nhật role mock.", before: user.roleIds.join(", "), after: selectedRoles.join(", ") });
    navigate("admin-users");
  }
  return (
    <>
      <BackButton label="Quay lại danh sách user" onClick={() => navigate("admin-users")} />
      <PageHeading eyebrow={`User ${user.userId}`} title={user.fullName} description={`${user.email} - ${user.departmentId}`} />
      <div className="two-column">
        <article className="panel">
          <div className="panel-head"><h3>Role được gán</h3></div>
          <div className="checkbox-grid">
            {config.roles.map((role) => (
              <label className="check-row" key={role.roleId}>
                <input type="checkbox" checked={selectedRoles.includes(role.roleId)} onChange={(event) => setSelectedRoles((roles) => event.target.checked ? [...roles, role.roleId] : roles.filter((item) => item !== role.roleId))} />
                {role.name}
              </label>
            ))}
          </div>
          <div className="form-actions"><button className="primary-btn" type="button" onClick={saveRoles}><Save size={16} />Lưu role</button></div>
        </article>
        <article className="panel">
          <div className="panel-head"><h3>Preview quyền</h3></div>
          <PermissionPreview config={config} roleId={selectedRoles[0] || "FIELD_TECHNICIAN"} />
        </article>
      </div>
    </>
  );
}

function RoleSimulator({ config, currentRole, setCurrentRole, setAdminSimulation, navigate }) {
  function start(roleId) {
    setAdminSimulation({ baseRole: currentRole, simulatedRole: roleId, startedAt: adminNowIso() });
    setCurrentRole(roleId);
    navigate(roleId === "FIELD_TECHNICIAN" ? "search" : roleId === "KNOWLEDGE_MANAGER" ? "review-queue" : "dashboard");
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.1" title="Role simulator" description="Mô phỏng menu, route và CTA theo role. Đây không phải đăng nhập thật, chỉ là prototype guard." />
      <div className="admin-card-grid">
        {config.roles.map((role) => (
          <article className="panel admin-role-card" key={role.roleId}>
            <ShieldCheck size={24} />
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            <PermissionPreview config={config} roleId={role.roleId} compact />
            <button className="primary-btn wide" type="button" disabled={role.roleId === "ADMINISTRATOR"} onClick={() => start(role.roleId)}>Mô phỏng role này</button>
          </article>
        ))}
      </div>
    </>
  );
}

function PermissionMatrix({ config, updateConfig, createPendingChange, addAudit }) {
  function toggle(roleId, resource, action) {
    if (roleId === "CONTRIBUTOR" && resource === "SOP" && action === "APPROVE") {
      createPendingChange({
        type: "PERMISSION_RISK",
        title: "Cấp quyền Contributor phê duyệt SOP",
        summary: "Rule SoD chặn Contributor tự biên soạn rồi tự phê duyệt SOP.",
        auditAction: "UPDATE_PERMISSION_BLOCKED",
        objectType: "PermissionRule",
        objectId: "CONTRIBUTOR:SOP:APPROVE",
        reason: "Kiểm tra SoD theo FL-06."
      });
      return;
    }
    const existed = config.permissionRules.find((rule) => rule.roleId === roleId && rule.resource === resource && rule.action === action);
    updateConfig((draft) => {
      const found = draft.permissionRules.find((rule) => rule.roleId === roleId && rule.resource === resource && rule.action === action);
      if (found) found.allowed = !found.allowed;
      else draft.permissionRules.push({ roleId, resource, action, allowed: true });
    });
    addAudit({ action: "UPDATE_PERMISSION_DRAFT", objectType: "PermissionRule", objectId: `${roleId}:${resource}:${action}`, result: "SUCCESS", reason: "Toggle permission mock.", before: existed?.allowed ? "allowed" : "blocked", after: existed?.allowed ? "blocked" : "allowed" });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.3" title="Permission Matrix" description="Một nguồn permission dùng cho preview menu, route và action. Rule SoD sẽ chặn quyền có rủi ro." />
      <div className="warning-banner neutral"><AlertTriangle size={18} /><span>Demo nhanh: bấm ô Contributor / SOP / Phê duyệt để thấy Impact Preview bị chặn bởi SoD.</span></div>
      <div className="permission-table-wrap">
        <table className="permission-table">
          <thead>
            <tr>
              <th>Role</th>
              {resourceIds.map((resource) => <th key={resource}>{adminResourceLabels[resource]}</th>)}
            </tr>
          </thead>
          <tbody>
            {config.roles.map((role) => (
              <tr key={role.roleId}>
                <th>{role.name}</th>
                {resourceIds.map((resource) => (
                  <td key={resource}>
                    <div className="permission-chip-grid">
                      {actionIds.map((action) => (
                        <button key={action} className={hasPermission(config, role.roleId, resource, action) ? "permission-chip allowed" : "permission-chip"} type="button" onClick={() => toggle(role.roleId, resource, action)}>
                          {adminActionLabels[action]}
                        </button>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TaxonomyHome({ config, navigate }) {
  return (
    <>
      <PageHeading eyebrow="FL-06.4" title="Taxonomy Management" description="Quản lý domain, category, concept, preferred label, synonym, broader/narrower và deprecated term.">
        <button className="primary-btn" type="button" onClick={() => navigate("admin-synonyms")}><Sparkles size={16} />Quản lý synonym</button>
      </PageHeading>
      <div className="admin-card-grid">
        {config.taxonomySchemes.map((scheme) => {
          const concepts = config.taxonomyConcepts.filter((concept) => concept.schemeId === scheme.schemeId);
          return (
            <article className="panel" key={scheme.schemeId}>
              <div className="panel-head"><h3>{scheme.name}</h3><Badge>{scheme.status}</Badge></div>
              <p>{concepts.filter((concept) => concept.status === "ACTIVE").length} active concept, {concepts.filter((concept) => concept.status === "DEPRECATED").length} deprecated.</p>
              <div className="form-actions">
                <button className="secondary-btn" type="button" onClick={() => navigate("admin-taxonomy-tree", { id: scheme.schemeId })}>Mở cây</button>
                <button className="primary-btn" type="button" onClick={() => navigate("admin-concept-editor", { id: `new:${scheme.schemeId}` })}>Thêm concept</button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function TaxonomyTree({ id, config, navigate }) {
  const scheme = config.taxonomySchemes.find((item) => item.schemeId === id) || config.taxonomySchemes[0];
  const concepts = config.taxonomyConcepts.filter((concept) => concept.schemeId === scheme.schemeId);
  return (
    <>
      <BackButton label="Quay lại taxonomy" onClick={() => navigate("admin-taxonomy")} />
      <PageHeading eyebrow={scheme.version} title={scheme.name} description="Danh sách concept và usage count. Concept đã có usage không bị hard delete trong prototype." />
      <div className="submission-list">
        {concepts.map((concept) => (
          <article className="submission-card" key={concept.conceptId}>
            <div>
              <div className="card-badges">
                <Badge tone={concept.status === "ACTIVE" ? "good" : concept.status === "DEPRECATED" ? "warning" : "neutral"}>{concept.status}</Badge>
                <Badge tone="neutral">Usage {concept.usageCount}</Badge>
              </div>
              <h3>{concept.prefLabel}</h3>
              <p>{concept.definition}</p>
              <small>Synonym: {(concept.altLabels || []).join(", ") || "Chưa có"}</small>
            </div>
            <button className="primary-btn" type="button" onClick={() => navigate("admin-concept-editor", { id: concept.conceptId })}>Chỉnh sửa</button>
          </article>
        ))}
      </div>
    </>
  );
}

function ConceptEditor({ id, config, updateConfig, navigate, createPendingChange }) {
  const [mode, schemeId] = (id || "").startsWith("new:") ? ["new", id.split(":")[1]] : ["edit", ""];
  const current = mode === "edit" ? config.taxonomyConcepts.find((concept) => concept.conceptId === id) : null;
  const [form, setForm] = useState(current || {
    conceptId: makeAdminId("CONCEPT"),
    schemeId,
    value: "",
    prefLabel: "",
    altLabels: [],
    definition: "",
    broaderConceptId: "",
    relatedConceptIds: [],
    status: "ACTIVE",
    replacedById: "",
    usageCount: 0
  });
  function change(field, value) {
    setForm((item) => ({ ...item, [field]: value }));
  }
  function save() {
    updateConfig((draft) => {
      const index = draft.taxonomyConcepts.findIndex((concept) => concept.conceptId === form.conceptId);
      if (index >= 0) draft.taxonomyConcepts[index] = form;
      else draft.taxonomyConcepts.push(form);
    });
    createPendingChange({
      type: "TAXONOMY",
      title: `Publish taxonomy concept: ${form.prefLabel}`,
      summary: "Thay đổi concept sẽ ảnh hưởng filter FL-01, form FL-02/FL-03 và synonym expansion.",
      auditAction: "PUBLISH_TAXONOMY",
      objectType: "TaxonomyConcept",
      objectId: form.conceptId,
      reason: "Cập nhật taxonomy theo FL-06.",
      before: current?.prefLabel || "new concept",
      after: form.prefLabel
    });
  }
  return (
    <>
      <BackButton label="Quay lại cây taxonomy" onClick={() => navigate("admin-taxonomy-tree", { id: form.schemeId })} />
      <PageHeading eyebrow="Concept Editor" title={mode === "new" ? "Thêm concept" : form.prefLabel} description="Lưu thay đổi sẽ đi qua Impact Preview trước khi publish." />
      <article className="panel form-panel">
        <div className="form-main">
          <label><span>Preferred label</span><input value={form.prefLabel} onChange={(event) => change("prefLabel", event.target.value)} /></label>
          <label><span>Value code</span><input value={form.value} onChange={(event) => change("value", event.target.value.toUpperCase().replace(/\s+/g, "_"))} /></label>
          <label><span>Scheme</span><select value={form.schemeId} onChange={(event) => change("schemeId", event.target.value)}>{config.taxonomySchemes.map((scheme) => <option key={scheme.schemeId} value={scheme.schemeId}>{scheme.name}</option>)}</select></label>
          <label><span>Status</span><select value={form.status} onChange={(event) => change("status", event.target.value)}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="DEPRECATED">DEPRECATED</option></select></label>
        </div>
        <label><span>Definition</span><textarea value={form.definition} onChange={(event) => change("definition", event.target.value)} /></label>
        <label><span>Synonym, cách nhau bằng dấu phẩy</span><input value={(form.altLabels || []).join(", ")} onChange={(event) => change("altLabels", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
        <div className="form-actions"><button className="primary-btn" type="button" onClick={save}><Save size={16} />Lưu và xem impact</button></div>
      </article>
    </>
  );
}

function SynonymManager({ config, updateConfig, createPendingChange }) {
  const [term, setTerm] = useState("Mất điện");
  const [conceptId, setConceptId] = useState("FAULT_VOLTAGE_DROP");
  const activeConcepts = config.taxonomyConcepts.filter((concept) => concept.status === "ACTIVE");
  function addSynonym() {
    const concept = config.taxonomyConcepts.find((item) => item.conceptId === conceptId);
    updateConfig((draft) => {
      const target = draft.taxonomyConcepts.find((item) => item.conceptId === conceptId);
      target.altLabels = [...new Set([...(target.altLabels || []), term.trim()].filter(Boolean))];
    });
    createPendingChange({
      type: "TAXONOMY",
      title: `Thêm synonym "${term}"`,
      summary: `Synonym mới sẽ map về concept "${concept.prefLabel}" và ảnh hưởng query expansion trong FL-01.`,
      auditAction: "PUBLISH_SYNONYM",
      objectType: "TaxonomyConcept",
      objectId: conceptId,
      reason: "Bổ sung thuật ngữ người dùng hiện trường hay nhập.",
      before: (concept.altLabels || []).join(", "),
      after: [...new Set([...(concept.altLabels || []), term.trim()].filter(Boolean))].join(", ")
    });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.4" title="Quản lý synonym" description="Synonym sau khi publish sẽ được dùng bởi FL-01 Search và các form chọn taxonomy." />
      <article className="panel form-panel">
        <div className="form-main">
          <label><span>Thuật ngữ người dùng nhập</span><input value={term} onChange={(event) => setTerm(event.target.value)} /></label>
          <label><span>Concept chuẩn</span><select value={conceptId} onChange={(event) => setConceptId(event.target.value)}>{activeConcepts.map((concept) => <option key={concept.conceptId} value={concept.conceptId}>{concept.prefLabel} - {concept.schemeId}</option>)}</select></label>
        </div>
        <div className="form-actions"><button className="primary-btn" type="button" onClick={addSynonym}><Sparkles size={16} />Thêm synonym và xem impact</button></div>
      </article>
      <div className="submission-list">
        {activeConcepts.filter((concept) => concept.altLabels?.length).map((concept) => (
          <article className="submission-card" key={concept.conceptId}>
            <div><h3>{concept.prefLabel}</h3><p>{concept.altLabels.join(", ")}</p></div>
            <Badge>{concept.schemeId}</Badge>
          </article>
        ))}
      </div>
    </>
  );
}

function MetadataTemplates({ config, navigate }) {
  return (
    <>
      <PageHeading eyebrow="FL-06.5" title="Metadata templates" description="Cấu hình field bắt buộc/hiển thị theo role cho từng loại nội dung.">
        <button className="secondary-btn" type="button" onClick={() => navigate("admin-content-types")}>Content types</button>
      </PageHeading>
      <div className="admin-card-grid">
        {config.metadataTemplates.map((template) => (
          <article className="panel" key={template.templateId}>
            <div className="panel-head"><h3>{template.name}</h3><Badge>{template.status}</Badge></div>
            <p>{template.fields.length} field - áp dụng cho {template.contentType}</p>
            <button className="primary-btn wide" type="button" onClick={() => navigate("admin-metadata-template", { id: template.templateId })}>Mở template</button>
          </article>
        ))}
      </div>
    </>
  );
}

function MetadataTemplateDetail({ id, config, updateConfig, createPendingChange }) {
  const template = config.metadataTemplates.find((item) => item.templateId === id) || config.metadataTemplates[0];
  function toggleRequired(fieldId) {
    updateConfig((draft) => {
      const target = draft.metadataTemplates.find((item) => item.templateId === template.templateId).fields.find((field) => field.fieldId === fieldId);
      target.required = !target.required;
    });
  }
  return (
    <>
      <PageHeading eyebrow={template.templateId} title={template.name} description="Toggle required để demo rule cấu hình metadata." />
      <article className="panel">
        <div className="submission-list">
          {template.fields.map((field) => (
            <div className="compact-row" key={field.fieldId}>
              <span><strong>{field.label}</strong><small>{field.type} - visible: {field.visibleRoleIds.map((role) => adminRoleLabels[role]).join(", ")}</small></span>
              <button className={field.required ? "primary-btn" : "secondary-btn"} type="button" onClick={() => toggleRequired(field.fieldId)}>{field.required ? "Bắt buộc" : "Tùy chọn"}</button>
            </div>
          ))}
        </div>
        <div className="form-actions"><button className="primary-btn" type="button" onClick={() => createPendingChange({ type: "METADATA", title: `Publish ${template.name}`, summary: "Thay đổi template ảnh hưởng form FL-02/FL-03/FL-04.", auditAction: "PUBLISH_METADATA_TEMPLATE", objectType: "MetadataTemplate", objectId: template.templateId, reason: "Cập nhật metadata template mock." })}>Xem impact</button></div>
      </article>
    </>
  );
}

function ContentTypes({ config, updateConfig, createPendingChange }) {
  function toggleStatus(type) {
    updateConfig((draft) => {
      const target = draft.contentTypes.find((item) => item.contentTypeId === type.contentTypeId);
      target.status = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.5" title="Content type configuration" description="Quản lý mapping loại nội dung với workflow và metadata template." />
      <div className="submission-list">
        {config.contentTypes.map((type) => (
          <article className="submission-card" key={type.contentTypeId}>
            <div><div className="card-badges"><Badge>{type.workflowCode}</Badge><Badge tone={type.status === "ACTIVE" ? "good" : "neutral"}>{type.status}</Badge></div><h3>{type.label}</h3><p>Template: {type.templateId}</p></div>
            <button className="secondary-btn" type="button" onClick={() => toggleStatus(type)}>{type.status === "ACTIVE" ? "Tạm ẩn" : "Kích hoạt"}</button>
          </article>
        ))}
      </div>
      <div className="form-actions"><button className="primary-btn" type="button" onClick={() => createPendingChange({ type: "CONTENT_TYPE", title: "Publish content type config", summary: "Thay đổi ảnh hưởng filter loại nội dung và entry workflow.", auditAction: "PUBLISH_CONTENT_TYPE", objectType: "ContentType", objectId: "ALL", reason: "Cập nhật content type mock." })}>Xem impact</button></div>
    </>
  );
}

function SearchConfig({ config, updateConfig, createPendingChange, verifySearch }) {
  const search = config.searchConfig;
  function change(field, value) {
    updateConfig((draft) => { draft.searchConfig[field] = value; });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.6" title="Cấu hình tìm kiếm và filter" description="Điều khiển synonym expansion, deprecated redirect, default sort và filter visible cho FL-01." />
      <article className="panel form-panel">
        <div className="checkbox-grid">
          <label className="check-row"><input type="checkbox" checked={search.synonymExpansion} onChange={(event) => change("synonymExpansion", event.target.checked)} />Bật synonym expansion</label>
          <label className="check-row"><input type="checkbox" checked={search.deprecatedRedirect} onChange={(event) => change("deprecatedRedirect", event.target.checked)} />Redirect deprecated term</label>
        </div>
        <div className="form-main">
          <label><span>Default sort</span><select value={search.defaultSort} onChange={(event) => change("defaultSort", event.target.value)}><option value="RELEVANCE">Mức độ phù hợp</option><option value="UPDATED">Ngày cập nhật</option><option value="HELPFUL">Helpful rate</option></select></label>
          <label><span>Min query length</span><input type="number" min="1" value={search.minQueryLength} onChange={(event) => change("minQueryLength", Number(event.target.value))} /></label>
        </div>
        <div className="form-actions">
          <button className="secondary-btn" type="button" onClick={() => verifySearch("Mất điện")}>Thử FL-01 query</button>
          <button className="primary-btn" type="button" onClick={() => createPendingChange({ type: "SEARCH", title: "Publish search configuration", summary: "Thay đổi tác động trực tiếp đến FL-01 Search Results.", auditAction: "PUBLISH_SEARCH_CONFIG", objectType: "SearchConfig", objectId: "FL-01", reason: "Cập nhật search behavior." })}>Xem impact</button>
        </div>
      </article>
    </>
  );
}

function LifecyclePolicy({ config, updateConfig, createPendingChange }) {
  const policy = config.lifecyclePolicy;
  function change(field, value) {
    updateConfig((draft) => { draft.lifecyclePolicy[field] = value; });
  }
  return (
    <>
      <PageHeading eyebrow="FL-06.7" title="Lifecycle policy & notification" description="Cấu hình chu kỳ review và notification template cho FL-05." />
      <article className="panel form-panel">
        <div className="form-main">
          <label><span>SOP review days</span><input type="number" value={policy.sopReviewDays} onChange={(event) => change("sopReviewDays", Number(event.target.value))} /></label>
          <label><span>Article review days</span><input type="number" value={policy.articleReviewDays} onChange={(event) => change("articleReviewDays", Number(event.target.value))} /></label>
          <label><span>Helpful threshold</span><input type="number" value={policy.lowHelpfulThreshold} onChange={(event) => change("lowHelpfulThreshold", Number(event.target.value))} /></label>
          <label className="check-row"><input type="checkbox" checked={policy.autoCreateReviewTask} onChange={(event) => change("autoCreateReviewTask", event.target.checked)} />Tự tạo review task</label>
        </div>
        <label><span>Notification template</span><textarea value={policy.notificationTemplate} onChange={(event) => change("notificationTemplate", event.target.value)} /></label>
        <div className="form-actions"><button className="primary-btn" type="button" onClick={() => createPendingChange({ type: "LIFECYCLE_POLICY", title: "Publish lifecycle policy", summary: "Thay đổi ảnh hưởng FL-05 dashboard, review task và notification mock.", auditAction: "PUBLISH_LIFECYCLE_POLICY", objectType: "LifecyclePolicy", objectId: "FL-05", reason: "Cập nhật lifecycle policy." })}>Xem impact</button></div>
      </article>
    </>
  );
}

function AuditLog({ auditEvents, id }) {
  const selected = id ? auditEvents.find((event) => event.eventId === id) : null;
  return (
    <>
      <PageHeading eyebrow="FL-06.8" title="Audit log & config history" description="Mỗi thay đổi cấu hình đều ghi actor, role, thời gian, object, before/after, reason và result." />
      {selected && <AuditDetail event={selected} />}
      <div className="submission-list">
        {auditEvents.map((event) => <AuditRow event={event} key={event.eventId} />)}
      </div>
    </>
  );
}

function DemoData({ config, resetAdminSeed, navigate }) {
  const [confirmText, setConfirmText] = useState("");
  const canReset = confirmText === "RESET FL06";
  return (
    <>
      <PageHeading eyebrow="FL-06.9" title="Import, export và reset seed data" description="Prototype cho phép export JSON mock và reset seed. Reset Admin Console sẽ đưa role về Quản trị viên." />
      <div className="two-column">
        <article className="panel">
          <div className="panel-head"><h3>Seed state</h3><Badge>{config.seedState.seedVersion}</Badge></div>
          <InfoGrid rows={[["Checksum", config.seedState.checksum], ["Published taxonomy", config.publishedVersion], ["Last import", formatDate(config.seedState.lastImportedAt)], ["Last reset", config.seedState.lastResetAt ? formatDate(config.seedState.lastResetAt) : "Chưa reset trong phiên này"]]} />
          <div className="form-actions">
            <button className="secondary-btn" type="button" onClick={() => downloadJson("kms-fl06-admin-config.json", config)}><Download size={16} />Export JSON</button>
            <button className="secondary-btn" type="button" onClick={() => navigate("admin-audit-log")}>Xem audit</button>
          </div>
        </article>
        <article className="panel form-panel">
          <div className="panel-head"><h3>Reset seed</h3></div>
          <p className="hint">Nhập đúng <strong>RESET FL06</strong> để reset Admin Console và role về Quản trị viên.</p>
          <input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="RESET FL06" />
          <button className="primary-btn danger-btn" type="button" disabled={!canReset} onClick={resetAdminSeed}><RotateCcw size={16} />Reset FL-06 seed</button>
        </article>
      </div>
    </>
  );
}

function SystemSettings({ config }) {
  return (
    <>
      <PageHeading eyebrow="FL-06" title="System settings" description="Trạng thái mock của Admin Console. Không có IAM/SSO/backend trong prototype." />
      <div className="metric-grid">
        <Metric label="Mode" value="Prototype" note="Front-end only" />
        <Metric label="Auth" value="Mock" note="Role switcher/role simulator" />
        <Metric label="Storage" value="Local" note="localStorage seed" />
        <Metric label="Version" value={config.configVersion} note={config.publishedVersion} />
      </div>
    </>
  );
}

function ImpactPreview({ config, publishPendingChange, navigate }) {
  const change = config.pendingChange;
  const taxonomyErrors = change?.type === "TAXONOMY" ? validateTaxonomyPublish(config) : [];
  const errors = change?.type === "PERMISSION_RISK" ? ["Không cho phép Contributor có quyền phê duyệt SOP vì vi phạm Separation of Duties."] : taxonomyErrors;
  if (!change) {
    return (
      <>
        <PageHeading eyebrow="Impact Preview" title="Chưa có change cần publish" description="Hãy tạo thay đổi ở Taxonomy, Permission, Metadata, Search hoặc Lifecycle policy trước." />
        <div className="admin-card-grid">
          <ActionCard icon={Sparkles} title="Thêm synonym demo" text="Mở màn hình Synonym để thêm Mất điện -> Sụt áp." onClick={() => navigate("admin-synonyms")} />
          <ActionCard icon={KeyRound} title="Thử SoD permission" text="Mở Permission Matrix và cấp Contributor Approve SOP." onClick={() => navigate("admin-permissions")} />
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeading eyebrow="Impact Preview" title={change.title} description={change.summary}>
        <Badge tone={errors.length ? "danger" : "good"}>{errors.length ? "INVALID" : "READY_TO_PUBLISH"}</Badge>
      </PageHeading>
      {errors.length > 0 && <div className="error-summary"><strong>Không thể publish</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      <div className="two-column">
        <article className="panel">
          <div className="panel-head"><h3>Màn hình bị ảnh hưởng</h3></div>
          <ul className="checklist impact-list">
            <li><CheckCircle2 size={18} /><span>FL-01 Search: query expansion, filter loại lỗi/thiết bị/danh mục.</span></li>
            <li><CheckCircle2 size={18} /><span>FL-02 Submit Form: dropdown taxonomy và metadata bắt buộc.</span></li>
            <li><CheckCircle2 size={18} /><span>FL-03 SOP Editor: metadata template và content type mapping.</span></li>
            <li><CheckCircle2 size={18} /><span>FL-05 Lifecycle: review policy, notification và audit history.</span></li>
          </ul>
        </article>
        <article className="panel">
          <div className="panel-head"><h3>Before / After</h3></div>
          <InfoGrid rows={[["Change ID", change.changeId], ["Object", `${change.objectType || "-"} / ${change.objectId || "-"}`], ["Before", change.before || "-"], ["After", change.after || "-"], ["Reason", change.reason || "-"]]} />
        </article>
      </div>
      <div className="sticky-actions">
        <button className="secondary-btn" type="button" onClick={() => navigate("admin-dashboard")}>Hủy</button>
        <button className="primary-btn" type="button" disabled={errors.length > 0} onClick={publishPendingChange}>Confirm & publish</button>
      </div>
    </>
  );
}

function OperationResult({ id, auditEvents, navigate, verifySearch }) {
  const event = auditEvents.find((item) => item.eventId === id) || auditEvents[0];
  return (
    <div className="success-screen">
      <CheckCircle2 size={48} />
      <h2>Thao tác cấu hình đã hoàn tất</h2>
      <p>{event?.action} - {event?.objectId}</p>
      {event && <AuditDetail event={event} />}
      <div className="submission-actions">
        <button className="primary-btn" type="button" onClick={() => navigate("admin-audit-log", { id: event?.eventId })}>Xem audit detail</button>
        <button className="secondary-btn" type="button" onClick={() => verifySearch("Mất điện")}>Verify ở FL-01</button>
        <button className="ghost-btn" type="button" onClick={() => navigate("admin-dashboard")}>Về Admin Dashboard</button>
      </div>
    </div>
  );
}

function AdminAccessDenied({ currentRole, adminSimulation, navigate }) {
  return (
    <section className="page">
      <div className="access-denied">
        <Lock size={42} />
        <h2>Không có quyền truy cập Admin Console</h2>
        <p>Role hiện tại: {adminRoleLabels[currentRole] || currentRole}. Route guard FL-06 chặn cả truy cập trực tiếp qua URL.</p>
        {adminSimulation && <p>Đang mô phỏng role từ Admin. Dùng nút "Thoát mô phỏng" trên topbar để quay lại Quản trị viên.</p>}
        <button className="primary-btn" type="button" onClick={() => navigate("dashboard")}>Về Dashboard</button>
      </div>
    </section>
  );
}

function PermissionPreview({ config, roleId, compact = false }) {
  const allowed = config.permissionRules.filter((rule) => rule.roleId === roleId && rule.allowed);
  return (
    <div className={compact ? "permission-preview compact" : "permission-preview"}>
      {allowed.slice(0, compact ? 5 : 10).map((rule) => <Badge key={`${rule.resource}-${rule.action}`} tone={rule.resource === "ADMIN" ? "warning" : "neutral"}>{adminResourceLabels[rule.resource]}: {adminActionLabels[rule.action]}</Badge>)}
      {!allowed.length && <p className="hint">Role chưa có quyền nào.</p>}
    </div>
  );
}

function Metric({ label, value, note }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}

function ActionCard({ icon: Icon, title, text, onClick }) {
  return (
    <button className="action-card" type="button" onClick={onClick}>
      <Icon size={22} />
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </div>
  );
}

function BackButton({ label, onClick }) {
  return <button className="back-btn" type="button" onClick={onClick}>← {label}</button>;
}

function Badge({ children, tone = "primary" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function InfoGrid({ rows }) {
  return (
    <dl className="info-grid">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

function Timeline({ events }) {
  if (!events.length) return <p className="hint">Chưa có audit event.</p>;
  return <ul className="timeline">{events.map((event) => <li key={event.eventId}><strong>{event.action}</strong><span>{formatDate(event.createdAt)} - {event.actorId}</span><p>{event.reason}</p></li>)}</ul>;
}

function AuditRow({ event }) {
  return (
    <article className="submission-card">
      <div>
        <div className="card-badges"><Badge tone={event.result === "SUCCESS" ? "good" : "danger"}>{event.result}</Badge><Badge tone="neutral">{event.actorRole}</Badge></div>
        <h3>{event.action}</h3>
        <p>{event.objectType} / {event.objectId} - {event.reason}</p>
        <small>{formatDate(event.createdAt)} - Actor {event.actorId}</small>
      </div>
      <Badge>{event.eventId}</Badge>
    </article>
  );
}

function AuditDetail({ event }) {
  return (
    <article className="panel audit-detail">
      <InfoGrid rows={[
        ["Event ID", event.eventId],
        ["Actor", `${event.actorId} / ${event.actorRole}`],
        ["Time", formatDate(event.createdAt)],
        ["Object", `${event.objectType} / ${event.objectId}`],
        ["Before", event.before || "-"],
        ["After", event.after || "-"],
        ["Reason", event.reason || "-"],
        ["Result", event.result]
      ]} />
    </article>
  );
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function nextVersion(value) {
  const match = /v(\d+)\.(\d+)/i.exec(value || "v2.4");
  if (!match) return "TAX-v2.5";
  return `${(value || "TAX-").split("v")[0]}v${match[1]}.${Number(match[2]) + 1}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
