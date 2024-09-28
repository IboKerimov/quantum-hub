import { useEffect, useState } from "react";
import { auth, storage } from "../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `profilePictures/${user.email}/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } else {
        imageUrl = "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
      }

      await updateProfile(user, {
        displayName: name,
        photoURL: imageUrl,
      });

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
    <div className="outerForm">
        <form onSubmit={handleSignUp}>
            <div className="formIn">
                <h1>SignUp</h1>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    className="name"
                />

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="email"
                />
                <p style={{color: "blue", display: "flex", margin: "-6px 0 -8px 0"}}>*Image not required</p>
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

                {error && <p style={{ color: "red" }}>{error}</p>}
                <Link to="/login">Already have an account? Log in</Link>
            </div>
        </form>
    </div>
  );
};

export default SignUp;
