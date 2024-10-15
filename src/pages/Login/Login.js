import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { CSSTransition } from "react-transition-group";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

    setShowLogin(true); // Trigger the entrance animation when the component loads

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setErrorMsg(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CSSTransition
      in={showLogin}
      timeout={500}
      classNames="login-transition"
      unmountOnExit
    >
      <div className="outerForm">
        <form onSubmit={handleLogin}>
          <div className="formIn">
            <h1>Login</h1>
            {errorMsg && (
              <p style={{ color: "red", display: "flex", margin: "-10px 0 -5px 0" }}>
                *Invalid Email or Password
              </p>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="password"
            />
            <button type="submit">{loading ? "Logging in..." : "Login"}</button>
            <Link to={"/sign-up"}>Don't have an account? Sign Up</Link>
          </div>
        </form>

        <div className="img"></div>
      </div>
    </CSSTransition>
  );
};

export default Login;
