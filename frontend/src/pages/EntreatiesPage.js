import { useEffect, useRef, useState, refVisible, useContext } from 'react';
import {MemoryRouter, useNavigate } from 'react-router-dom';
import * as ReactDom from "react-dom/client";
import NavigationBar from "../components/NavigationBar.js";
import {EntreatyViewBox, EntreatySearchBox} from "../components/EntreatyVariants";
import EntreatyCoverMangementPage from './EntreatyCoverManagementPage.js';
import SettingOption from '../components/SettingOption.js';
import TagAdder from '../components/TagAdder.js';


import { mark_entreaties, save_pinned_statuses, unmark_entreaties } from '../functions/PinEntreaties.js';




import Swah from "../static/images/swah.png";
import {EntreatyCreationEditor} from "../components/Editor";
import { DefaultEntreatyDocument } from '../utils/documents/Documents.js';
import { AppContext } from '../context.js';




function select_all(root, navigate) {
    const all_options = document.getElementsByClassName("CategoryButton");
    const options_container = document.getElementById("EntreatySearchOptions");

    for (const option of all_options) {
        option.dataset.active = "true";
    };
    options_container.dataset.active = "false";

    get_entreaties("all").then((entreaty_response) => {
        root.current.render(
        entreaty_response["entreaties"].map((entreaty) => 
        <EntreatySearchBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[0]} 
        entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
        entreaty_date={entreaty[5]} on_click_function={() => navigate(`/Entreaty/${entreaty[1]}`)} />)
            )}
        );
    
    

}


function category_button_switch(e, root, navigate) {
    const all_options = document.getElementsByClassName("CategoryButton");
    let options_all_sought = true;
    let sought_tags = "";
    const target_button = e.currentTarget;
    const options_container = document.getElementById("EntreatySearchOptions")
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
            if (option != target_button) {
                option.dataset.active = "false";
            }
        }

        options_container.dataset.active = "true";
        get_entreaties(`&${target_button.dataset.category}`).then((entreaty_response) => {
            root.current.render(
                entreaty_response["entreaties"].map((entreaty) => 
                <EntreatySearchBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[0]} 
                entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
                entreaty_date={entreaty[5]} on_click_function={() => navigate(`/Entreaty/${entreaty[1]}`)} />)
            )
        });
        
    }

    else {
        target_button.dataset.active = {"true": "false", "false": "true"}[target_button.dataset.active];
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
            options_container.dataset.active = "false";
        }
        else {
            options_container.dataset.active = "true";
        }

        if (sought_tags.length == 0) {
            select_all(root, navigate);
        }
        else if (sought_tags.length > 0) {
            get_entreaties(sought_tags).then((entreaty_response) => {
                root.current.render(
                    entreaty_response["entreaties"].map((entreaty) => 
                    <EntreatySearchBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[0]} 
                    entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
                    entreaty_date={entreaty[5]} on_click_function={() => navigate(`/Entreaty/${entreaty[1]}`)} />)
                )
            });
        }
    };
}


function CategoryButton({category_name, root, navigate}) {
    return (
<div className="CategoryButton" data-active="true" data-category={category_name.toLowerCase()} onClick={(e) => {
    category_button_switch(e, root, navigate)
    }}> 
    <span className="CategoryButtonSpan">{category_name}</span>
    <div className="CategoryButtonIndicator"></div>
</div>
    )
}


function entreaty_filter_search(root, sought_tags) {
    if (sought_tags.length > 0) {
        get_entreaties(sought_tags).then((entreaty_response) => {
            root.current.render(
                entreaty_response["entreaties"].map((entreaty) => 
                <EntreatySearchBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[0]} 
                entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
                entreaty_date={entreaty[5]} />)
            )
        });
    }
    
}


