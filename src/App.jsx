import React, { useEffect, useMemo, useRef, useState } from "react";

const screens = {
  dashboard: {
    label: "Bảng điều khiển",
    src: "/stitch-prototype/dashboard/code.html"
  },
  knowledge: {
    label: "Cơ sở tri thức",
    src: "/stitch-prototype/knowledge/code.html"
  },
  "knowledge-detail": {
    label: "Chi tiết tri thức",
    src: "/stitch-prototype/knowledge-detail/code.html"
  },
  submit: {
    label: "Gửi tri thức",
    src: "/stitch-prototype/submit/code.html"
  },
  review: {
    label: "Xét duyệt",
    src: "/stitch-prototype/review/code.html"
  },
  sops: {
    label: "Thư viện SOP",
    src: "/stitch-prototype/sops/code.html"
  },
  "sop-detail": {
    label: "Chi tiết SOP",
    src: "/stitch-prototype/sop-detail/code.html"
  },
  "create-sop": {
    label: "Tạo SOP",
    src: "/stitch-prototype/create-sop/code.html"
  }
};

const routeMatchers = [
  { screen: "knowledge-detail", patterns: ["xem chi tiết & sop", "chi tiết tri thức"] },
  { screen: "sop-detail", patterns: ["xem toàn bộ sop", "bảo trì máy biến áp cao thế", "chi tiết sop"] },
  { screen: "create-sop", patterns: ["tạo sop mới", "tạo quy trình chuẩn"] },
  { screen: "dashboard", patterns: ["bảng điều khiển", "dashboard"] },
  { screen: "knowledge", patterns: ["cơ sở tri thức", "cơ sở kiến thức", "knowledge base"] },
  { screen: "submit", patterns: ["gửi yêu cầu", "gửi tri thức", "gửi ca", "submit case"] },
  { screen: "review", patterns: ["hàng đợi xét duyệt", "hàng đợi đánh giá", "review queue"] },
  { screen: "sops", patterns: ["quy trình vận hành", "thư viện sop", "sops"] }
];

const activeNavByScreen = {
  dashboard: "dashboard",
  knowledge: "knowledge",
  "knowledge-detail": "knowledge",
  submit: "submit",
  review: "review",
  sops: "sops",
  "sop-detail": "sops",
  "create-sop": "sops"
};

const sidebarItems = [
  { id: "dashboard", label: "Bảng điều khiển", icon: "dashboard" },
  { id: "knowledge", label: "Cơ sở tri thức", icon: "library_books" },
  { id: "submit", label: "Gửi yêu cầu", icon: "post_add" },
  { id: "review", label: "Hàng đợi xét duyệt", icon: "pending_actions" },
  { id: "sops", label: "Quy trình vận hành (SOP)", icon: "menu_book" }
];

function canonicalSidebar(activeScreen) {
  const activeNav = activeNavByScreen[activeScreen] || "dashboard";

  const navMarkup = sidebarItems
    .map((item) => {
      const active = item.id === activeNav;
      const className = active
        ? "flex items-center gap-md p-md bg-primary-container text-on-primary-container rounded-lg cursor-pointer transition-all duration-200"
        : "flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all duration-200";
      const fill = active ? " style=\"font-variation-settings: 'FILL' 1;\"" : "";
      return `
        <a class="${className}" href="#" data-prototype-route="${item.id}">
          <span class="material-symbols-outlined"${fill} data-icon="${item.icon}">${item.icon}</span>
          <span class="font-label-md text-label-md">${item.label}</span>
        </a>`;
    })
    .join("");

  return `
    <aside class="w-[280px] h-screen flex-shrink-0 bg-surface-container border-r border-outline-variant flex flex-col py-lg px-md gap-sm fixed left-0 top-0 z-[60]">
      <div class="mb-lg px-sm">
        <h1 class="font-headline-sm text-headline-sm text-primary">Cục Chiếu sáng Đường phố LA</h1>
        <p class="font-label-md text-label-md text-on-surface-variant opacity-70">Hệ thống Quản lý Tri thức</p>
      </div>
      <nav class="flex-grow flex flex-col gap-xs">
        ${navMarkup}
      </nav>
      <div class="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md">
        <a class="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all duration-200" href="#">
          <span class="material-symbols-outlined" data-icon="help">help</span>
          <span class="font-label-md text-label-md">Trung tâm Trợ giúp</span>
        </a>
        <a class="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all duration-200" href="#">
          <span class="material-symbols-outlined" data-icon="logout">logout</span>
          <span class="font-label-md text-label-md">Đăng xuất</span>
        </a>
      </div>
    </aside>`;
}

