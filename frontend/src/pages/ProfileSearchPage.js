import { useEffect, useRef, useState, refVisible } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate, Link } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar.js";
import ProfileSearchBox from "../components/ProfileSearchBox.js";



async function get_profiles(filter_targets, search_string) {
    return fetch(`/profile_search/${filter_targets}/${search_string}/`, 
    {
        method: "GET",
        mode: "cors"
    }).then((response) => response.json().then((output) => {
        return output
    }))

};


function profile_interest_option_trigger(event, root, navigate){
    const interests_container = document.getElementById("ProfileInterestsSearch");
    const targeted_option = event.target
    const all_options = document.getElementsByClassName("DropdownOption");
    const name_field = document.getElementById("ProfileNameSearchField");
    const search_string = name_field.value.trim();
    let options_all_sought = true;
    let sought_tags = "";
    for (const option of all_options) {
        if (option.dataset.ignore) {
            continue
        }

        if (option.dataset.active == "false") {
            options_all_sought = false;
            break;
            }
        };

    if (options_all_sought == true) {
        for (const option of all_options) {
            if (option.dataset.ignore) {
                continue
            }

            if (option != targeted_option) {
                option.dataset.active = "false";
            }
        }
        interests_container.dataset.active = "true";
        if (search_string.length > 0 ) {
            get_profiles(`&${targeted_option.dataset.category}`, search_string).then((output) => {
                root.render(
                    <MemoryRouter>
                        {
                        output["profilings"].map((profile) =>
                        <Link to={`/Profile/${profile[1]}`} key={profile[0]} style={{color: "inherit"}}>
                        <ProfileSearchBox profile_name={profile[1]} profile_avatar={profile[2]} introduction={profile[3]} 
                        navigate={() => navigate(`/Profile/${profile[1]}`)} />
                        </Link> 
                            )
                        }
                    </MemoryRouter>

                )
            });
        }
    }

    else {
        targeted_option.dataset.active = {"true": "false", "false": "true"}[targeted_option.dataset.active];
        let all_false = true;
        let all_true = true;
        for (const option of all_options) {
            if (option.dataset.ignore) {
                continue
            }
            if (option.dataset.active == "true") {
                sought_tags += `&${option.dataset.category}`;
                all_false = false;
                }
            else {
                all_true = false;
            }
            };

        if (all_false == true || all_true == true) {
            interests_container.dataset.active = "false";
        }
        else {
            interests_container.dataset.active = "true";
        }
        if (sought_tags.length == 0) {
            select_all(root, navigate);
        }
        else if (search_string.length > 0) {
            if (sought_tags.length > 0 ) {
                get_profiles(sought_tags, search_string).then((output) => {
                    root.render(
                        <MemoryRouter>
                        {
                        output["profilings"].map((profile) =>
                        <Link to={`/Profile/${profile[1]}`} key={profile[0]} style={{color: "inherit"}}>
                        <ProfileSearchBox profile_name={profile[1]} profile_avatar={profile[2]} introduction={profile[3]}
                        navigate={() => navigate(`/Profile/${profile[1]}`)} />
                        </Link> 
                            )
                        }
                        </MemoryRouter>
                    )
                });
            }
            
    
        }
    };

    


};

function select_all(root, navigate) {
    const all_options = document.getElementsByClassName("DropdownOption");
    const interests_container = document.getElementById("ProfileInterestsSearch");
    const name_field = document.getElementById("ProfileNameSearchField");
    const search_string = name_field.value.trim();

    for (const option of all_options) {
        option.dataset.active = "true";
    };
    interests_container.dataset.active = "false";

    if (search_string.length > 0) {
        get_profiles("all", search_string).then((output) => {
            root.render(
                <MemoryRouter>
                        {
                        output["profilings"].map((profile) =>
                        <Link to={`/Profile/${profile[1]}`} key={profile[0]} style={{color: "inherit"}}>
                        <ProfileSearchBox profile_name={profile[1]} profile_avatar={profile[2]} introduction={profile[3]} 
                        navigate={() => navigate(`/Profile/${profile[1]}`)} />
                        </Link> 
                            )
                        }
                </MemoryRouter>
            )
        });
    }

}


