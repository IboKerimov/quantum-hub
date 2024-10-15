import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { firestore } from "../../firebase";
import { getDocs, collection, limit, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";

// Components
import Filter from "../../components/Filter/Filter";

// Css
import "./Home.css";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const ref = collection(firestore, "post");

    const [searchTerm, setSearchTerm] = useState("");  
    const [sortTerm, setSortTerm] = useState(""); 
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [postsExist, setPostsExists] = useState(true);
    const [loading, setLoading] = useState(true); 

    const refreshFilters = () => {
        setSearchTerm(""); 
        setSortTerm("");   
    }

    // Fetch the most clicked post
    useEffect(() => {
        const fetchData = async () => {
            const q = query(ref, orderBy("clicks", "desc"), limit(4)); 
    
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map((post) => ({
                id: post.id,
                ...post.data(),
            }));
    
            setPosts(postsData);
            setLoading(false);
        };
    
        fetchData();
    }, []);

    const handlePostClick = async (postId) => {
        const postRef = doc(firestore, "post", postId);
        await updateDoc(postRef, {
            clicks: increment(1) // Increment clicks by 1
        });
    };

    // Function to strip HTML tags
    const stripHtmlTags = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

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
        <div className="Home">
            <header>
                <div className="header-in">
                    <h1>
                        Read about <span>Paul Dirac</span>
                    </h1>
                    <p>from</p>
                    <h1>
                        <Link to={"/post/Paul-Dirac"}>HERE</Link>
                    </h1>
                </div>
            </header>
            <main>
                <div className="posts-menu">
                    <h1>Featured Posts</h1>
                    <Link to={"/all-posts"}>See All Posts →</Link>
                </div>

                <div className="posts">
                    {loading ? (
                        <i>Loading posts...</i>
                    ) : postsExist ? (
                        filteredPosts.map((post) => (
                            <div className="post" key={post.id}>
                                <div className="top">
                                    <img src={post.imageUrl} alt={post.title} />
                                    <div className="t-right">
                                        <div className="title">{post.title}</div>
                                        <div className="category">@{post.author}</div>
                                    </div>
                                </div>
                                <div className="bottom">
                                    {post.content && (
                                        <p>{stripHtmlTags(post.content).substring(0, 190) + "..."}</p> // Change here
                                    )}
                                    {/* Add click handler */}
                                    <Link 
                                        to={"/post/" + post.id} 
                                        className="read-all"
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        Read All
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="not-class">
                            <div><strong>No post</strong> found</div>
                            <button onClick={() => {refreshFilters()}} className="refreshFilters">Refresh the filters</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
