import React from "react";
import "./Account.css";

import { useNavigate, Link } from "react-router-dom";
import { auth , storage} from "../../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Account = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [newImg, setNewImg] = useState("");
    const [imgChangeOpen, setImgChangeOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleImgChangeOpen = (e) => {
        e.stopPropagation();
        setImgChangeOpen(!imgChangeOpen);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleNewDisplayName = async () => {
        const newName = window.prompt("Enter new Full Name: ");
        if (newName) {
            try {
                await updateProfile(auth.currentUser, {
                    displayName: newName,
                });
                navigate("/account");
            } catch (error) {
                alert("Error Occurred: " + error.message);
            }
        }
    };

    const [imgUrl, setImgUrl] = useState("");



    const handleImageUptade = async () => {
        setLoading(true);
        try {
            if (newImg) {
                const storageRef = ref(storage, `profilePictures/${user.email}/${user.uid}`);
                const snapshot = await uploadBytes(storageRef, newImg);
                setImgUrl(await getDownloadURL(snapshot.ref));
            } else {
                setImgUrl("https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg");
            }

            await updateProfile(user, {
                photoURL: imgUrl,
            });

            setImgChangeOpen(!imgChangeOpen);
            navigate("/account");
        } catch (error) {
            console.log(error);   
        }
        setLoading(false);
    }



    return (
        <>
            {user ? (
                <div className="userProfile">
                    <div className="accIn">
                        <div className="top">
                            <Link onClick={handleImgChangeOpen} className="top-left">
                                <img src={user.photoURL || "default-avatar.png"} alt="Profile" />
                                <span><FontAwesomeIcon icon={faPenToSquare} /></span>
                            </Link>

                            <div className="top-right">
                                <h1>
                                    {user.displayName}{" "}
                                    <button onClick={handleNewDisplayName}>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                </h1>
                                <p>{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`imgChange ${imgChangeOpen ? "imgChangeOpen" : ""}`}
                        onClick={handleImgChangeOpen}
                    >
                        <div className="imgIn" onClick={(e) => e.stopPropagation()}>
                            <h1>Change Image</h1>
                            <input
                                type="file"
                                onChange={(e) => setNewImg(e.target.files[0])}
                            />
                            <button onClick={handleImageUptade}>
                                {loading ? "Updating..." : "Update Avatar"}
                            </button>
                        </div>
                    </div>

                    
                </div>
            ) : null}
        </>
    );
};

export default Account;
