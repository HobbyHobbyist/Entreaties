import React, {useEffect, useState, useContext, useRef, forwardRef, useReducer} from "react";
import {useNavigate, useParams} from "react-router-dom";
import * as ReactDom from "react-dom/client";
import NavigationBar from "../components/NavigationBar";
import { AppContext } from "../context";

import { EntreatyThreadEditor } from "../components/Editor";
import { EntreatyThread } from "../components/EntreatyVariants";
import EmptyDocument from "../utils/documents/EmptyDocument";


function open_create_section() {
    const create_section_popup = document.getElementById("CreateNewSectionPopup");
    const section_options_container = document.getElementById("SpecificEntreatyOptionsContainer");
    create_section_popup.style.display = "block";
    section_options_container.style.visibility = "hidden";
};

function close_create_section() {
    const create_section_popup = document.getElementById("CreateNewSectionPopup");
    const section_options_container = document.getElementById("SpecificEntreatyOptionsContainer");
    create_section_popup.style.display = "none";
    section_options_container.style.visibility = "visible";
};


function create_section(entreaty_id) {
    const form = new FormData();
    const section_name_holder = document.getElementById("CreateNewSectionTextArea");
    form.append("section_name", section_name_holder.value);

    return fetch(`/create_entreaty_section/${entreaty_id}/`, {
    method: "POST",
    body: form, 
    credentials: "include",
    mode: 'cors',
    headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Credentials": true}  
    });
};


function open_create_thread() {
    const page_root = document.getElementById("SpecificEntreatyPageRoot");
    const create_thread_root = document.getElementById("SpecificEntreatyCreateThreadRoot");

    const options_container = document.getElementById("SpecificEntreatyOptionsContainer");
    page_root.style.opacity = 0;
    setTimeout(() => {
        page_root.style.display = "none";
    }, 350)
    options_container.style.height = "0vh";
    create_thread_root.style.display = "block";
    setTimeout(() => {
        create_thread_root.dataset.open = "true";
    }, 13)

};

function close_create_thread() {
    const page_root = document.getElementById("SpecificEntreatyPageRoot");
    const create_thread_root = document.getElementById("SpecificEntreatyCreateThreadRoot");

    const options_container = document.getElementById("SpecificEntreatyOptionsContainer");
    page_root.style.display = "block";
    page_root.style.opacity = 1;

    options_container.style.height = "10vh";
    create_thread_root.dataset.open = "false";
    setTimeout(() => {
        create_thread_root.style.display = "none";
    }, 350)

};


function submit_entreaty_thread(entreaty_thread_content, parent_entreaty, parent_section) {
    const title_container = document.getElementById("SpecificEntreatyThreadTitleField");
    const jsonfied_document = JSON.stringify(entreaty_thread_content);
    const form = new FormData();

    form.append("title", title_container.value);
    form.append("entreaty_thread_content", jsonfied_document);

    return fetch(`/create_entreaty_thread/${parent_entreaty}/${parent_section}/`, {
        method: "POST",
        body: form
    });
}


async function get_section_threads(entreaty_id, section_id) {
    return fetch(`/entreaty_section_threads/${entreaty_id}/${section_id}/`).then((output) => output.json().//
    then(response =>
        {
            return response
        }))
};


function display_section_threads(entreaty_id, section_id, root) {
    get_section_threads(entreaty_id, section_id).then((response) => {
        let threads = response["entreaty_threads"]
        let thread_divs = [];
        for (let index = 0; index < threads.length; index++) {
            let current_thread = threads[index];
            thread_divs.push(<EntreatyThread thread_owner={current_thread[2]} key={current_thread[0]} 
            date_posted={current_thread[3]} thread_title={current_thread[1]} />)
        }

        if (root.hasOwnProperty("render") == false & root.current != undefined) {
            root.current.render(thread_divs);
            }
            else {
                root.render(thread_divs);
            }
    })
};


const SectionButton = forwardRef((props, ref) => {
return (
<div className="SpecificEntreatyOption" style={{float: "left"}} data-key={props.section_id}
onClick={() => {
    ref.current = props.section_id;
    display_section_threads(props.entreaty_id, props.section_id, props.root);
    }}>
    <span className="StandardSpan">{props.section_name}</span>
</div>
);
});

