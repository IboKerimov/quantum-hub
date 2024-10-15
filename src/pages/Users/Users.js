import React, { useEffect, useState } from 'react';
import "./Users.css";
import { firestore, auth } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getDocs, collection, updateDoc, arrayUnion, arrayRemove, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadFollowing, setLoadFollowing] = useState(false);
    const [loadUnfollowing, setLoadUnfollowing] = useState(false);

    const ref = collection(firestore, "users");
    const navigate = useNavigate();

    const follow = async (followingUId) => {
        if (users && currentUser) {
            const uDoc = users.find((user) => user.id === currentUser.uid);
            setCurrentUserDoc(uDoc);

            if (uDoc) {
                const currentUserRef = doc(firestore, "users", uDoc.id);
                const followedUserRef = doc(firestore, "users", followingUId);
                setLoadFollowing(true);

                if (uDoc.following && uDoc.following.includes(followingUId)) {
                    console.log(`User with ID: ${followingUId} is already in your following list.`);
                    setLoadFollowing(false);
                    return;
                }

                try {
                    // Update Firestore
                    await updateDoc(currentUserRef, {
                        following: arrayUnion(followingUId),
                    });
                    await updateDoc(followedUserRef, {
                        followedBy: arrayUnion(currentUser.uid),
                    });

                    console.log(`Successfully followed user with ID: ${followingUId}`);

                    // Update local state to reflect changes
                    setCurrentUserDoc({
                        ...uDoc,
                        following: [...(uDoc.following || []), followingUId],
                    });
                } catch (error) {
                    console.error("Error updating follow list:", error);
                } finally {
                    setLoadFollowing(false);
                }
            } else {
                console.error("Current user document not found.");
            }
        }
    };

    const unfollow = async (followingUId) => {
        if (currentUser && currentUserDoc) {
            const currentUserRef = doc(firestore, "users", currentUserDoc.id);
            const followedUserRef = doc(firestore, "users", followingUId);
            setLoadUnfollowing(true);

            try {
                await updateDoc(currentUserRef, {
                    following: arrayRemove(followingUId),
                });
                await updateDoc(followedUserRef, {
                    followedBy: arrayRemove(currentUser.uid),
                });

                console.log(`Successfully unfollowed user with ID: ${followingUId}`);

                // Update local state to reflect changes
                setCurrentUserDoc({
                    ...currentUserDoc,
                    following: currentUserDoc.following.filter((id) => id !== followingUId),
                });
            } catch (error) {
                console.error("Error updating unfollow list:", error);
            } finally {
                setLoadUnfollowing(false);
            }
        }
    };

    useEffect(() => {
        const fetchCurrentUserDoc = async () => {
            if (currentUser) {
                const usersSnapshot = await getDocs(ref);
                const usersData = usersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const userDoc = usersData.find((user) => user.id === currentUser.uid);
                setCurrentUserDoc(userDoc);
            }
        };

        fetchCurrentUserDoc();
    }, [currentUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(ref);
                const usersData = usersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUsers(usersData);
                setFilteredUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [currentUser]);

    useEffect(() => {
        const filtered = users.filter((user) =>
            (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    return (
        <div className='users'>
            <Link onClick={() => navigate(-1)} className='previous'>
                <img src='https://cdn0.iconfinder.com/data/icons/round-arrows-1/134/left_blue-512.png' alt='Go back' />
            </Link>
            <div className='search-user'>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input
                        type='text'
                        placeholder='Search user by their name or email'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    />
                    <button>Search</button>
                </form>
            </div>

            <main className='u-list'>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className='user'>
                            <img src={user.photoURL} alt={user.displayName || 'User'} />
                            <div className='details'>
                                <span className='name'>
                                    {user.username} {user.id === currentUser?.uid ? "|| You" : ""}
                                </span>
                                <span className='email'>{user.email}</span>
                                {user.id === currentUser?.uid ? 
                                    <Link to={`/account`} className='see-profile-button'>Account</Link>
                                    :
                                    <div style={{ marginTop: "5px", display: "flex", gap: "10px" }}>
                                        <Link to={`/profile/${user.id}`} className='see-profile-button'>See Profile</Link>
                                        {currentUserDoc && currentUserDoc.following && currentUserDoc.following.includes(user.id) ? (
                                            <Link className='see-profile-button' onClick={() => unfollow(user.id)}>{loadUnfollowing ? "UnFollowing..." : "UnFollow"}</Link>
                                        ) : (
                                            <Link className='see-profile-button' onClick={() => follow(user.id)}>{loadFollowing ? "Following..." : "Follow"}</Link>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                    ))
                ) : (
                    <div><i>No user found</i></div> 
                )}
            </main>
        </div>
    );
}

export default Users;