function profile_filter_search(root, search_string, navigate) {
    const interests_container = document.getElementById("ProfileInterestsSearch");
    let sought_tags = ""
    const interests = interests_container.getElementsByClassName("DropdownOption");
    for (let index = 0; index < interests.length; index++) {
        const target_interest = interests[index];
        if (target_interest.dataset.ignore == "true") {
            continue
        }
        if (target_interest.dataset.active == "true") {
            sought_tags += `&${target_interest.dataset.category}`;
        }
    }
    if (sought_tags.length > 0) {
        get_profiles(sought_tags, search_string).then((output) => {
            root.render(
                <MemoryRouter>
                        {
                        output["profilings"].map((profile) =>
                        <Link to={`/Profile/${profile[1]}`} key={profile[0]} style={{color: "inherit"}}>
                        <ProfileSearchBox profile_name={profile[1]} profile_avatar={profile[2]} introduction={profile[3]} 
                        navigate={() => navigate(`/Profile/${profile[1]}`)} />
                        </Link> 
                            )
                        }
                </MemoryRouter>
            )
        });
    }
    
    
}


function DropdownOption({interest, on_click_event, root, navigate}) {


    return (
<div className="DropdownOption" data-active={true} data-category={interest.toLowerCase()}
onClick={(event) => on_click_event ? on_click_event() : profile_interest_option_trigger(event, root, navigate)}>
    <span className="StandardSpan" data-no_click="true">{interest}</span>
</div>
    )
}



function ProfileSearchPage(props){
    const [root, set_root] = useState();
    const navigate = useNavigate();
    useEffect(() => {
        set_root(createRoot(document.getElementById("ProfileSearchBoxesContainer")));
        }, []);
    
        
    return(
<div id="ProfileSearchPageRoot">       
    <NavigationBar/>
    <div id="ProfileSearchOptionsContainer">
        <div id="ProfileNameSearch">
            <span className="StandardSpan" id="NameSearchText" style={{position: "absolute", left: "0%", width: "35%"}}>
                Name: </span>
            <span className="StandardSpan" id="NameSearchSymbol" style={{position: "absolute", left: "0%", width: "25%"}}>
                🔍</span>
            <input type="text" id="ProfileNameSearchField" name="name" data-current_len={0} onChange={(e) => {
                const self = e.currentTarget;
                let len = self.value.trim().length;
                
                if (len == 0) {
                    root.render();
                    return
                };
                
                //alert(e.nativeEvent.data);
                console.log(e.nativeEvent);
                const interests_container = document.getElementById("ProfileInterestsSearch");
                if (interests_container.dataset.active == "true") {
                    profile_filter_search(root, self.value, navigate);
                }
                else {
                    get_profiles("all", self.value).then((output) => {
                        console.log(output);
                        root.render(
                        <MemoryRouter>
                        {
                        output["profilings"].map((profile) =>
                        <Link to={`/Profile/${profile[1]}`} key={profile[0]} style={{color: "inherit"}}>
                        <ProfileSearchBox profile_name={profile[1]} profile_avatar={profile[2]} introduction={profile[3]} 
                        navigate={() => navigate(`/Profile/${profile[1]}`)} />
                        </Link> 
                            )
                        }
                        </MemoryRouter>
                        )
                    });
                }
                
            }} />
        </div>

        <div id="ProfileInterestsSearch" data-active="false"> 
            <span className="StandardSpan" style={{left: "0%", textAlign: "center", width: "100%"}}>Interests</span>
            <div id="DropdownContainer">

                <DropdownOption interest="Any & None" data-ignore="true" on_click_event={() => select_all(root, navigate)}></DropdownOption>

                <DropdownOption interest="Art" root={root} navigate={navigate}></DropdownOption>

                <DropdownOption interest="Design" root={root} navigate={navigate}></DropdownOption>

                <DropdownOption interest="Gaming" root={root} navigate={navigate}></DropdownOption>

                <DropdownOption interest="Programming" root={root} navigate={navigate}></DropdownOption>

                <DropdownOption interest="Music" root={root} navigate={navigate}></DropdownOption>

                <DropdownOption interest="Writing" root={root} navigate={navigate}></DropdownOption>

            </div>  
        </div>
    </div>
    <section id="ProfileSearchBoxesContainer">

    </section>

</div>);        


    };


export default ProfileSearchPage