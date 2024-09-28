import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSort } from "@fortawesome/free-solid-svg-icons";

// Css
import "./Filter.css";

const Filter = ({ setSearchTerm, setSortTerm, setOrderingTerm }) => {
    const [sortClicked, setSortClicked] = useState(false);
    const [searchClicked, setSearchClicked] = useState(false);
    const [orderByClicked, setOrderByClicked] = useState(false);

    const toggleSort = () => {
        setSortClicked(!sortClicked);
        setSearchClicked(false);
        setOrderByClicked(false);
    };

    const toggleSearch = () => {
        setSearchClicked(!searchClicked);
        setSortClicked(false);
        setOrderByClicked(false);
    };

    const toggleOrderBy = () => {
        setOrderByClicked(!orderByClicked);
        setSortClicked(false);
        setSearchClicked(false);
    };

    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [orderingBy, setOrderingBy] = useState("");

    useEffect(() => {
        setSortTerm(category);
    }, [category, setSortTerm]);

    useEffect(() => {
        setSearchTerm(search);
    }, [search, setSearchTerm]);

    useEffect(() => {
        setOrderingTerm(orderingBy);
    }, [orderingBy, setOrderingTerm]);

    return (
        <>
            <div className="filter">
                <button className={`sortBtn btn-active`} onClick={toggleSort}>
                    <FontAwesomeIcon icon={faSort} />
                </button>

                <button className="orderByBtn" onClick={toggleOrderBy}>
                    Order By
                </button>

                <button className={`searchBtn btn-active`} onClick={toggleSearch}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </div>

            <div className={sortClicked ? "sort-active sort" : "sort"}>
                <select onChange={(e) => {
                    setCategory(e.target.value);
                    setSortClicked(false);
                }}>
                    <option value={""}>Sort by Category...</option>
                    <option value={"Personage"}>Personage</option>
                    <option value={"Article"}>Article</option>
                    <option value={"Thoughts"}>Thoughts</option>
                </select>
            </div>

            <div className={searchClicked ? "search-active search" : "search"}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    setSearchClicked(false);
                }}>
                    <input 
                        type="text" 
                        placeholder="Search by Keywords..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </form>
            </div>

            <div className={`orderBy ${orderByClicked ? "orderByOpen" : ""}`}>
                <div className={`overlayOrderBy`} onClick={toggleOrderBy}></div>
                <ul style={{zIndex: "revert-layer"}}>
                    <li>
                        <label>
                            <input 
                                type="radio" 
                                name="ordering" 
                                value={""} 
                                checked={orderingBy === ""}
                                onChange={() => {
                                    setOrderingBy("");
                                    setOrderByClicked(false);
                                }} 
                            /> All Posts
                        </label>
                    </li>

                    <li>
                        <label>
                            <input 
                                type="radio" 
                                name="ordering" 
                                value={"clicks"} 
                                checked={orderingBy === "clicks"}
                                onChange={() => {
                                    setOrderingBy("clicks");
                                    setOrderByClicked(false);
                                }} 
                            /> By the Number of Clicks
                        </label>
                    </li>

                    <li>
                        <label>
                            <input 
                                type="radio" 
                                name="ordering" 
                                value={"date"} 
                                checked={orderingBy === "date"}
                                onChange={() => {
                                    setOrderingBy("date");
                                    setOrderByClicked(false);
                                }} 
                            /> By Date
                        </label>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Filter;