const SectionBlockLevelButton = forwardRef((props, ref) => {
return(
<div className="SpecificEntreatyOption" data-block_collection="true" data-key={props.section_id}
onClick={() => {
    ref.current = props.section_id;
    display_section_threads(props.entreaty_id, props.section_id, props.root);
    }}>
    <span className="StandardSpan" style={{}}>{props.section_name}</span>
</div>
);

});



export function SpecificEntreatyPage() {
    const navigate = useNavigate();
    const params = useParams();
    const current_section = useRef("000000000000000000000000000000000000"); // These 36 Zeroes compose the ID of the "General" thread section
    const [editorDocument, updateDocument] = useState(EmptyDocument);
    const [complete, set_complete] = useState(false);
    const {logged_in, set_logged_in} = useContext(AppContext);
    const [memberStatus, setMemberStatus] = useState(null);
    const [test, updateState] = React.useState();
    const force_update = React.useCallback(() => updateState({}), []);
    let block_root = useRef(null);
    let inline_root = useRef(null);
    let threads_container_root = useRef(null);

    useEffect(() => {
        //return () => console.log("skipping");
        const sections_container = document.getElementById("SpecificEntreatySectionCollection");
        const inline_sections_container = document.getElementById("SpecificEntreatyInlineSectionsContainer");
        block_root.current = ReactDom.createRoot(sections_container);
        inline_root.current = ReactDom.createRoot(inline_sections_container);
        let inline_collection = [];
        let block_collection = [];
        let tempMemberStatus = null;
        fetch(`/self/entreaty_admission/${params.entreaty_id}/`).then((res) => res.json().then((jsonRes) => {
            if (jsonRes.member_status == "is a member") {
                setMemberStatus(true);
                tempMemberStatus = true;
            }
            else if (jsonRes.member_status == "not a member") {
                setMemberStatus(false);
                tempMemberStatus = false;
            }
            else if (jsonRes.member_status == "you're not even logged in bro") {
                setMemberStatus(false);
                tempMemberStatus = false;
            }
            else {
                alert("error at member status check");
            }

            fetch(`/entreaty_sections/${params.entreaty_id}/`, {
                method: "GET",
                mode: "cors",
                credentials: "include",
                headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Credentials": true}
                }).then((output) => output.json().then(response => {
                    console.log(response);
                    if (response.result == "the entreaty is not open access" && tempMemberStatus != true) {
                        const threads_container = document.getElementById("SpecificEntreatyThreadsContainer");
                        threads_container_root.current = ReactDom.createRoot(threads_container);
                        threads_container_root.current.render(<div style={{color: "white"}}>
                            The entreaty is not open access; You will have to join this entreaty to view its contents. 
                            Joining entreaties requires you to be logged in. <br/> Once logged in, scroll over the "Management" button,
                            then click the "Join" button, which will have revealed itself. 
                        </div>);
                        return 0;
                    }
                    const sections = response["entreaty_sections"];
                    const block_collection_container = document.getElementById("SpecificEntreatySectionCollectionContainer");
                    for (let index=0; index < sections.length; index++) {
                        let target_section = sections[index]
                        if (index < 4) {
                            inline_collection.push(
                            <SectionButton section_name={target_section[1]} key={target_section[0]} 
                            entreaty_id={target_section[2]} section_id={target_section[0]} root={threads_container_root} 
                            ref={current_section}/>
                            )
                            }
                            else {
                            if (block_collection_container.style.display != "block") {
                                block_collection_container.style.display = "block";
                            }
                            block_collection.push(
                            <SectionBlockLevelButton section_name={target_section[1]} key={target_section[0]} 
                            entreaty_id={target_section[2]} section_id={target_section[0]} root={threads_container_root} 
                            ref={current_section}/>
                            )
                            }
                    }
                    block_root.current.render(block_collection);
                    inline_root.current.render(inline_collection);
                    }).then((result) => {
                        if (result == 0) {
                            return 0
                        };
                        const threads_container = document.getElementById("SpecificEntreatyThreadsContainer");
                        threads_container_root.current = ReactDom.createRoot(threads_container)
                        display_section_threads(params.entreaty_id, current_section.current, threads_container_root.current)
                        }));
                
        }));
        
        }, [test]);
    if (1 == 2) {
        return(
<>
<NavigationBar/>
<section id="SpecificEntreatyPageRoot">
    <div id="SpecificEntreatyNoAccessPopup">
        <span className="DescriptionSpan" style={{backgroundColor: "white"}}>
            You must be a member of this entreaty to view its content. {(logged_in == false) ? "Since you're currently \
logged out, you must first log in to attempt joining the entreaty.": "The entreaty can be joined by completeing the \
entry proccess that the entreaty owner has chosen. Their entry proccess can be found here: "}
        </span>
    </div>
</section>
</>
        );
    }
    else

    {

        return(
<>
<NavigationBar/>
<section id="SpecificEntreatyPageRoot">
{(memberStatus == true) ? 
    <section id="CreateNewSectionPopup">
        
        <div className="SpecificEntreatyOption" style={{marginLeft: "1.25%", position: "absolute"}}
        onClick={() => create_section(params.entreaty_id).then(() => {
            close_create_section();
            force_update();
            })}>
            <span className="StandardSpan">Create</span>
        </div>

        <textarea id="CreateNewSectionTextArea"></textarea>

        <div className="SpecificEntreatyOption" style={{right: "0%", marginLeft: "0%", marginRight: "1.25%", position: "absolute"}}
        onClick={() => close_create_section()}>
            <span className="StandardSpan">Cancel</span>
        </div>

    </section>
: null}
    <div id="SpecificEntreatyOptionsContainer">

        <div id="SpecificEntreatyInlineSectionsContainer"></div>
        {logged_in ?
        <div className="SpecificEntreatyOption" id="SpecificEntreatyManagementCollectionContainer">
            <span className="StandardSpan">Management</span>
            <div id="SpecificEntreatyManagementCollection" className="SpecificEntreatyOption" data-block_collection="true">
                { (memberStatus == true) ?
                <div className="SpecificEntreatyOption" data-block_collection="true" onClick={() => open_create_section()}>
                    <span className="StandardSpan" style={{}}>Create new section</span>
                </div>
                : null }
                
                {(memberStatus == true) ?
                <div className="SpecificEntreatyOption" data-block_collection="true" onClick={() => open_create_thread()}>
                    <span className="StandardSpan" style={{}}>Create new thread</span>
                </div>
                : null
                }

                {(memberStatus == false) ? 
                <div className="SpecificEntreatyOption" data-block_collection="true" 
                onClick={() => navigate(`/JoinEntreaty/${params.entreaty_id}`)}>
                    <span className="StandardSpan" style={{}}>Join</span>
                </div>
                : null}

            </div>
        </div>: null }

        <div className="SpecificEntreatyOption" id="SpecificEntreatySectionCollectionContainer">
            <span className="StandardSpan" style={{}} id="OtherSections">
                Other Sections
            </span>
            <div id="SpecificEntreatySectionCollection" data-block_collection="true" 
            style={{zIndex: "10"}}/>
        </div>

        

        
    </div>
    <div id="SpecificEntreatyThreadsHeader">
        <span className="StandardSpan">Entreaty Threads</span>
    </div>
    <section id="SpecificEntreatyThreadsContainer">
        
    </section>
</section>

{(memberStatus == true) ? 
<section id="SpecificEntreatyCreateThreadRoot">
    <div id="SpecificEntreatyCreateThreadOptions" style={{}}>

        <div className="StandardOption" style={{position: "relative", backgroundColor: "gray"}} onClick={() => close_create_thread()}>
            <span className="StandardSpan">Return</span>
        </div>

        <textarea id="SpecificEntreatyThreadTitleField"></textarea>


        <div className="StandardOption" style={{position: "relative", backgroundColor: "gray"}}  
        onClick={() => submit_entreaty_thread(editorDocument, params.entreaty_id, current_section.current).then(() => {
            close_create_thread();
            force_update();
        })}>
            <span className="StandardSpan">Submit</span>
        </div>
    </div>
    <EntreatyThreadEditor relevant_document={editorDocument} onChange={updateDocument} />
</section>
: null }
</>
        )
}
};


export default SpecificEntreatyPage;