function reveal_entreaty_creation_section() {
    const lockout_host = document.getElementById("CreateNewEntreaty");
    if (lockout_host.dataset.lockout == "true") {
        return -1
    }
    lockout_host.dataset.lockout = "true";

    const creation_section = document.getElementById("EntreatyCreationSection");
    const current_entreaties_section = document.getElementById("CurrentEntreatiesSection");
    const entreaty_details_panel = document.getElementById("EntreatyDetailsPanel");
    const entreaty_management_options = document.getElementById("EntreatyManagementOptions");
    const relevant_section = document.getElementById("EntreatyManagementSection");

    const ces_comparison = window.getComputedStyle(current_entreaties_section);
    const edp_comparison = window.getComputedStyle(entreaty_details_panel);
    const emo_comparison = window.getComputedStyle(entreaty_management_options);
    const section_comparison = window.getComputedStyle(relevant_section);

    creation_section.style.top = ces_comparison.getPropertyValue("top");
    creation_section.style.width = ces_comparison.getPropertyValue("width");
    creation_section.style.height = edp_comparison.getPropertyValue("height").slice(0, -2) - 
    emo_comparison.getPropertyValue("height").slice(0, -2) + "px";
    creation_section.style.left = edp_comparison.getPropertyValue("width");
    creation_section.style.opacity = "0";

    entreaty_management_options.style.transition = ".75s";
    entreaty_management_options.style.height = "0px";

    const entreaty_management_options_children = entreaty_management_options.children;
    for (const child of entreaty_management_options_children){
        child.style.transition = ".75s"
        child.style.color = "rgba(0, 0, 0, 0)";
    }
    entreaty_details_panel.style.width = "0px";
    entreaty_details_panel.style.transition = ".75s";
    setTimeout(() => {
        entreaty_management_options.style.display = "none";
        entreaty_details_panel.style.display = "none";
        current_entreaties_section.style.display = "none";
        lockout_host.dataset.lockout = "false";
        

        }, 750)
    setTimeout(() => {
        creation_section.style.width = "100%";
        creation_section.style.height = "100%";
        creation_section.style.left = "0px";
        creation_section.style.top = "0px";
        creation_section.style.transition = ".75s"
        creation_section.style.opacity = "1";

        }, 1)
    current_entreaties_section.style.transition = "1.25s";
    current_entreaties_section.style.opacity = "0";
    creation_section.style.position = "absolute";
    creation_section.style.display = "block";
};


async function submit_entreaty(entreaty_document) {
    var form = new FormData;
    const title = document.getElementById("EntreatyCreationTitleField").value;
    const entreaty_cover = document.getElementById("EntreatyCreationPicture").style.backgroundImage;
    const open_access = document.getElementById("OpenAccess").dataset.status;
    const tag_page = document.getElementById("EntreatiesTagPage");
    const tags = tag_page.getElementsByClassName("SettingOptionContainer");
    form.append("content", JSON.stringify(entreaty_document));
    form.append("title", title);
    form.append("open_access", open_access);

    let all_false = true;
    for (let index = 0; index < tags.length; index++) {
        let target_tag = tags[index];
        form.append(target_tag.id, target_tag.dataset.status);
        if (target_tag.dataset.status == "1") {
            all_false = false;
        }
    }

    if (all_false == true) {
        alert("MUST ADD TAGS TO SUBMIT");
        return -1
    }
    
    console.log(entreaty_cover.length);
    if (entreaty_cover.length > 0) {
        const isolated_base64_info = entreaty_cover.split("base64,")[1];
        var entreaty_cover_blob = new Blob([isolated_base64_info]);
        form.append("cover", entreaty_cover_blob);
        alert("got a cover")
    }
    return fetch("/flask/self/entreaty_management/create_entreaty/", {
        method: "POST",
        body: form, 
        credentials: "include",
        mode: 'cors',
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true}   
    }).then((output) => output.json().then((response) => {
        return response
    }))
}


function close_entreaty_creation_section() {
    const lockout_host = document.getElementById("CreateNewEntreaty");
    if (lockout_host.dataset.lockout == "true") {
        return -1
    }
    lockout_host.dataset.lockout = "true";
    const creation_section = document.getElementById("EntreatyCreationSection");
    const current_entreaties_section = document.getElementById("CurrentEntreatiesSection");
    const entreaty_details_panel = document.getElementById("EntreatyDetailsPanel");
    const entreaty_management_options = document.getElementById("EntreatyManagementOptions");
    const relevant_section = document.getElementById("EntreatyManagementSection");

    const ces_comparison = window.getComputedStyle(current_entreaties_section);
    const edp_comparison = window.getComputedStyle(entreaty_details_panel);
    const emo_comparison = window.getComputedStyle(entreaty_management_options);
    const section_comparison = window.getComputedStyle(relevant_section);

    current_entreaties_section.style.transition = "0s";
    current_entreaties_section.opacity = "0";
    current_entreaties_section.style.display = "block";

    entreaty_details_panel.style.transition = "0s";
    entreaty_details_panel.style.width = "0%";
    entreaty_details_panel.style.display = "block";

    entreaty_management_options.style.transition = "0s";
    entreaty_management_options.style.height = "0%";
    entreaty_management_options.style.display = "flex";

    const entreaty_management_options_children = entreaty_management_options.children;
    for (const child of entreaty_management_options_children){
        child.style.transition = ".75s"
        child.style.color = "rgb(0, 0, 0)";
    }
    

    setTimeout(() => {
        creation_section.style.display = "none";
        lockout_host.dataset.lockout = "false";

        }, 750)

    setTimeout(() => {
        creation_section.style.top = ces_comparison.getPropertyValue("top");
        creation_section.style.width = ces_comparison.getPropertyValue("width");
        creation_section.style.height = edp_comparison.getPropertyValue("height").slice(0, -2) - 
        emo_comparison.getPropertyValue("height").slice(0, -2) + "px";
        creation_section.style.left = "10%";
        creation_section.style.transition = ".75s"
        creation_section.style.opacity = "0";

        current_entreaties_section.style.transition = "1.25s";
        current_entreaties_section.style.opacity = "1";

        entreaty_details_panel.style.transition = ".75s";
        entreaty_details_panel.style.width = "10%";

        entreaty_management_options.style.transition = ".75s";
        entreaty_management_options.style.height = "10vh";

        }, 1)
    current_entreaties_section.style.transition = "1.25s";
    current_entreaties_section.style.opacity = "0";
};

