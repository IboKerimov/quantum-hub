import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Followings.css"
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../../firebase';
import { getDocs, collection, doc } from 'firebase/firestore';
import { arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore';

const Followings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [userDoc, setUserDoc] = useState();
    const [followings, setFollowings] = useState([]);
    const ref = collection(firestore, "users");

    const [unfollowLoad, setUnFollowLoad] = useState(false);

    const unfollow = async (followingUId) => {
        if (user && userDoc) {
            const currentUserRef = doc(firestore, "users", userDoc.id);
            const followedUserRef = doc(firestore, "users", followingUId);
            setUnFollowLoad(true);

            try {
                await updateDoc(currentUserRef, {
                    following: arrayRemove(followingUId),
                });
                await updateDoc(followedUserRef, {
                    followedBy: arrayRemove(user.uid),
                });

                console.log(`Successfully unfollowed user with ID: ${followingUId}`);

                setUserDoc({
                    ...userDoc,
                    following: userDoc.following.filter((id) => id !== followingUId),
                });
            } catch (error) {
                console.error("Error updating unfollow list:", error);
            } finally{
                setUnFollowLoad(false)
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        })

        return () => unsubscribe()
    })

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await getDocs(ref);
            const allUsersData = allUsers.docs.map((user) => ({
                id: user.id,
                ...user.data(),
            }))
            const userData = allUsersData.find(specificUser => specificUser.id === user?.uid)
            const followingUsersData = await allUsersData.filter(fUser => fUser.followedBy.includes(user?.uid));
            setFollowings(followingUsersData);
            setUserDoc(userData)
        }

        fetchUsers();
    }, [followings, user])
        
    return (
        <>
        {user ? 
        <div className='followings'>
            <header>
                <Link onClick={(e) => {navigate(-1)}} className='previous'>
                    <img src='https://cdn0.iconfinder.com/data/icons/round-arrows-1/134/left_blue-512.png' />
                </Link>

                <Link to='/users'>Find New People →</Link>
            </header>

            <main className='u-list'>
                <h1>You Follow</h1>
                {followings.length > 0 ? (
                    followings.map((user) => (
                        <div key={user.id} className='user'>
                            <img src={user.photoURL ? user.photoURL : "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"} alt={user.displayName || 'User'} />
                            <div className='details'>
                                <span className='name'>
                                    {user.username}
                                </span>
                                <span className='email'>{user.email}</span>
                                <div style={{ marginTop: "5px", display: "flex", gap: "10px" }}>
                                    <Link to={`/profile/${user.id}`} className='see-profile-button'>See Profile</Link>
                                    <Link className='see-profile-button' onClick={() => unfollow(user.id)}>Unfollow</Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='follow-a-user'>
                        <h1>You don't follow anybody</h1>
                        <Link to={"/users"}>
                            Find new People
                        </Link>
                    </div> 
                )}
            </main>
        </div>
        :
        navigate("/login")
        }
        </>
    )
}

export default Followings