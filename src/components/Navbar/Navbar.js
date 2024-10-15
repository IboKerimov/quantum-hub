import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Images
import logo from "../../images/logo.png";
import { faBars, faXmark, faHouse, faMagnifyingGlass, faRightToBracket, faUserGroup, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

// Css
import "./Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [toggleClicked, setToggleClicked] = useState(false);
    const [accMenuClicked, setAccMenuClicked] = useState(true);

    useEffect(() => {
        if(pathname === "/login" || pathname === "/sign-up"){
            document.body.style.overflow = "hidden";
            document.body.style.padding = "0px";
            return () => {
                document.body.style.overflow = "scroll"
            };
        }
    }, []);

    const [pathname, setPathName] = useState("");

    useEffect(() => {
        setPathName(window.location.pathname)
    }, [window.location.pathname])

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
            setTimeout(() => {
                navigate("/");
            }, 500); // Delay for 500ms to ensure log out completes
        } catch (error) {
            console.error(error);
        }
    };

    const toggleAccMenu = (e) => {
        e.stopPropagation();
        setAccMenuClicked(!accMenuClicked);
        
    };
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

                    

                    {user ? (
                        <>
                            <li>
                                <Link to={"/new-post"} style={{display: "flex", gap: "6px", alignItems: "center"}}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                    Post Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/followings">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                </Link>
                            </li>
                            <li>
                                <Link className="account" onClick={toggleAccMenu}>
                                    <img src={user?.photoURL || "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"} alt="User" />
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login">
                                <FontAwesomeIcon icon={faRightToBracket} />
                            </Link>
                        </li>
                    )}
                </ul>

                {user && (
                    <div className={`accMenu ${!accMenuClicked ? "accMenuOpen" : ""}`}>
                        <Link>Hey {user?.displayName?.split(" ")[0]}</Link>
                        <Link to={"/account"}>Account</Link>
                        <Link onClick={handleLogOut}>Log out</Link>
                    </div>
                )}

                <div className="btns">
                    <button className="toggle" onClick={() => setToggleClicked(!toggleClicked)}>
                        {toggleClicked ? (
                            <FontAwesomeIcon icon={faXmark} style={{ color: "#418fde" }} />
                        ) : (
                            <FontAwesomeIcon icon={faBars} style={{ color: "#418fde" }} />
                        )}
                    </button>
                    {user ? (
                        <button className="toggle" onClick={toggleAccMenu}>
                            <Link>
                                <img src={user?.photoURL || "default-avatar.png"} alt="User" />
                            </Link>
                        </button>
                    ) : (
                        ""
                    )}
                </div>
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

                    <li>
                        <Link to="/followings" onClick={() => setToggleClicked(!toggleClicked)}>Followings</Link>
                    </li>

                    {user ? (
                        <>
                            <li>
                                <Link to={"/new-post"} onClick={() => setToggleClicked(!toggleClicked)}>Post Blog</Link>
                            </li>
                            <li>
                                <Link to="/account" onClick={() => setToggleClicked(!toggleClicked)}>Account</Link>
                            </li>
                            <li>
                                <button onClick={() => { setToggleClicked(!toggleClicked); handleLogOut(); }} className="logoutBtn">Log out</button>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login" onClick={() => setToggleClicked(!toggleClicked)}>Log in</Link>
                        </li>
                    )}
                </ul>
            </div>

            <div className={`mobile-nav`}>
                <div className="inner">
                    <ul>
                        <Link to="/" className={pathname === "/" ? "clicked" : ""}>
                            <FontAwesomeIcon icon={faHouse} />
                        </Link>

                        <Link to="/followings" className={pathname === "/followings" ? "clicked" : ""}>
                            <FontAwesomeIcon icon={faUserGroup} />
                        </Link>
                        {user ? 
                        <>
                            <Link to={"/new-post"} style={{fontSize: "23px"}} className={pathname === "/new-post" ? "clicked" : ""}>
                                <FontAwesomeIcon icon={faPenToSquare} />
                            </Link>
                            <Link to={"/account"} className={pathname === "/account" ? "clicked" : ""}>
                                <img src={user ? user.photoURL : "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"} />
                            </Link>
                        </>
                        :
                        <Link to={"/login"} className={pathname === "/login" || pathname === "/sign-up" ? "clicked" : ""}>
                            <FontAwesomeIcon icon={faRightToBracket} />
                        </Link>
                        }
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Navbar;
