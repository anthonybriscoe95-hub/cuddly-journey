import { useEffect, useState } from "react";
import Sidebar, { NAV } from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import SkillRunner from "./components/SkillRunner.jsx";
import { StoreProvider } from "./state/store.jsx";
import { skillById } from "./skills/registry.js";

import Dashboard from "./pages/Dashboard.jsx";
import Skills from "./pages/Skills.jsx";
import Leads from "./pages/Leads.jsx";
import Clients from "./pages/Clients.jsx";
import Vault from "./pages/Vault.jsx";
import Outreach from "./pages/Outreach.jsx";
import CommandCenter from "./pages/CommandCenter.jsx";
import Settings from "./pages/Settings.jsx";

const NAV_IDS = NAV.map((n) => n.id);

function Shell() {
  const [active, setActive] = useState(() => {
    const hash = (window.location.hash || "").replace("#", "");
    return NAV_IDS.includes(hash) ? hash : "dashboard";
  });
  const [mobileNav, setMobileNav] = useState(false);
  const [quickSkill, setQuickSkill] = useState(null);

  useEffect(() => {
    if (window.location.hash !== `#${active}`) {
      window.history.replaceState(null, "", `#${active}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || "").replace("#", "");
      if (NAV_IDS.includes(h) && h !== active) setActive(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [active]);

  const goto = (id) => {
    if (NAV_IDS.includes(id)) setActive(id);
  };

  const Page = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard goto={goto} />;
      case "skills":
        return <Skills />;
      case "leads":
        return <Leads />;
      case "clients":
        return <Clients />;
      case "vault":
        return <Vault />;
      case "outreach":
        return <Outreach />;
      case "command":
        return <CommandCenter goto={goto} />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard goto={goto} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        active={active}
        onChange={goto}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      />
      <main className="min-w-0 flex-1 lg:pl-0">
        <Topbar
          active={active}
          onMenu={() => setMobileNav(true)}
          onQuick={() => setQuickSkill(skillById("daily_business_plan"))}
        />
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Page />
        </div>
      </main>
      <SkillRunner
        skill={quickSkill}
        open={!!quickSkill}
        onClose={() => setQuickSkill(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
