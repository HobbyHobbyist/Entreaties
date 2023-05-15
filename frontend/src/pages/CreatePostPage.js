import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePostEditor } from "../components/Editor";
import { EmptyDocument } from "../utils/documents/Documents";
import Swah2 from "../static/images/swah2.png";
import NavigationBar from "../components/NavigationBar";
import html_parser from "../utils/html_parser";


function close_management_section() {    
    const management_section = document.getElementById("ManagementSection");
    if (management_section.dataset.lockout == "true") {
        return -1
    }
    management_section.dataset.lockout = "true";

    const details_panel = document.getElementById("DetailsPanel");
    const management_options = document.getElementById("ManagementOptions");

    management_section.style.opacity = 0;
    details_panel.style.width = "0%";
    management_options.style.height = "0vh";

    setTimeout(() => {
        management_section.style.display = "none"
        management_section.dataset.lockout = "false";
    
    }, 745);
}


function open_management_section() {
    const management_section = document.getElementById("ManagementSection");
    if (management_section.dataset.lockout == "true") {
        return -1
    }
    management_section.dataset.lockout = "true";

    const details_panel = document.getElementById("DetailsPanel");
    const management_options = document.getElementById("ManagementOptions");

    management_section.style.display = "block";
    setTimeout(() => {
        management_section.style.opacity = 1;
        details_panel.style.width = "10%";
        management_options.style.height = "10vh";
        }, 1)

    setTimeout(() => {
        management_section.style.animationName = "management_section_disperse";
        management_section.dataset.lockout = "false";

}, 745);
}



export function CreatePostPage() {
    const [editorDocument, updateDocument] = useState(EmptyDocument);
    const navigate = useNavigate();
    const [draft_ids, set_draft_ids] = useState(false);
    const [draft_selected, set_draft_selected] = useState(false);
    const selected_draft = useRef(null);
    const [must_update_editor, set_update_needed] = useState(false);

    

    async function open_existing_draft() {
        var form = new FormData;
        form.append("intent", "get_draft"); form.append("draft_id", selected_draft.id);

        return fetch('/flask/posts',
        {method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true},
        body: form}).then((response) => response.json().then(output => 
        {
        if (output["result"] != "draft not found") {
            const current_drafts_section = document.getElementById("CurrentEntreatiesSection");
            }

        console.log(output);
        console.log("draft fetched");
        return output
        
        }));
        
    
    };

    function save_draft(draft) {
        const jsonfied_document = JSON.stringify(draft);
        const title_input = document.getElementById("ProfilePostPageTitleInput");
        const draft_title = title_input.value;
        
        var form = new FormData();
              form.append("intent", "save_draft");
              form.append("draft_content", jsonfied_document); form.append("draft_id", selected_draft.id);
              form.append("draft_title", draft_title);
      
              fetch('/flask/posts',
              {method: "POST",
              credentials: "include",
              mode: "cors",
              headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                      "Access-Control-Allow-Credentials": true},
              body: form}).then((response) => response.json().then(output => 
              {
              console.log(output);
              console.log("zooped");
      
              }));
      };

    function post_draft(draft) {
        const jsonfied_document = JSON.stringify(draft);
        const title_input = document.getElementById("ProfilePostPageTitleInput");
        const draft_title = title_input.value;
        
        var form = new FormData();
            form.append("draft_content", jsonfied_document); form.append("draft_id", selected_draft.id);
            form.append("draft_title", draft_title);
    
            fetch('/self/post_management/create_post/',
            {method: "POST",
            credentials: "include",
            mode: "cors",
            headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Credentials": true},
            body: form}).then((response) => response.json().then(output => 
            {
            console.log(output);
            console.log("zooped");
            navigate("/Profile&Commands/target=posts_start")
    
            }));
    };
    

    var form = new FormData;

    useEffect(() => {
        fetch('/self/posts/drafts/',
        {method: "GET",
        credentials: "include",
        mode: "cors",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true}}).then((response) => response.json().then(output => 
        {
        if (output["result"] != "no drafts") {
            const current_drafts_section = document.getElementById("CurrentEntreatiesSection");
            }
            set_draft_ids(output["draft_id_and_title_pairs"])

        console.log(output);
        console.log("donezo");

        }));
    }, [])

    return(
<div id="ProfilePostPageRoot">
<NavigationBar/>
<section id="ManagementSection" data-lockout="false" style={{zIndex: "1"}}>
            <div id="ManagementOptions">

                <div className="EntreatyManagementOption" id="CreateNewEntreaty" data-lockout="false"
                onClick={() => {
                    close_management_section();
                    updateDocument(EmptyDocument);
                    selected_draft.id = null;
                    const title_input = document.getElementById("ProfilePostPageTitleInput");
                    title_input.value = "Unnamed Draft";
                    set_update_needed(true);
                    }}>
                    <span className="EntreatyManagementSpan">Create new</span>
                </div> 

            </div>

            <div id="DetailsPanel">
                <div style={{position: "relative", left: "2.5%", top: "2vh", width: "95%", backgroundColor: "grey"}}>
                <span></span>
                </div>
            </div>

            <section id="CurrentEntreatiesSection" style={{backgroundSize: "cover"}}>
                {draft_ids ? draft_ids.map((draft) => 
                <div key={draft[0]} className="ProfilePostDraftBox" onClick={() => {
                    selected_draft.id = draft[0];

                    const out = open_existing_draft().then((output) => {
                        const title_input = document.getElementById("ProfilePostPageTitleInput");
                        title_input.value = output["draft_title"];
                        updateDocument(JSON.parse(output["draft_content"]));
                        set_update_needed(true);
                        console.log(editorDocument);
                    });
                    close_management_section();
                    }
                }>{draft[1]}</div>) : null}
                
            </section>
</section>

<section className="ProfilePostPagePage" style={{top: "7.5vh", zIndex: 0}}>
    <div className="ProfilePostPageOption" style={{left: "1.25%", top: "15%", width: "20%"}}
    onClick={() => {
        open_management_section();
        set_update_needed(false);
    }
    }>
        <span className="ProfilePostPageSpan">Close</span>
    </div>

    <div className="ProfilePostPageOption" style={{right: "5%"}}
    onClick={() => post_draft(editorDocument)}>
        <span className="ProfilePostPageSpan">Post</span>
    </div>

    <div className="ProfilePostPageOption" style={{top: "25%", right: "1.25%", width: "20%"}}
    onClick={() => alert("does nothing yet")}>
        <span className="ProfilePostPageSpan">Discard</span>
    </div>

    <div className="" style={{position: "absolute", left: "10%", width: "50%", height: "10vh", 
    backgroundImage: "linear-gradient(rgb(125, 125, 125) 50%, rgb(75, 75, 75))", borderRadius: "1vh"}}> 
        <span className="ProfilePostPageSpan">
            <input type="text" defaultValue="Unnamed Draft" id="ProfilePostPageTitleInput"></input>
        </span>
    </div>

    <ProfilePostEditor relevant_document={editorDocument} onChange={updateDocument} document_save={save_draft} 
    must_update_editor={must_update_editor}></ProfilePostEditor>
</section>

</div>
    )
}

export default CreatePostPage;