import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { firestore } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";

// CSS
import "./Post.css";

const Post = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const ref = doc(firestore, "post", id);
                const query = await getDoc(ref);

                if (query.exists()) {
                    setPost(query.data());
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
                        <span>{post.category}</span>
                        <h1>{post.title}</h1>
                        <span>
                            {post.date ? post.date.toDate().toLocaleDateString('en-US', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            }) : "Unknown Date"}
                        </span>
                    </div>
                    <hr />
                    <div className="content">
                        <div>
                            <Link to={post.image_url}><img src={post.image_url} alt={post.title} /></Link>
                            <audio controls className="pxBeVisible">
                                <source src={post.audio_link} />
                            </audio>
                            <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                            <audio controls className="pxVanish">
                                <source src={post.audio_link} />
                            </audio>
                        </div>
                    </div>
                </div>
            : 
                <div className="PostGeneral">
                    <strong><i>No such blog found</i></strong>
                    <Link to={"/"}></Link>
                </div>
            }
        </div>
    );
};

export default Post;
