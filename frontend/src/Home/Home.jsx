import React from 'react';
import './Home.css';
import homeBackground from '../assets/pics/banner-img2.jpg';

const Home = () => {
    return (
        <div className="home-page-wrapper">
            <nav className="homeSimpleNavbar">
                <div className="container">
                   <span className="homeBrandText">AgCarE.</span>
                   <a href="/login" className="btnBlue">
                   Start now</a>
                </div>
            </nav>

            <div className="homeHeroBanner">
                
                {/* --- MODIFIED: Renamed class --- */}
                <div 
                    className="home-banner-bg" /* <--- 已修改 */
                    style={{ backgroundImage: `url(${homeBackground})` }}
                ></div>

                {/* Content Area */}
                <div className="container py-5 my-5">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1 className="banner-tittle display-2">Connected Care</h1>
                            <p className="h1 banner-tittle display-2">Smarter Health</p>
                            <div className="banner-text py-4">
                                <p className="mb-0">Stay connected with your doctors, caregivers and family.
Track medication, appointments and daily health – all in one place.</p>
                            </div>
                            <a href="/login" className="btnBlue">
                            Start now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Home;