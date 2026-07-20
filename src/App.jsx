import React, { useMemo, useState } from "react";
import { ExternalLink, Monitor, X } from "lucide-react";

const screens = [
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    src: "/stitch-prototype/dashboard/code.html",
    note: "Home Dashboard"
  },
  {
    id: "knowledge",
    label: "Cơ sở tri thức",
    src: "/stitch-prototype/knowledge/code.html",
    note: "Knowledge Search"
  },
  {
    id: "knowledge-detail",
    label: "Chi tiết tri thức",
    src: "/stitch-prototype/knowledge-detail/code.html",
    note: "Knowledge Detail"
  },
  {
    id: "submit",
    label: "Gửi tri thức",
    src: "/stitch-prototype/submit/code.html",
    note: "Submit Form"
  },
  {
    id: "review",
    label: "Xét duyệt",
    src: "/stitch-prototype/review/code.html",
    note: "Review Queue"
  },
  {
    id: "sops",
    label: "Thư viện SOP",
    src: "/stitch-prototype/sops/code.html",
    note: "SOP Library"
  },
  {
    id: "sop-detail",
    label: "Chi tiết SOP",
    src: "/stitch-prototype/sop-detail/code.html",
    note: "SOP Detail"
  },
  {
    id: "create-sop",
    label: "Tạo SOP",
    src: "/stitch-prototype/create-sop/code.html",
    note: "Create SOP"
  }
];

export default function App() {
  const [activeId, setActiveId] = useState("dashboard");
  const [showSwitcher, setShowSwitcher] = useState(true);

  const activeScreen = useMemo(
    () => screens.find((screen) => screen.id === activeId) || screens[0],
    [activeId]
  );

  return (
    <main className="stitch-viewer">
      <iframe
        key={activeScreen.id}
        className="stitch-frame"
        src={activeScreen.src}
        title={`LABSL KMS Prototype - ${activeScreen.label}`}
      />

      {showSwitcher ? (
        <aside className="prototype-switcher" aria-label="Prototype screen switcher">
          <div className="switcher-head">
            <div>
              <span>
                <Monitor size={14} />
                Đang xem
              </span>
              <strong>{activeScreen.label}</strong>
              <small>{activeScreen.note}</small>
            </div>
            <button type="button" onClick={() => setShowSwitcher(false)} aria-label="Hide screen switcher">
              <X size={16} />
            </button>
          </div>

          <div className="screen-list">
            {screens.map((screen) => (
              <button
                className={screen.id === activeId ? "screen-chip active" : "screen-chip"}
                key={screen.id}
                onClick={() => setActiveId(screen.id)}
                type="button"
              >
                <span>{screen.label}</span>
                <small>{screen.note}</small>
              </button>
            ))}
          </div>

          <a className="open-screen" href={activeScreen.src} target="_blank" rel="noreferrer">
            Mở màn hình gốc
            <ExternalLink size={14} />
          </a>
        </aside>
      ) : (
        <button className="show-switcher" type="button" onClick={() => setShowSwitcher(true)}>
          <Monitor size={16} />
          Màn hình
        </button>
      )}
    </main>
  );
}
