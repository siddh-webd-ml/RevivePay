import { Activity } from "lucide-react";

function Topbar() {
  return (
    <header className="topbar">

      <div>
        <p className="eyebrow">
          PAYMENT RECOVERY PLATFORM
        </p>

        <h2>
          RevivePay
        </h2>
      </div>

      <div className="system-badge">

        <span className="live-dot" />

        <Activity size={13} />

        SYSTEM LIVE

      </div>

    </header>
  );
}

export default Topbar;