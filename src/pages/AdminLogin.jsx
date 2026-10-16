import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("الإيميل أو كلمة المرور غير صحيحة");
      return;
    }

    navigate("/admin");
  }

  return (
    <div className="adminLoginPage" dir="rtl">
      <form className="adminLoginBox" onSubmit={handleLogin}>
        <div className="adminLogo">
          Mini<span>Market</span>
        </div>

        <h1>تسجيل دخول الإدارة</h1>
        <p>أدخل بيانات حساب الإدارة</p>

        <label>البريد الإلكتروني</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>كلمة المرور</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="adminLoginError">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;