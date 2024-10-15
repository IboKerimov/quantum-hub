import React, { useEffect, useState } from "react";
import "./Account.css";
import { useNavigate, Link } from "react-router-dom";
import { auth, storage, firestore } from "../../firebase";
import { getDoc, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { onAuthStateChanged, updateProfile, deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onSnapshot } from "firebase/firestore";

const Account = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [newImg, setNewImg] = useState("");
    const [imgChangeOpen, setImgChangeOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState(false);
    const [addBioOpen, setAddBioOpen] = useState(false);
    const [aboutUser, setAboutUser] = useState("");

    const [uDoc, setUDoc] = useState(null);
    
    const [resetLoad, setResetLoad] = useState(false);

    const handleBioOpen = () => {
        setAddBioOpen(!addBioOpen);
    };

    const handleBioClose = async () => {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.data().about === aboutUser){
            setAddBioOpen(!addBioOpen)
        } else{
            let decision = window.confirm("Changes won't be saved")
            if(decision){
                setAboutUser(userSnap.data().about);
                setAddBioOpen(!addBioOpen)
            }
        }
    }

    const handleImgChangeOpen = (e) => {
        e.stopPropagation();
        setImgChangeOpen(!imgChangeOpen);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
    
            if (!currentUser) {
                navigate("/");
            } else {
                const userRef = doc(firestore, "users", currentUser.uid);
                const unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        setAboutUser(docSnapshot.data().about || "");
                        setUDoc(docSnapshot.data());
                    }
                });
                return () => unsubscribeSnapshot();
            }
        });
        return () => unsubscribe();
    }, [navigate]);
    

    const handleNewDisplayName = async () => {
        const newName = window.prompt("Enter new username: ");
        const user = auth.currentUser;
    
        if (newName && user) {
            try {
                await updateProfile(user, {
                    displayName: newName,
                });
    
                await updateDoc(doc(firestore, "users", user.uid), {
                    displayName: newName,
                });
    
                navigate("/account");
            } catch (error) {
                alert("Error Occurred: " + error.message);
            }
        } else {
            alert("Username cannot be empty");
        }
    };

    const handleImageUpdate = async () => {
        if (!newImg) {
            alert("You have to add an image file to update avatar.");
            setImgChangeOpen(false);
            return;
        }
        setLoading(true);

        try {
            const storageRef = ref(storage, `profilePictures/${user.email}/${user.uid}`);
            const snapshot = await uploadBytes(storageRef, newImg);
            const avatarUrl = await getDownloadURL(snapshot.ref);

            await updateProfile(user, {
                photoURL: avatarUrl,
            });

            setImgChangeOpen(false);
            navigate("/account");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImg = async () => {
        setLoadingRemove(true);
        const defaultAvatarUrl = "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg";
        try {
            await updateProfile(user, {
                photoURL: defaultAvatarUrl,
            });
            setImgChangeOpen(false);
            navigate("/account");
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingRemove(false);
        }
    };

    const handleBioSubmit = async () => {
        if (user) {
            // Strip HTML tags and check if content is only whitespace or empty
            const strippedContent = aboutUser.replace(/(<([^>]+)>)/gi, "").trim();
            
            // Check if the user left it empty
            if (strippedContent === "") {
                alert("Please add something or click Remove Bio to clear your bio.");
            } else {
                try {
                    await setDoc(doc(firestore, "users", user.uid), { about: aboutUser }, { merge: true });
                    setAddBioOpen(false);
                } catch (error) {
                    console.log("Error updating bio:", error);
                }
            }
        }
    };
    

    const clearBio =  () => {
        if(user){
            try{
                setAboutUser("")
            } catch(error){
                console.log(error);
            }
        }
    }

    const handleResetPassword = async () => {
        const email = user.email;
        setResetLoad(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Check your email inbox or spam/junk folder please.");
        } catch (error) {
            alert(error);
        } finally{
            setResetLoad(false);
        }
    }

    const handleDeleteUser = async () => {
        try {
          const user = auth.currentUser;
          const decision = window.confirm("Delete Account?");
          
          if (decision) {
            if (user) {
              await deleteDoc(doc(firestore, "users", user.uid)); // Correct usage of deleteDoc
              
              await user.delete();
              
              console.log("User deleted successfully");
              alert("Your account has been deleted successfully. This action cannot be undone.");
            } else {
              console.log("No user is currently logged in.");
            }
          }
        } catch (error) {
          console.error("Error deleting user:", error.message);
          if (error.code === 'auth/requires-recent-login') {
            alert("Please log out and log in again to delete account.");
          }
        }
      };
    

    if (!user) {
        return null;
    }

    return (
        <>
            {user ? (
                <div className="userProfile">
                    <div className="accIn">
                        <div className="top">
                            <Link onClick={handleImgChangeOpen} className="top-left">
                                <img src={user.photoURL || "default-avatar.png"} alt="Profile" />
                                <span style={{ color: "blue" }}><FontAwesomeIcon icon={faPenToSquare} /></span>
                            </Link>
                            <div className="top-right">
                                <h1>
                                    {user.displayName}
                                    <button onClick={handleNewDisplayName} className="pentosqricon">
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                </h1>
                                <p>{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`imgChange ${imgChangeOpen ? "imgChangeOpen" : ""}`} onClick={handleImgChangeOpen}>
                        <div className="imgIn" onClick={(e) => e.stopPropagation()}>
                            <h1>Change Image</h1>
                            <input type="file" onChange={(e) => setNewImg(e.target.files[0])} />
                            <div style={{ display: "flex", gap: "5px" }}>
                                <button onClick={handleImageUpdate}>
                                    {loading ? "Updating..." : "Update Avatar"}
                                </button>
                                <button style={{ background: "red" }} onClick={handleRemoveImg}>
                                    {loadingRemove ? "Removing..." : "Remove Avatar"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div className="bio section">
                        <div className="user-details">

                            <div className="detail">
                                <span>{uDoc?.followedBy.length}</span>
                                <span>Followers</span>
                            </div>

                            <div className="detail">
                                <span>{uDoc?.following.length}</span>
                                <span>Following</span>
                            </div>

                        </div>
                        <hr />
                        <h1 style={{ display: "flex", alignItems: "center" }}>
                            About You <span onClick={handleBioOpen} className="pentosqricon"><FontAwesomeIcon icon={faPenToSquare} /></span>
                        </h1>

                        <p className="bio-content">
                            {aboutUser ? (
                                <div dangerouslySetInnerHTML={{ __html: aboutUser }}  className="bio"/>
                            ) : (
                                <i>No bio. <Link onClick={handleBioOpen}>Click to add</Link></i>
                            )}
                        </p>
                    </div>
                    <hr/>
                    <div className="actions">
                        <Link onClick={handleResetPassword} className="reset btn">{resetLoad ? "Resetting Password..." : "Reset Password"}</Link>
                        <Link onClick={handleDeleteUser} className="delete btn">Delete Account</Link>
                    </div>

                    <div className={`addBio ${addBioOpen ? "addBioOpen" : ""}`}>
                        <div className="AddBio">
                            <div className="closeBtn btnbio">
                                <button onClick={handleBioSubmit}>Submit</button>
                                <div style={{display: "flex", gap: "5px"}}>
                                    <button style={{backgroundColor: "red"}} onClick={clearBio}>Clear Bio</button>
                                    <button onClick={handleBioClose}>Close</button>
                                </div>
                            </div>
                            <ReactQuill
                                theme="snow"
                                value={aboutUser}
                                onChange={(value) => setAboutUser(value)}  // Fix to update the bio as user types
                                placeholder="Write about yourself"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default Account;
