import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Images
import logo from "../../images/logo.png";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

// Css
import "./Navbar.css";


const Navbar = () => {
    const [user, setUser] = useState(null);
    const [toggleClicked, setToggleClicked] = useState(false);
    const [accMenuClicked, setAccMenuClicked] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogOut = async () => {
        try {
            await signOut(auth);
            console.log("Signed out");
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    const toggleAccMenu = (e) => {
        e.stopPropagation(); // Prevent the click event from closing the menu
        setAccMenuClicked(!accMenuClicked);
    };

    // Close account menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (!accMenuClicked) {
                setAccMenuClicked(true);
            }
        };

        document.body.addEventListener("click", handleClickOutside);

        return () => {
            document.body.removeEventListener("click", handleClickOutside);
        };
    }, [accMenuClicked]);

    return (
        <>
        <nav>
            <Link to="/" className="logo">
                <img src={logo} alt="Quantum-Hub" />
            </Link>

            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>

                <li>
                    <Link to="/all-posts">All Posts</Link>
                </li>

                {user ? 
                <>
                    <li>
                        <Link className="account" onClick={toggleAccMenu}>
                            <img src={user.photoURL} alt="User" />
                        </Link>
                    </li>

                    <div className={`accMenu ${!accMenuClicked ? "accMenuOpen" : ""}`}>
                        <Link to={"/account"}>Account</Link>
                        <Link onClick={handleLogOut}>Log out</Link>
                    </div>
                </>
                :
                <li>
                    <Link to="/login">Log in</Link>
                </li>
                }
            </ul>

            <button className="toggle" onClick={() => setToggleClicked(!toggleClicked)}>
                {toggleClicked ?
                    <FontAwesomeIcon icon={faXmark} style={{ color: "#418fde" }} />
                    :
                    <FontAwesomeIcon icon={faBars} style={{ color: "#418fde" }} />
                }
            </button>
        </nav>

        <div className={toggleClicked ? "overlay-active overlay" : "overlay"} onClick={() => setToggleClicked(!toggleClicked)}></div>

        <div className={toggleClicked ? "responsive-nav resp-nav-active" : "responsive-nav"}>
            <ul>
                <li>
                    <Link to="/" onClick={() => setToggleClicked(!toggleClicked)}>Home</Link>
                </li>

                <li>
                    <Link to="/all-posts" onClick={() => setToggleClicked(!toggleClicked)}>All Posts</Link>
                </li>

                {user ? 
                <>
                    <li>
                        <Link to="/account" onClick={() => setToggleClicked(!toggleClicked)}>Account</Link>
                    </li>
                    <li>
                        <button onClick={() => { setToggleClicked(!toggleClicked); handleLogOut(); }} className="logoutBtn">Log out</button>
                    </li>
                </>
                :
                <li>
                    <Link to="/login" onClick={() => setToggleClicked(!toggleClicked)}>Log in</Link>
                </li>
                }
            </ul>
        </div>
        </>
    );
};

export default Navbar;
