import { useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(n);

function App() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("home");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) return;
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setRole(snap.exists() && snap.data().role === "admin" ? "admin" : "member");
      } catch (error) {
        console.error(error);
        setMessage("प्रोफाइल लोड नहीं हो सकी।");
      }
    });
    return () => unsubscribe();
  }, []);

  async function sendOTP() {
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage("कृपया 10 अंकों का मोबाइल नंबर डालें।");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal"
      });
      const result = await signInWithPhoneNumber(
        auth, "+91" + mobile, window.recaptchaVerifier
      );
      setConfirmation(result);
      setMessage("OTP भेज दिया गया है।");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "OTP भेजने में समस्या आई।");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (!confirmation || !/^[0-9]{6}$/.test(otp)) {
      setMessage("कृपया 6 अंकों का OTP डालें।");
      return;
    }
    setLoading(true);
    try {
      await confirmation.confirm(otp);
      setMessage("लॉगिन सफल!");
    } catch (error) {
      console.error(error);
      setMessage("OTP गलत या समाप्त हो गया है।");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setConfirmation(null);
    setOtp("");
    setMobile("");
    setRole("member");
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

  if (!user) {
    return (
      <main className="auth-screen">
        <div className="auth-glow glow-one" />
        <div className="auth-glow glow-two" />
        <section className="auth-wrap">
          <div className="brand-mark">US</div>
          <p className="eyebrow">संगठन • एकता • विकास</p>
          <h1>UJJVAL <span>SAMITI</span></h1>
          <p className="auth-subtitle">बचत एवं लोन समिति प्रबंधन</p>
          <div className="auth-card">
            <div className="card-icon">✦</div>
            <h2>आपका स्वागत है</h2>
            <p className="muted">अपने मोबाइल नंबर से सुरक्षित लॉगिन करें</p>
            <label>मोबाइल नंबर</label>
            <div className="phone-field">
              <span>🇮🇳 +91</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10 अंकों का नंबर"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div id="recaptcha-container" />
            {!confirmation ? (
              <button className="primary-btn" onClick={sendOTP} disabled={loading}>
                {loading ? "OTP भेज रहे हैं..." : "OTP प्राप्त करें"} <span>→</span>
              </button>
            ) : (
              <>
                <label className="otp-label">6 अंकों का OTP</label>
                <input
                  className="otp-input"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="● ● ● ● ● ●"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button className="primary-btn" onClick={verifyOTP} disabled={loading}>
                  {loading ? "जाँच हो रही है..." : "लॉगिन करें"} <span>→</span>
                </button>
                <button className="text-btn" onClick={() => {
                  setConfirmation(null); setOtp(""); setMessage("");
                }}>नंबर बदलें</button>
              </>
            )}
            {message && <p className="status-message">{message}</p>}
          </div>
          <p className="secure-note">♧ आपका डेटा सुरक्षित रखा जाता है</p>
        </section>
        <footer className="auth-footer">© {new Date().getFullYear()} UJJVAL SAMITI</footer>
      </main>
    );
  }

  const title = menu.find((item) => item[0] === tab)?.[2] || "डैशबोर्ड";

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-small">
          <div className="mini-mark">US</div>
          <div><strong>UJJVAL SAMITI</strong><small>बचत एवं लोन समिति</small></div>
        </div>
        <button className="avatar" onClick={() => setTab("profile")} aria-label="प्रोफाइल">
          {admin ? "A" : "M"}
        </button>
      </header>

      <section className="welcome-row">
        <div>
          <p className="muted">नमस्कार, स्वागत है 👋</p>
          <h2>{admin ? "Admin Dashboard" : "Member Dashboard"}</h2>
          <span className="role-pill">{admin ? "ADMIN ACCOUNT" : "MEMBER ACCOUNT"}</span>
        </div>
      </section>

      {tab === "home" && (
        <>
          <section className="hero-card">
            <div className="hero-top"><span>समिति का अवलोकन</span><span className="live-dot">● सक्रिय</span></div>
            <p>कुल बचत राशि</p>
            <h1>{admin ? "₹ 0" : "₹ 0"}</h1>
            <div className="hero-bottom"><span>UJJVAL SAMITI</span><span>वित्तीय सारांश</span></div>
          </section>

          <div className="section-heading"><h3>मुख्य जानकारी</h3><span>आज का सारांश</span></div>
          <section className="stats-grid">
            <Stat icon="♙" label={admin ? "कुल सदस्य" : "मेरी समिति"} value="0" tone="blue" />
            <Stat icon="₹" label="कुल जमा" value={money(0)} tone="green" />
            <Stat icon="▣" label="कुल लोन" value={money(0)} tone="orange" />
            <Stat icon="◷" label="बकाया किस्त" value={money(0)} tone="purple" />
          </section>

          <div className="section-heading"><h3>त्वरित सेवाएँ</h3></div>
          <section className="quick-grid">
            {menu.filter((m) => m[0] !== "home" && m[0] !== "profile").slice(0, 4).map((m) => (
              <button className="quick-action" key={m[0]} onClick={() => setTab(m[0])}>
                <span>{m[1]}</span><strong>{m[2]}</strong><i>→</i>
              </button>
            ))}
          </section>
          <section className="notice-card">
            <span>ⓘ</span><div><strong>महत्वपूर्ण सूचना</strong><p>यहाँ समिति की नई सूचनाएँ दिखाई देंगी।</p></div>
          </section>
        </>
      )}

      {tab !== "home" && (
        <section className="content-card">
          <div className="content-symbol">{menu.find((m) => m[0] === tab)?.[1] || "♙"}</div>
          <h2>{title}</h2>
          <p className="muted">
            {tab === "profile" ? `मोबाइल नंबर: ${user.phoneNumber || "उपलब्ध नहीं"}` :
              "इस सुविधा का लेन-देन और डेटा प्रबंधन अगले विकास चरण में जोड़ा जाएगा।"}
          </p>
          {tab === "profile" && <p className="role-pill">{admin ? "ADMIN" : "MEMBER"}</p>}
          <div className="empty-state"><span>✧</span><strong>अभी कोई रिकॉर्ड नहीं है</strong><small>रिकॉर्ड जुड़ने पर यहाँ दिखाई देंगे।</small></div>
        </section>
      )}

      <div className="section-heading"><h3>{title}</h3></div>
      <nav className="bottom-nav">
        {menu.slice(0, 5).map((m) => (
          <button key={m[0]} className={tab === m[0] ? "nav-item active" : "nav-item"} onClick={() => setTab(m[0])}>
            <span>{m[1]}</span><small>{m[2]}</small>
          </button>
        ))}
      </nav>
      <button className="logout-btn" onClick={logout}>लॉगआउट</button>
    </main>
  );
}

function Stat({ icon, label, value, tone }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

export default App;