function replaceSidebar(rawHtml, activeScreen) {
  const sidebar = canonicalSidebar(activeScreen);
  const fixedNavPattern = /<nav\b(?=[^>]*\bfixed\b)(?=[^>]*\bleft-0\b)[\s\S]*?<\/nav>/i;
  if (fixedNavPattern.test(rawHtml)) {
    return rawHtml.replace(fixedNavPattern, sidebar);
  }

  const sidebarAsidePattern = /<aside\b(?=[^>]*(?:w-\[280px\]|w-\[280px\]|fixed))(?=[^>]*(?:left-0|h-screen|h-full))[\s\S]*?<\/aside>/i;
  if (sidebarAsidePattern.test(rawHtml)) {
    return rawHtml.replace(sidebarAsidePattern, sidebar);
  }

  return rawHtml;
}

function buildInjectedHtml(rawHtml, activeScreen) {
  const htmlWithCanonicalSidebar = replaceSidebar(rawHtml, activeScreen);
  const routeConfig = JSON.stringify(routeMatchers);
  const active = JSON.stringify(activeScreen);

  const bridgeScript = `
<script>
(() => {
  const ACTIVE_SCREEN = ${active};
  const ROUTES = ${routeConfig};
  const post = (message) => window.parent.postMessage({ source: "labs-kms-prototype", ...message }, "*");

  const normalize = (value) => (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/\\s+/g, " ")
    .trim();

  const routeFromTarget = (target) => {
    const explicitRoute = target.getAttribute("data-prototype-route");
    if (explicitRoute) return explicitRoute;

    const rawText = [
      target.innerText,
      target.textContent,
      target.getAttribute("aria-label"),
      target.getAttribute("title"),
      target.getAttribute("href")
    ].filter(Boolean).join(" ");
    const text = normalize(rawText);
    if (!text) return null;

    for (const route of ROUTES) {
      if (route.patterns.some((pattern) => text.includes(normalize(pattern)))) {
        return route.screen;
      }
    }
    return null;
  };

  const showToast = (message, tone = "primary") => {
    let toast = document.querySelector("[data-prototype-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.setAttribute("data-prototype-toast", "true");
      toast.style.cssText = [
        "position:fixed",
        "right:24px",
        "bottom:24px",
        "z-index:99999",
        "max-width:360px",
        "padding:14px 16px",
        "border-radius:8px",
        "box-shadow:0 20px 45px rgba(0,0,0,.18)",
        "font-family:Inter,system-ui,sans-serif",
        "font-size:14px",
        "font-weight:700",
        "line-height:1.4",
        "transition:opacity .18s ease, transform .18s ease",
        "opacity:0",
        "transform:translateY(8px)"
      ].join(";");
      document.body.appendChild(toast);
    }

    const palette = {
      primary: ["#003366", "#ffffff"],
      success: ["#137333", "#ffffff"],
      warning: ["#ffca63", "#341100"],
      danger: ["#ba1a1a", "#ffffff"]
    }[tone] || ["#003366", "#ffffff"];
    toast.style.background = palette[0];
    toast.style.color = palette[1];
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    window.clearTimeout(window.__prototypeToastTimer);
    window.__prototypeToastTimer = window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
    }, 2200);
  };

  const handlePrototypeAction = (target) => {
    const text = normalize(target.innerText || target.textContent || target.getAttribute("aria-label") || "");

    if (text.includes("gui de xet duyet") || text.includes("gui xet duyet") || text.includes("gui phe duyet") || text.includes("send")) {
      showToast("Đã mô phỏng gửi form vào hàng đợi xét duyệt.", "success");
      setTimeout(() => post({ type: "navigate", screen: "review" }), 650);
      return true;
    }
    if (text.includes("phe duyet") || text.includes("approve")) {
      showToast("Đã mô phỏng phê duyệt tri thức. Mục này sẽ chuyển vào Cơ sở tri thức.", "success");
      setTimeout(() => post({ type: "navigate", screen: "knowledge" }), 650);
      return true;
    }
    if (text.includes("tu choi") || text.includes("reject")) {
      showToast("Đã mô phỏng từ chối submission và ghi nhận phản hồi.", "danger");
      return true;
    }
    if (text.includes("yeu cau sua") || text.includes("revision") || text.includes("request")) {
      showToast("Đã mô phỏng yêu cầu chỉnh sửa submission.", "warning");
      return true;
    }
    if (text.includes("luu nhap")) {
      showToast("Đã mô phỏng lưu bản nháp SOP.", "primary");
      return true;
    }
    if (text.includes("tai xuong") || text.includes("download") || text.includes("in") || text.includes("print") || text.includes("share") || text.includes("chia se")) {
      showToast("Prototype mock: thao tác này chỉ hiển thị phản hồi, chưa xuất file thật.", "primary");
      return true;
    }
    return false;
  };

  document.documentElement.dataset.prototypeScreen = ACTIVE_SCREEN;

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button, [role='button']");
    if (!target) return;

    const route = routeFromTarget(target);
    const handledAction = handlePrototypeAction(target);

    if (route && route !== ACTIVE_SCREEN) {
      event.preventDefault();
      post({ type: "navigate", screen: route });
      return;
    }

    if (route || handledAction || target.getAttribute("href") === "#") {
      event.preventDefault();
    }
  }, true);

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Đã mô phỏng gửi biểu mẫu vào hàng đợi xét duyệt.", "success");
    setTimeout(() => post({ type: "navigate", screen: "review" }), 650);
  }, true);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") post({ type: "navigate", screen: "dashboard" });
  });
})();
</script>`;

  const bridgeStyles = `
<style>
  a, button, [role="button"], select, input, textarea { pointer-events: auto; }
  a, button, [role="button"] { cursor: pointer; }
  html { scroll-behavior: smooth; }
</style>`;

  if (htmlWithCanonicalSidebar.includes("</body>")) {
    return htmlWithCanonicalSidebar.replace("</body>", `${bridgeStyles}${bridgeScript}</body>`);
  }
  return `${htmlWithCanonicalSidebar}${bridgeStyles}${bridgeScript}`;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedScreen = params.get("screen");
    return requestedScreen && screens[requestedScreen] ? requestedScreen : "dashboard";
  });
  const [html, setHtml] = useState("");
  const [isSwitching, setIsSwitching] = useState(true);
  const [loadError, setLoadError] = useState("");
  const htmlCacheRef = useRef({});

  const screen = useMemo(() => screens[activeScreen] || screens.dashboard, [activeScreen]);

  useEffect(() => {
    let cancelled = false;
    let settleTimer = 0;
    setLoadError("");

    const cachedHtml = htmlCacheRef.current[activeScreen];
    if (cachedHtml) {
      setIsSwitching(true);
      settleTimer = window.setTimeout(() => {
        if (!cancelled) {
          setHtml(cachedHtml);
          window.requestAnimationFrame(() => setIsSwitching(false));
        }
      }, 120);

      return () => {
        cancelled = true;
        window.clearTimeout(settleTimer);
      };
    }

    setIsSwitching(true);

    fetch(screen.src)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${screen.src}`);
        return response.text();
      })
      .then((payload) => {
        const nextHtml = buildInjectedHtml(payload, activeScreen);
        if (!cancelled) {
          htmlCacheRef.current[activeScreen] = nextHtml;
          setHtml(nextHtml);
          window.requestAnimationFrame(() => setIsSwitching(false));
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(settleTimer);
    };
  }, [activeScreen, screen.src]);

  useEffect(() => {
    let cancelled = false;

    Object.entries(screens).forEach(([screenId, targetScreen]) => {
      if (screenId === activeScreen || htmlCacheRef.current[screenId]) return;

      fetch(targetScreen.src)
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to preload ${targetScreen.src}`);
          return response.text();
        })
        .then((payload) => {
          if (cancelled) return;
          const injected = buildInjectedHtml(payload, screenId);
          htmlCacheRef.current[screenId] = injected;
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [activeScreen]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.source !== "labs-kms-prototype") return;
      if (event.data.type === "navigate" && screens[event.data.screen]) {
        setActiveScreen((currentScreen) => (currentScreen === event.data.screen ? currentScreen : event.data.screen));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", activeScreen);
    window.history.replaceState(null, "", url);
  }, [activeScreen]);

  return (
    <main className={isSwitching ? "prototype-host is-switching" : "prototype-host"}>
      {loadError ? (
        <section className="prototype-error">
          <h1>Không tải được màn hình prototype</h1>
          <p>{loadError}</p>
        </section>
      ) : (
        <>
          <iframe
            className="prototype-frame"
            srcDoc={html}
            title={`LABSL KMS Prototype - ${screen.label}`}
            onLoad={() => window.requestAnimationFrame(() => setIsSwitching(false))}
          />
          <div className="screen-transition" aria-hidden="true">
            <span>{screen.label}</span>
          </div>
        </>
      )}
    </main>
  );
}
