import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { firestore } from "../../firebase";
import { getDoc, doc, query, where, getDocs, collection } from "firebase/firestore";

// CSS
import "./Post.css";

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authorId, setAuthorId] = useState(null); // State to store author ID

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const ref = doc(firestore, "post", id);
                const querySnapshot = await getDoc(ref);

                if (querySnapshot.exists()) {
                    const postData = querySnapshot.data();
                    setPost(postData);

                    // Fetch user ID based on author's username
                    const userQuery = query(
                        collection(firestore, "users"),
                        where("username", "==", postData.author)
                    );
                    const userSnapshot = await getDocs(userQuery);
                    
                    if (!userSnapshot.empty) {
                        userSnapshot.forEach((doc) => {
                            setAuthorId(doc.id); // Set the author ID
                        });
                    } else {
                        console.log("No such user!");
                    }
                } else {
                    console.log("No such document!");
                    window.location.assign("/");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [id]);

    if (loading) {
        return <div className="PostGeneral">Post is Loading...</div>;
    }

    return (
        <div>
            {post ? 
                <div className="PostGeneral">
                    <div className="head">
                        <Link to={`/profile/${authorId}`}>Author : <i>@{post.author}</i></Link>
                        <h1>{post.title}</h1>
                        <span>{post.category}</span>
                        <br/>
                        <span>
                            {post.date ? new Date(post.date).toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            }) : "Unknown Date"}
                        </span>
                    </div>
                    <hr />
                    <div className="content">
                        <div>
                            <Link to={post.imageUrl}><img src={post.imageUrl} alt={post.title} /></Link>
                            <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                        </div>
                    </div>
                </div>
            : 
                <div className="PostGeneral">
                    <strong><i>No such blog found</i></strong>
                    <Link to={"/"}>Go back to home</Link>
                </div>
            }
        </div>
    );
};

export default Post;
