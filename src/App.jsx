import { useState } from "react";
import "./App.css";

const TEST_OTP = "123456";

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);

function App() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("member");
  const [selectedRole, setSelectedRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("home");

  function sendOTP() {
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage("कृपया 10 अंकों का मोबाइल नंबर डालें।");
      return;
    }

    if (mobile !== "9340558265") {
      setMessage("यह टेस्ट लॉगिन केवल अधिकृत मोबाइल नंबर के लिए है।");
      return;
    }

    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setConfirmation(true);
      setMessage("आपका टेस्ट OTP है: 123456");
      setLoading(false);
    }, 400);
  }

  function verifyOTP() {
    if (!/^[0-9]{6}$/.test(otp)) {
      setMessage("कृपया 6 अंकों का OTP डालें।");
      return;
    }

    if (otp !== TEST_OTP) {
      setMessage("गलत OTP! कृपया 123456 डालें।");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setRole(selectedRole);
      setUser({
        phoneNumber: "+91 " + mobile
      });
      setTab("home");
      setMessage("");
      setLoading(false);
    }, 400);
  }

  function logout() {
    setUser(null);
    setMobile("");
    setOtp("");
    setConfirmation(false);
    setRole("member");
    setSelectedRole("member");
    setTab("home");
    setMessage("आप लॉगआउट हो गए हैं।");
  }

  const admin = role === "admin";

  const menu = admin
    ? [
        ["home", "⌂", "डैशबोर्ड"],
        ["members", "♙", "सदस्य"],
        ["savings", "₹", "बचत"],
        ["loans", "▣", "लोन"],
        ["installments", "◷", "किस्त"],
        ["reports", "▤", "रिपोर्ट"]
      ]
    : [
        ["home", "⌂", "होम"],
        ["savings", "₹", "मेरी बचत"],
        ["loans", "▣", "मेरा लोन"],
        ["installments", "◷", "मेरी किस्त"],
        ["profile", "♙", "प्रोफाइल"]
      ];

  const title =
    menu.find((item) => item[0] === tab)?.[2] || "डैशबोर्ड";

  if (!user) {
    return (
      <main className="auth-screen">
        <div className="auth-glow glow-one" />
        <div className="auth-glow glow-two" />

        <section className="auth-wrap">
          <div className="brand-mark">US</div>
          <p className="eyebrow">संगठन • एकता • विकास</p>
          <h1>UJJVAL <span>SAMITI</span></h1>
          <p className="auth-subtitle">
            उज्जवल दुर्गोत्सव समिति
          </p>

          <div className="auth-card">
            <div className="card-icon">✦</div>
            <h2>आपका स्वागत है</h2>
            <p className="muted">
              मोबाइल नंबर से टेस्ट लॉगिन करें
            </p>

            <label>लॉगिन का प्रकार</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="member">Member - सदस्य</option>
              <option value="admin">Admin - व्यवस्थापक</option>
            </select>

            <label>मोबाइल नंबर</label>
            <div className="phone-field">
              <span>🇮🇳 +91</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10 अंकों का नंबर"
                maxLength="10"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            {!confirmation ? (
              <button
                className="primary-btn"
                onClick={sendOTP}
                disabled={loading}
              >
                {loading ? "कृपया प्रतीक्षा करें..." : "OTP प्राप्त करें"}
                <span>→</span>
              </button>
            ) : (
              <>
                <label className="otp-label">
                  6 अंकों का टेस्ट OTP
                </label>

                <div className="notice-card">
                  <span>🔐</span>
                  <div>
                    <strong>आपका टेस्ट OTP</strong>
                    <p>123456</p>
                  </div>
                </div>

                <input
                  className="otp-input"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />

                <button
                  className="primary-btn"
                  onClick={verifyOTP}
                  disabled={loading}
                >
                  {loading ? "जाँच हो रही है..." : "लॉगिन करें"}
                  <span>→</span>
                </button>

                <button
                  className="text-btn"
                  onClick={() => {
                    setConfirmation(false);
                    setOtp("");
                    setMessage("");
                  }}
                >
                  नंबर बदलें
                </button>
              </>
            )}

            {message && (
              <p className="status-message">{message}</p>
            )}

            <p className="muted">
              यह केवल टेस्ट लॉगिन है। असली SMS नहीं भेजा जाता।
            </p>
          </div>

          <p className="secure-note">
            ♧ उज्जवल दुर्गोत्सव समिति
          </p>
        </section>

        <footer className="auth-footer">
          © {new Date().getFullYear()} उज्जवल दुर्गोत्सव समिति
        </footer>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-small">
          <div className="mini-mark">US</div>
          <div>
            <strong>उज्जवल दुर्गोत्सव समिति</strong>
            <small>बचत एवं लोन समिति</small>
          </div>
        </div>

        <button
          className="avatar"
          onClick={() => setTab("profile")}
        >
          {admin ? "A" : "M"}
        </button>
      </header>

      {tab === "home" ? (
        <>
          <section className="welcome-row">
            <div>
              <p className="muted">नमस्कार, स्वागत है 👋</p>
              <h2>
                {admin ? "Admin Dashboard" : "Member Dashboard"}
              </h2>
              <span className="role-pill">
                {admin ? "ADMIN ACCOUNT" : "MEMBER ACCOUNT"}
              </span>
            </div>
            <div className="welcome-star">✦</div>
          </section>

          <section className="hero-card">
            <div className="hero-top">
              <span>✦ समिति का अवलोकन</span>
              <span className="live-dot">● सक्रिय</span>
            </div>

            <p>कुल बचत राशि</p>
            <h1>₹ 0</h1>

            <div className="hero-divider" />

            <div className="hero-bottom">
              <span>उज्जवल दुर्गोत्सव समिति</span>
              <span>वित्तीय सारांश</span>
            </div>
            <div className="hero-watermark">US</div>
          </section>

          <div className="section-heading">
            <h3>मुख्य जानकारी</h3>
            <span>आज का सारांश</span>
          </div>

          <section className="stats-grid">
            <Stat icon="♙" label={admin ? "कुल सदस्य" : "मेरी समिति"} value="0" />
            <Stat icon="₹" label="कुल जमा" value={money(0)} />
            <Stat icon="▣" label="कुल लोन" value={money(0)} />
            <Stat icon="◷" label="बकाया किस्त" value={money(0)} />
          </section>

          <div className="section-heading">
            <h3>त्वरित सेवाएँ</h3>
            <span>Quick Services</span>
          </div>

          <section className="quick-grid">
            {menu
              .filter((m) => m[0] !== "home" && m[0] !== "profile")
              .slice(0, 4)
              .map((m) => (
                <button
                  className="quick-action"
                  key={m[0]}
                  onClick={() => setTab(m[0])}
                >
                  <span>{m[1]}</span>
                  <strong>{m[2]}</strong>
                  <i>→</i>
                </button>
              ))}
          </section>

          <section className="notice-card">
            <span>ⓘ</span>
            <div>
              <strong>महत्वपूर्ण सूचना</strong>
              <p>यहाँ समिति की नई सूचनाएँ दिखाई देंगी।</p>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="welcome-row">
            <div>
              <p className="muted">उज्जवल दुर्गोत्सव समिति</p>
              <h2>{title}</h2>
              <span className="role-pill">
                {admin ? "ADMIN ACCOUNT" : "MEMBER ACCOUNT"}
              </span>
            </div>
          </section>

          <section className="content-card">
            <div className="content-symbol">
              {menu.find((m) => m[0] === tab)?.[1] || "♙"}
            </div>

            <h2>{title}</h2>

            <p className="muted">
              {tab === "profile"
                ? `मोबाइल नंबर: ${user.phoneNumber}`
                : "इस सुविधा का लेन-देन और डेटा प्रबंधन अगले विकास चरण में जोड़ा जाएगा।"}
            </p>

            {tab === "profile" && (
              <p className="role-pill">
                {admin ? "ADMIN" : "MEMBER"}
              </p>
            )}

            <div className="empty-state">
              <span>✧</span>
              <strong>अभी कोई रिकॉर्ड नहीं है</strong>
              <small>रिकॉर्ड जुड़ने पर यहाँ दिखाई देंगे।</small>
            </div>
          </section>
        </>
      )}

      <nav className="bottom-nav">
        {menu.slice(0, 5).map((m) => (
          <button
            key={m[0]}
            className={tab === m[0] ? "nav-item active" : "nav-item"}
            onClick={() => setTab(m[0])}
          >
            <span>{m[1]}</span>
            <small>{m[2]}</small>
          </button>
        ))}
      </nav>

      <button className="logout-btn" onClick={logout}>
        लॉगआउट
      </button>
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <article className="stat-card">
      <span className="stat-icon">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
