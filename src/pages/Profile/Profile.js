import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { firestore, auth } from '../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUserMinus, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setCurrentUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const ref = doc(firestore, 'users', id);
                const userSnapshot = await getDoc(ref);
                if (userSnapshot.exists()) {
                    setUser(userSnapshot.data());
                } else {
                    alert('No user found');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                alert('An error occurred while fetching the user data.');
                navigate('/');
            }
        };

        fetchUser();
    }, [id, navigate]);

    return (
        <>
            {user ? (
                <div className="userProfile">
                    <div className="accIn">
                        <div className="top">

                            <div className='left'>
                                <Link onClick={() => {navigate(-1)}} className='previous'>
                                    <img src='https://cdn0.iconfinder.com/data/icons/round-arrows-1/134/left_blue-512.png' />
                                </Link>
                                <div className="top-left">
                                    <a href={user?.photoURL}>
                                        <img src={user.photoURL || "default-avatar.png"} alt="Profile" />
                                    </a>
                                </div>
                                <div className="top-right">
                                    <h1>{user?.username || "Unknown User"}</h1>
                                    <p>{user?.email}</p>
                                </div>
                            </div>

                            <div className='right'>
                            {user?.followedBy && currentUser && user.followedBy.includes(currentUser.uid) ?  
                            <Link>
                                <FontAwesomeIcon icon={faUserMinus} />
                            </Link>
                            : 
                            <Link>
                                <FontAwesomeIcon icon={faUserPlus}/>
                            </Link>}

                            </div>

                        </div>
                    </div>

                    <hr />

                    <div className="bio section">
                    <div className="user-details">
                        <div className="detail">
                            <span>{user?.followedBy ? user.followedBy.length : 0}</span>
                            <span>Followers</span>
                        </div>

                        <div className="detail">
                            <span>{user?.following ? user.following.length : 0}</span>
                            <span>Following</span>
                        </div>
                    </div>

                    <hr />
                        <h1>About {user.displayName ? user.displayName.split(" ")[0] : "User"}</h1>
                        <p className="bio-content">
                            {user.about ? (
                                <div dangerouslySetInnerHTML={{ __html: user.about }} className="bio" />
                            ) : (
                                <i>No bio available.</i>
                            )}
                        </p>

                    </div>
                </div>
            ) : null}
        </>
    );
};

export default Profile;
