import { useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { auth, storage, firestore } from "../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

    setShowSignUp(true); // Trigger the entrance animation when the component loads

    return () => unsubscribe();
  }, [navigate]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if the username contains only one word (no spaces)
    const usernameRegex = /^[a-zA-Z0-9]+$/; // Allows only alphanumeric characters without spaces
    if (!usernameRegex.test(username)) {
      setError("Username must be a single word with no spaces.");
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(firestore, "users");
      const usernameQuery = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        setError("Username already exists. Please choose another one.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(firestore, "users", user.uid);

      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `profilePictures/${user.email}/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } else {
        imageUrl = "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg";
      }

      await updateProfile(user, {
        displayName: username,
        photoURL: imageUrl,
      });

      await setDoc(userRef, {
        about: "",
        username: username,
        email: email,
        photoURL: imageUrl,
        following: [],
        followedBy: [],
      }, { merge: true });

      await sendEmailVerification(user);
      console.log("User signed up successfully");

      navigate("/login");

    } catch (error) {
      setError(error.message);
      console.error("Error signing up: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CSSTransition
      in={showSignUp}
      timeout={500}
      classNames="signup-transition"
      unmountOnExit
    >
      <div className="outerForm">
        <form onSubmit={handleSignUp}>
          <div className="formIn">
            <h1>SignUp</h1>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="username"
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="email"
            />

            <p style={{ color: "blue", display: "flex", margin: "-6px 0 -8px 5px", textAlign: "left", width: "100%" }}>
              *Image not required
            </p>
            <input
              type="file"
              placeholder="Profile Picture"
              onChange={handleImageChange}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="password"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>

            <Link to="/login">Already have an account? Log in</Link>
          </div>
        </form>
      </div>
    </CSSTransition>
  );
};

export default SignUp;
