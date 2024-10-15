import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";
import Post from "./pages/Post/Post";
import AllPosts from "./pages/AllPosts/AllPosts";
import Account from "./pages/Account/Account";
import Users from "./pages/Users/Users";
import Profile from "./pages/Profile/Profile";

// Components
import Navbar from "./components/Navbar/Navbar";

// Css
import "./General.css";
import Followings from "./pages/Followings/Followings";
import NewPost from "./pages/NewPost/NewPost";

const App = () => {
    return(
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/all-posts" element={<AllPosts />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={<Account />} />
                <Route path="/users" element={<Users />} />
                <Route path="/followings" element={<Followings />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/new-post" element={<NewPost />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;