async function get_entreaties(sought) {
    return fetch(`/flask/entreaties/${sought}/`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true}
        }).then((output) => output.json().then((response) => {return response}))
};

async function get_joined_entreaties() {
    return fetch("/flask/self/entreaties/", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true}
        }).then((output) => output.json().then((response) => {return response}))
};

function reveal_entreaty_settings() {
    document.getElementById("EntreatySettingsMangementSection").style.display = "block";
};

function close_entreaty_settings() {
    document.getElementById("EntreatySettingsMangementSection").style.display = "none";
};


function open_entreaty_tags() {
    const tag_page = document.getElementById("EntreatiesTagPage");
    tag_page.style.display = "block";
};

function close_entreaty_tags() {
    const tag_page = document.getElementById("EntreatiesTagPage");
    tag_page.style.display = "none";
};


function EntreatiesPage(props){
    const [editorDocument, updateDocument] = useState(DefaultEntreatyDocument);
    const {logged_in, change_logged_in_state} = useContext(AppContext);
    const navigate = useNavigate();

    const EntreatySearchRef = useRef(null);
    const CurrentEntreatiesRef = useRef(null);
    const entreaty_cover_management_root = useRef(null);
    const joined_entreaties_implant_root = useRef(null);
    const entreaties_implant_root = useRef(null);
    const scroll_to_entreaty_search = () => {
        EntreatySearchRef.current.scrollIntoView();
    };
    const scroll_to_current_entreaties = () => {
        CurrentEntreatiesRef.current.scrollIntoView();
    };

     useEffect(() => {

        const test = document.getElementById("Test");
        const entreaties_filterer = document.getElementById("EntreatySearchFilter");
        const html = document.documentElement.scroll;
        const vh_to_px_rate = (window.innerHeight / 100);
        const px_target = vh_to_px_rate * 7.5;
        const entreaties_implant_container = document.getElementById("EntreatiesImplantContainer");
        if (logged_in == true) {
    const entreaty_cover_management_container = document.getElementById("EntreatyCoverManagementContainer");
    entreaty_cover_management_root.current = ReactDom.createRoot(entreaty_cover_management_container);
        }

        get_entreaties("all").then((entreaty_response) => {
            entreaties_implant_root.current = ReactDom.createRoot(entreaties_implant_container);
            entreaties_implant_root.current.render(
            <MemoryRouter>
            {
            entreaty_response["entreaties"].map((entreaty) => 
            <EntreatySearchBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[0]} 
            entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
            entreaty_date={entreaty[5]} on_click_function={() => navigate(`/Entreaty/${entreaty[1]}`)} />)
            }
            </MemoryRouter>
            )
        }).then(() => {
            if (logged_in == true) {
                get_joined_entreaties().then((joined_entreaties_response) => {
                    const current_entreaties_section = document.getElementById("CurrentEntreatiesSection");
                    joined_entreaties_implant_root.current = ReactDom.createRoot(current_entreaties_section);
                    joined_entreaties_implant_root.current.render(
                        joined_entreaties_response["entreaties"].map((entreaty) => 
                        <EntreatyViewBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[6]} 
                        entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
                        entreaty_date={entreaty[12]} 
                        pinned={entreaty[15]} 
                        on_click_function={(e) => {
                            if (e.currentTarget.dataset.pin_candidate != "true") {
                                navigate(`/Entreaty/${entreaty[1]}`);
                            }
                            }} />)
                    )
                })
            }
            
        });
    }, []);



    return(
    <div>
    <NavigationBar/>
        <div className="ScrollContainer">
        {logged_in == true ? 
            <section className="ScrollSection" id="EntreatyManagementSection" ref={CurrentEntreatiesRef}>
                <div id="EntreatyManagementOptions">

                    <div className="EntreatyManagementOption" id="CreateNewEntreaty" data-lockout="false" 
                    onClick={() => reveal_entreaty_creation_section()}>
                        <span className="EntreatyManagementSpan">Create new</span>
                    </div> 

                    <div id="PinCancel" className="EntreatyManagementOption" onClick={() => unmark_entreaties()}> 
                        <span className="EntreatyManagementSpan">Cancel</span> 
                    </div> 

                    <div id="PinSave" className="EntreatyManagementOption" onClick={() => save_pinned_statuses()}> 
                        <span className="EntreatyManagementSpan">Save</span> 
                    </div> 

                    <div id="PinButton" className="EntreatyManagementOption" onClick={() => mark_entreaties()}> 
                        <span className="EntreatyManagementSpan">Pin</span> 
                    </div>     
                    

                    <div className="EntreatyManagementOption" onClick={() => scroll_to_entreaty_search()}>
                        <span className="EntreatyManagementSpan">Find more</span>
                    </div> 

                </div>
                <div id="EntreatyDetailsPanel">
                    <div style={{position: "relative", left: "2.5%", top: "2vh", width: "95%", backgroundColor: "grey"}}>
                    <span></span>
                    </div> 
                </div>

                <section id="CurrentEntreatiesSection" style={{backgroundImage: `url(${Swah})`, backgroundSize: "cover"}}>
                </section>

                <section id="EntreatyCreationSection" style={{backgroundColor: "rgb(62, 62, 125)", display: "none",
                backgroundImage: `url(${Swah})`, backgroundSize: "cover"}} 
                onClick={() => {
                        console.dir(EntreatyCreationEditor);
                        
                    }
                }>
                    <textarea className="EntreatyCreationSpanContainer" id="EntreatyCreationTitleField" defaultValue="Title Would Go Here"> 
                    
                    </textarea>

                    <div className="EntreatyCreationSpanContainer" style={{left: "5%"}}
                    onClick={() => close_entreaty_creation_section()}> 
                        <span className="EntreatyManagementSpan">Close</span>
                    </div>

                    <div className="EntreatyCreationSpanContainer" style={{right: "2.5%"}}
                    onClick={() => submit_entreaty(editorDocument).then((output) => {
                        if (output != -1) {
                            close_entreaty_creation_section();
                        get_joined_entreaties().then((joined_entreaties_response) => {
                            joined_entreaties_implant_root.current.render(
                                joined_entreaties_response["entreaties"].map((entreaty) => 
                                <EntreatyViewBox key={entreaty[1]} entreaty_id={entreaty[1]} entreaty_owner={entreaty[6]} 
                                entreaty_content={entreaty[3]} entreaty_title={entreaty[2]} entreaty_cover={entreaty[4]} 
                                entreaty_date={entreaty[12]} 
                                pinned={entreaty[15]} 
                                on_click_function={(e) => 
                                    {
                                        if (e.currentTarget.dataset.pin_candidate != "true") {
                                            navigate(`/Entreaty/${entreaty[1]}`);
                                        }
                                    }} />)
                            );
                        })
                        }
                            
                    })}>
                        <span className="EntreatyManagementSpan">Submit</span>
                    </div>

                     <div id="EntreatyCreationPictureContainer">
                        <div id="EntreatyCreationPicture"></div>
                        <div id="EntreatyCreationTagsContainer"></div>
                        <div className="EntreatyCreationSpanContainer" id="EntreatyCreationAddImageButton" onClick={(e) => {
                            e.preventDefault();
                            let entreaty_cover_management_container = document.getElementById("EntreatyCoverManagementContainer");
                            entreaty_cover_management_container.style.display = "block";
                            entreaty_cover_management_root.current.render(<EntreatyCoverMangementPage/>);
                        }}>
                            <span className="StandardSpan">Add Image</span>
                        </div>
                        <div className="EntreatyCreationSpanContainer" id="EntreatyCreationAddTagsButton" 
                        onClick={() => open_entreaty_tags()}>
                            <span className="StandardSpan">Add Tags</span>
                        </div>

                        <div className="EntreatyCreationSpanContainer" id="EntreatyCreationSettingsButton" 
                        onClick={() => reveal_entreaty_settings()}>
                            <span className="StandardSpan">Entreaty Settings</span>
                        </div>
                    </div>

                    <div>
                        <EntreatyCreationEditor relevant_document={editorDocument} onChange={updateDocument} />
                    </div>
                </section>

            <section className="ScrollSection" id="EntreatyCoverManagementContainer">

            </section>

            <section className="ScrollSection" id="EntreatySettingsMangementSection">
                <section id="EntreatyCreationSettingsMetaOptionsSection">
                    <div className="EntreatyCreationsSettingsMetaOption" onClick={() => close_entreaty_settings()}>
                        <span className="StandardSpan">Close Settings</span>
                    </div>
                    <div className="EntreatyCreationsSettingsMetaOption">
                        <span className="EntreatyManagementSpan">Default Settings</span>
                    </div>
                </section>
                <SettingOption setting_name="Open Access" default_status="1" id="OpenAccess" />
                <SettingOption setting_name="Immediate Join" default_status="1" id="ImmediateJoin" />

            </section>

            <TagAdder id="EntreatiesTagPage" save_and_exit_function={() => {
                close_entreaty_tags();
                return true
            }}
            save_and_exit_text="Save" cancel_button={false}
            tags={[ ["Art", "0", "art"], ["Design", "0", "design"], ["Gaming", "0", "gaming"], 
            ["Programming", "0", "programming"], ["Music", "0", "music"], ["Writing", "0", "writing"], 
            ["Roleplaying", "0", "roleplaying"] ]}></TagAdder>

            </section> : null}
            <section className="ScrollSection" ref={EntreatySearchRef}>

                <div id="EntreatySearchFilter">
                <div className="EntreatyDropdownSearchOption" id="EntreatiesCategoriesDropdown" onClick={(e) => {

                    let entreaty_dropdown_search_options = document.getElementById("EntreatyDropdownSearchOptions");
                    let relevant_span = e.currentTarget.getElementsByClassName("EntreatyManagementSpan")[0];
                    let current_entreaties_navigator = document.getElementById("CurrentEntreatiesNavigator");
                    let button = e.currentTarget;
                    if (e.currentTarget.dataset.active != "true") {
                        entreaty_dropdown_search_options.dataset.revealed = "true";
                        setTimeout(() => {
                            entreaty_dropdown_search_options.dataset.shifted = "true";
                        }, 0);
                        relevant_span.innerText = "Close";
                        e.currentTarget.dataset.shifted = "true";
                        e.currentTarget.dataset.active = "true";
                        if (current_entreaties_navigator != null) {
                            current_entreaties_navigator.dataset.mobile_shifted = "true";
                        }
                    }
                    else {
                        entreaty_dropdown_search_options.dataset.shifted = "false";
                        setTimeout(() => {
                            if (button.dataset.active != "true") {
                                entreaty_dropdown_search_options.dataset.revealed = "false";
                            }
                            
                        }, 500)
                        relevant_span.innerText = "Categories"
                        if (current_entreaties_navigator != null) {
                            current_entreaties_navigator.dataset.mobile_shifted = "false";
                        }
                        e.currentTarget.dataset.shifted = "false"
                        e.currentTarget.dataset.active = "false";
                        
                    
                    }

                }}> 
                <span className="EntreatyManagementSpan">Categories</span> 
                </div>
                    {(logged_in == true) ? 
                    <div className="EntreatyManagementOption" id="CurrentEntreatiesNavigator" 
                    onClick={() => scroll_to_current_entreaties()}>
                        <span className="EntreatyManagementSpan">View current</span>
                    </div>: null}
                </div>

                <div id="EntreatySearchOptions">
                    <CategoryButton category_name="Design" root={entreaties_implant_root} 
                    navigate={navigate}></CategoryButton>
                    
                    <CategoryButton category_name="Art" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>
                    
                    <CategoryButton category_name="Programming" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    <CategoryButton category_name="Gaming" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    <CategoryButton category_name="Roleplaying" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    
                    <CategoryButton category_name="Writing" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    
                    <CategoryButton category_name="Music" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                </div>

                <div id="EntreatyDropdownSearchOptions">
                <CategoryButton category_name="Design" root={entreaties_implant_root} 
                    navigate={navigate}></CategoryButton>
                    
                    <CategoryButton category_name="Art" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>
                    
                    <CategoryButton category_name="Programming" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    <CategoryButton category_name="Gaming" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    <CategoryButton category_name="Roleplaying" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    
                    <CategoryButton category_name="Writing" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                    
                    <CategoryButton category_name="Music" root={entreaties_implant_root}
                    navigate={navigate}></CategoryButton>

                </div>

                <section id="EntreatiesContainer">
                <div className="ScrollSubsection" id="EntreatiesImplantContainer">
                </div>





                </section>
         </section>
        </div>
    </div>);


    };


export default EntreatiesPage