import React, { useEffect, useState } from 'react';
import { auth, firestore, storage } from '../../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import "./NewPost.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { faPersonBreastfeeding } from '@fortawesome/free-solid-svg-icons';

const NewPost = () => {
    const [user, setUser] = useState(null); // Initialize as null
    const [title, setTitle] = useState("");
    const [postId, setPostId] = useState("");
    const [category, setCategory] = useState("");
    const [author, setAuthor] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [content, setContent] = useState("");
    const [contentError, setContentError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [secondPhase, setSecondPhase] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) { // Check the currentUser instead of user
                navigate("/"); // Redirect to home if not logged in
            }
        });

        return () => unsubscribe();
    }, [navigate]); // Add navigate to the dependency array

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setAuthor(user.displayName);
        if (content) {
            setLoading(true);
            let imageUrl = "";
            try {
                if (imageFile) {
                    const storageRef = ref(storage, `post-banners/${user.email}/${user.uid}/${imageFile.name}`);
                    const snapshot = await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(snapshot.ref);
                }
    
                const generatedPostId = `${title.replaceAll(" ", "")}-${Math.random().toString(36).substring(2, 15)}`;
                await addDoc(collection(firestore, "post"), {
                    title: title,
                    category: category,
                    clicks: 0,
                    content: content,
                    author: user.displayName,
                    imageUrl: imageUrl,
                    date: new Date().toISOString(),
                }).then((docRef) => {
                    // Navigate to the post after it has been added
                    navigate(`/post/${docRef.id}`);
                });
            } catch (error) {
                console.error("Error adding document: ", error);
            } finally {
                setLoading(false);
            }
        } else {
            setContentError(true);
        }
    };
    

    return (
        <div className='outer-npost'>
            {!secondPhase ? (
                <div className='new-post'>
                    <h1 className='header1 hdr1np'>New Post</h1>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSecondPhase(true);
                        }}
                    >
                        <input value={`Author: @${user?.displayName}`} className='item' readOnly />
                        <input
                            type='text'
                            value={title}
                            placeholder='Title of the Post'
                            className='item'
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setPostId(`${title.replaceAll(" ", "")}${Math.random().toFixed(6)}`);
                            }}
                            required
                        />
                        <input
                            type='file'
                            className='item'
                            onChange={handleImageChange}
                            required
                        />
                        <select value={category} className='item' onChange={(e) => setCategory(e.target.value)} required>
                            <option value={""}>Select Category</option>
                            <option value={"Personage"}>Personage</option>
                            <option value={"Article"}>Article</option>
                            <option value={"Thought"}>Thought</option>
                        </select>
                        <button type='submit' className='btn'>Next →</button>
                    </form>
                </div>
            ) : (
                <div className='post-content'>
                    <h1 className='header1'>What is it About?</h1>
                    {contentError && <p style={{ color: "red", marginBottom: "10px" }}>* Content cannot be empty</p>}
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={(value) => setContent(value)}
                        placeholder="Write about your research comprehensively..."
                        className="custom-quill-editor"
                    />

                    <div className="actions">
                        <button className="btn" onClick={() => setSecondPhase(false)}>Go Back</button>
                        <button className="btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPost;
