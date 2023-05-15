import NavigationBar from "../components/NavigationBar.js";
import ExampleDocument from "../utils/documents/ExampleDocument.js";


import React, {useEffect, useState, useMemo, useCallback, useRef, useContext} from "react";
import * as ReactDom from "react-dom/client";
import {useNavigate, useParams, MemoryRouter } from "react-router-dom";
import arg_parser from "../utils/arg_parser.js";
import html_parser from "../utils/html_parser.js";


import view_posts_icon from "../static/images/view_posts_icon.png";
import create_post_icon from "../static/images/create_post_icon.png";
import interests_icon from "../static/images/interests_icon.png";
import personality_icon from "../static/images/personality_icon.png";

import { DummyPost } from "../components/PostVariants.js";
import { AppContext } from "../context.js";

async function get_posts_from_profile_name(profile_name) {
    return fetch(`/posts/${profile_name}/`,
    {method: "GET",
    credentials: "include",
    mode: "cors",}).then(response => response.json().then((output) =>
    {
    console.log(output);
    return output

    }))
};


function ExternalProfilePage(props){
    const navigate = useNavigate();
    const post_page_ref = useRef(null)

    const limiter = useState(false);
    const [isBusy, setBusy] = useState(true);
    const {logged_in, change_logged_in_state} = useContext(AppContext);
    const params = useParams();
    let function_queue = [];
    let args = params.arguments;
    
    var post_owner = null;

    
    useEffect(() => {              
        if (args != undefined) {
            let commands = arg_parser(args);
            console.log(commands);
            if (commands["target"] == "posts_start") {
                const command = () => {
                    post_page_ref.current.scrollIntoView({ behavior: "smooth", block: "nearest", block: "end"});
                    console.log(post_page_ref.current);
                    console.log("above");
                }
                function_queue.push(command);
            }
            
            
        }

        fetch(`/profiling/all/${params.profile_name}/`,
        {method: "GET",
        credentials: "include",
        mode: "cors",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true}}).then((response) => response.json().then(output => 
        {
        console.log(output["traits"]);
        console.log(output);
        console.log("got it");
        post_owner = output["profile_name"];

        const profile_avatar_box = document.getElementById("ProfileBox");


        if (output["avatar"] != null) {
            profile_avatar_box.style.backgroundImage = `url(/avatars/${output["avatar"]})`;
        
        }

        else {
            profile_avatar_box.dataset.no_avatar = "true";
        }


        const interests_container = document.getElementById("ProfileInterestsBox").getElementsByClassName("StandardSpan")[0];
        const interestKeysToValues = output["interests"];
        const interests = Object.keys(output["interests"]);
        let last_interest = interests[interests.length - 1];
        let newString = "";
        interests.forEach((interest) => {
            if (interestKeysToValues[interest] == "1") {
                newString += `${interest}, `;
            }
        });
        interests_container.innerText = newString.slice(0, -2);
        

        let biography = output["biography"];
        if (output["biography"] != null) {
            const biography_box = document.getElementById("ProfileDescriptionBox");
            let bio = JSON.parse(biography);
            let collection = html_parser(bio, 0);
            const bio_root = ReactDom.createRoot(biography_box);
            bio_root.render(
                <>
                {collection}
                </>
            )
            };
        setBusy(false);

        const gauges = document.getElementsByClassName("ProfileTraitGauge");
        const gauge_dict = {}
        for (const gauge of gauges) {
            gauge_dict[gauge.dataset.target] = gauge;
        }
        for (const trait in output["traits"]) {
            let value = output["traits"][trait]
            let frac = (value/100) * 100;
            gauge_dict[trait].getElementsByClassName("StandardSpan")[0].innerText = `${value} / 100`;

            gauge_dict[trait].dataset.value = value;
            gauge_dict[trait].style.backgroundImage = "linear-gradient(90deg, rgb(125, 62, 62) 0%, " + frac +
                "%, rgb(150, 150, 150) " + frac + "%)";
            
                }

                
            }));
        
            get_posts_from_profile_name(params.profile_name).then((output) => {
                const p = document.getElementById("ProfilePagePostsContainer");
                const root = ReactDom.createRoot(p); 
                root.render(
                    <MemoryRouter>
                    <section style={{position: "absolute", width: "100%", height: "100%", top: "5vh"}}>
                        {output["posts"].map((post) => 
                    <DummyPost key={post[1]} post_title={post[2]} post_content={post[3]} post_date={post[7]}
                    post_id={post[1]} amount_of_comments={post[4]} post_owner={post_owner} thumbs_up={post[5]}
                    thumbs_down={post[6]} reactions={post[8]} link={`/Profile/${post_owner}/${post[1]}`}
                    on_click_function={() => navigate(`/Profile/${post_owner}/${post[1]}`)} {...props}/>)
                        }
                    </section>
                    </MemoryRouter>
                    )

                function_queue.forEach(func => {
                    func()
                });
                
            });
        
            
            

        }, [])
    


    

            
    return(
<>
<NavigationBar/>
<div id="ProfilePageRoot">
<section id="ProfilePagePage">

    <section id="ProfileAvatarAndAchievementArea">
        <div id="ProfileBox"> </div>
        <div id="ProfileAchievementBox">
            <div> Achievements would go here</div>
        </div>
    </section>

    <section id="ProfileCenterSection">
        <div id="ProfileToolbar">
            <div id="ProfileNameSpan">
                {params.profile_name}
            </div>
        </div>
        <div id="ProfileDescriptionBox">

        </div>
            
            
           

        <div id="ProfileOptionsBox">


            <div className="ProfileOption" style={{backgroundImage: `url(${view_posts_icon})`,}}
            onClick={() => post_page_ref.current.scrollIntoView({ behavior: "smooth", block: "nearest", block: "end"})}>
                <div className="ProfileOptionTooltip" style={{}}>
                    <span className="StandardSpan">View Posts</span>
                </div>
            </div>

            <div className="ProfileOption" style={{backgroundImage: `url(${interests_icon})`}}>
                <div className="ProfileOptionTooltip">
                    <span className="StandardSpan">Interests</span>
                </div>
                <div id="ProfileInterestsBox">
                    <span className="StandardSpan"></span>
                </div>
            </div>

            {logged_in ? 
            <div className="ProfileOption" style={{backgroundImage: `url(${personality_icon})`,}}
            onClick={() => navigate(`/PersonalityAssessment/${params.profile_name}`)}>
                <div className="ProfileOptionTooltip">
                    <span className="StandardSpan">Judge Personality</span>
                </div>
            </div>
            : null}



        </div>

    </section>

    <section id="ProfileTraitGaugeContainer" onTouchEnd={(e) => {
        e.stopPropagation();
        e.preventDefault();
        let gauges_element = document.getElementById("Gauges");
        if (e.currentTarget.dataset.expanded != "true") {
            gauges_element.dataset.revealed = "true";
            e.currentTarget.dataset.expanded = "true";
        }
        else {
            gauges_element.dataset.revealed = "false";
            e.currentTarget.dataset.expanded = "false";
        }
    }}>

    <div id="ProfileRevealGaugesArea"/>

        <div id="Gauges">
            <div className="ProfileTraitGauge" data-target="care">
                <span className="ProfileTraitGaugeSpan"> Care</span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>        
            
            <div className="ProfileTraitGauge" data-target="wit">
                <span className="ProfileTraitGaugeSpan"> Wit </span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>

            <div className="ProfileTraitGauge" data-target="cool">
                <span className="ProfileTraitGaugeSpan"> Cool</span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>

            <div className="ProfileTraitGauge" data-target="judgement">
                <span className="ProfileTraitGaugeSpan"> Judgement </span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>

            <div className="ProfileTraitGauge" data-target="crudeness">
                <span className="ProfileTraitGaugeSpan"> Crudeness</span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>
            <div className="ProfileTraitGauge" data-target="malice"> 
                <span className="ProfileTraitGaugeSpan"> Malice</span>
                <div className="ProfileTraitGaugeTooltip">
                    <span className="StandardSpan"></span>
                </div>
            </div>
        </div>

    </section>
    <div id="TraitGaugesStopgap" />



</section>


<section id="ProfilePagePostPage" ref={post_page_ref}>
    <div id="PostViewingOptionsContainer"></div>
        <section id="ProfilePagePostsContainer"></section>


</section>
</div>
</>
    )
};


export default ExternalProfilePage