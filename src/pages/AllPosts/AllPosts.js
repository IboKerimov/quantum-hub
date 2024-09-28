import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { firestore } from "../../firebase";
import { getDocs, collection, updateDoc, increment, doc, orderBy, query } from "firebase/firestore";
import Filter from "../../components/Filter/Filter";

import "./AllPosts.css";

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");  
    const [sortTerm, setSortTerm] = useState(""); 
    const [orderingTerm, setOrderingTerm] = useState("");

    const [filteredPosts, setFilteredPosts] = useState([]);
    const [postsExist, setPostsExists] = useState(true);
    const [loading, setLoading] = useState(true); 

    const ref = collection(firestore, "post");

    const refreshFilters = () => {
        setSearchTerm(""); 
        setSortTerm("");   
        setOrderingTerm(""); // Reset ordering as well
    }

    const handlePostClick = async (postId) => {
        const postRef = doc(firestore, "post", postId);
        await updateDoc(postRef, {
            clicks: increment(1) 
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            let q;
            if (orderingTerm) {
                q = query(ref, orderBy(orderingTerm, "desc"));
            } else {
                q = ref;
            }

            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map((post) => ({
                id: post.id,
                ...post.data(),
            }));
            setPosts(postsData);
            setLoading(false); 
        };

        fetchData();
    }, [orderingTerm]);

    useEffect(() => {
        let filtered = posts;

        if (searchTerm) {
            filtered = filtered.filter((post) =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortTerm) {
            filtered = filtered.filter((post) => post.category === sortTerm);
        }

        setFilteredPosts(filtered);
        setPostsExists(filtered.length > 0);
    }, [posts, searchTerm, sortTerm]);

    return (
        <div className="all-posts">
            <header>
                <h1>All Posts</h1>
            </header>
            
            <Filter 
                setSearchTerm={setSearchTerm}
                setSortTerm={setSortTerm}  
                setOrderingTerm={setOrderingTerm}
            />

            <main>
                <div className="posts">
                    {loading ? (
                        <i>Loading posts...</i>
                    ) : postsExist ? (
                        filteredPosts.map((post) => (
                            <div className="post" key={post.id}>
                                <div className="top">
                                    <img src={post.image_url} alt={post.title} />
                                    <div className="t-right">
                                        <div className="title">{post.title}</div>
                                        <div className="category">{post.category}</div>
                                    </div>
                                </div>
                                <div className="bottom">
                                    {post.content && (
                                        <p dangerouslySetInnerHTML={{ __html: post.content.substr(0, 230) + "..." }}></p>
                                    )}
                                    <Link to={"/post/" + post.id} className="read-all" onClick={() => handlePostClick(post.id)}>Read All</Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="not-class">
                            <div><strong>No post</strong> found</div>
                            <button onClick={refreshFilters} className="refreshFilters">Refresh the filters</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AllPosts;
