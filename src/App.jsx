


















import { useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./App.css";

function App() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const snap = await getDoc(
            doc(db, "users", currentUser.uid)
          );

          setRole(
            snap.exists() && snap.data().role === "admin"
              ? "admin"
              : "member"
          );
        } catch (error) {
          console.error(error);
          setMessage("प्रोफाइल लोड नहीं हो सकी।");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  async function sendOTP() {
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage("10 अंकों का मोबाइल नंबर डालें।");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "normal" }
      );

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + mobile,
        window.recaptchaVerifier
      );

      setConfirmation(result);
      setMessage("OTP भेज दिया गया है।");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
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
      setMessage("6 अंकों का OTP डालें।");
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
    setMessage("आप लॉगआउट हो गए हैं।");
  }

  if (user) {
    return (
      <main className="app">
        <header className="header">
          <h1>UJJVAL SAMITI</h1>
          <p>बचत एवं लोन समिति</p>
        </header>

        <section className="dashboard">
          <h2>
            {role === "admin"
              ? "ADMIN DASHBOARD"
              : "MEMBER DASHBOARD"}
          </h2>

          <p>मोबाइल: {user.phoneNumber}</p>
          <p>खाता: {role === "admin" ? "Admin" : "Member"}</p>

          {role === "admin" ? (
            <div className="features">
              <h3>Admin सुविधाएँ</h3>
              <p>👥 सदस्य प्रबंधन</p>
              <p>💰 जमा एवं निकासी</p>
              <p>🏦 लोन प्रबंधन</p>
              <p>📅 किस्त प्रबंधन</p>
              <p>📊 समिति रिपोर्ट</p>
            </div>
          ) : (
            <div className="features">
              <h3>Member सुविधाएँ</h3>
              <p>👤 मेरी प्रोफाइल</p>
              <p>💰 मेरी जमा राशि</p>
              <p>🏦 मेरा लोन</p>
              <p>📅 मेरी किस्त</p>
              <p>📋 भुगतान इतिहास</p>
            </div>
          )}

          <p className="notice">
            सुविधाओं का डेटा और लेन-देन सिस्टम अगले चरण में जोड़ा जाएगा।
          </p>

          <button onClick={logout}>लॉगआउट</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <h1>UJJVAL SAMITI</h1>
        <p>बचत एवं लोन समिति प्रबंधन</p>
      </header>

      <section className="login-card">
        <h2>मोबाइल लॉगिन</h2>
        <p>अपने मोबाइल नंबर से लॉगिन करें</p>

        <input
          type="tel"
          placeholder="10 अंकों का मोबाइल नंबर"
          maxLength="10"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <div id="recaptcha-container"></div>

        {!confirmation ? (
          <button onClick={sendOTP} disabled={loading}>
            {loading ? "OTP भेज रहे हैं..." : "OTP प्राप्त करें"}
          </button>
        ) : (
          <>
            <input
              type="number"
              placeholder="6 अंकों का OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={verifyOTP} disabled={loading}>
              {loading ? "जाँच हो रही है..." : "लॉगिन करें"}
            </button>
          </>
        )}

        {message && <p className="message">{message}</p>}
      </section>

      <footer>© UJJVAL SAMITI</footer>
    </main>
  );
}

export default App;


