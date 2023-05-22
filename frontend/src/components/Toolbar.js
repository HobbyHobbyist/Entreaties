import { getActiveStyles, toggleAttribute, toggle_style, remove_style } from "../utils/EditorUtils";
import {useSlateStatic} from "slate-react";
import { useEffect } from "react";


const PARAGRAPH_STYLES = ["H1", "H2", "H3"];
const CHARACTER_STYLES = ["Bold", "Italic", "Underline", "Size"];

function open_hyperlink_creation() {
  const url_input_collection = document.getElementById("HyperlinkCollection");
  const toolbar_option_containter = document.getElementById("EntreatyCreationToolbarOptionContainer");
  const url_bar = document.getElementById("HyperlinkInputField");

  toolbar_option_containter.style.display = "none";
  url_input_collection.style.display = "block";
  url_bar.focus();
};

function create_hyperlink(editor) {
  const url_input_collection = document.getElementById("HyperlinkCollection");
  const toolbar_option_containter = document.getElementById("EntreatyCreationToolbarOptionContainer");
  const interval_holder = document.getElementById("HyperlinkCollection");
  let link_url = document.getElementById("HyperlinkInputField").value;

  if (link_url.match("https://") == null) {
    link_url = "//" + document.getElementById("HyperlinkInputField").value;
    }


  clearInterval(interval_holder.dataset.interval);
  toggleAttribute(editor, "Link", link_url);
  toggleAttribute(editor, "highlight", "inherit");

  url_input_collection.style.display = "none";
  toolbar_option_containter.style.display = "block";
  
};

function close_hyperlink_creation(editor) {
  const url_input_collection = document.getElementById("HyperlinkCollection");
  const toolbar_option_containter = document.getElementById("EntreatyCreationToolbarOptionContainer");
  const interval_holder = document.getElementById("HyperlinkCollection");

  clearInterval(interval_holder.dataset.interval);
  toggleAttribute(editor, "highlight", "inherit")

  url_input_collection.style.display = "none";
  toolbar_option_containter.style.display = "block";
};

function open_image_append() {
    const url_input_collection = document.getElementById("ImageCollection");
    const toolbar_option_containter = document.getElementById("EntreatyCreationToolbarOptionContainer");
    const url_bar = document.getElementById("ImageInputField");
  
    toolbar_option_containter.style.display = "none";
    url_input_collection.style.display = "block";
    url_bar.focus();
};

function append_image(editor) {
  toggleAttribute(editor, "Image", "boop");
};

function close_image_append(editor) {
  const url_input_collection = document.getElementById("ImageCollection");
  const toolbar_option_containter = document.getElementById("EntreatyCreationToolbarOptionContainer");

  url_input_collection.style.display = "none";
  toolbar_option_containter.style.display = "block";
};


function save_biography_document(bio_doc) {
  const jsonfied_document = JSON.stringify(bio_doc);
  alert(jsonfied_document);
  
  var form = new FormData();
        form.append("biography", jsonfied_document);

        fetch("/flask/self/update_profiling/biography/",
        {method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {'Accept': 'application/json', 'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Credentials": true},
        body: form}).then((response) => response.json().then(output => 
        {
        console.log(output);
        console.log("donezo");

        }));
};


function reveal_paragraph_options(e) {
  const paragraph_button = e.currentTarget;
  const styles = document.getElementsByClassName("ToolbarSmallOption");
  if (paragraph_button.dataset.showing_paragraph_styles == "true") {
    var reveal_paragraph_styles = "false";
    var hide_other_styles = "false";
    paragraph_button.dataset.showing_paragraph_styles = "false";
    paragraph_button.firstChild.innerText = "Paragraph";

  }
  else {
    var reveal_paragraph_styles = "true";
    var hide_other_styles = "true";
    paragraph_button.dataset.showing_paragraph_styles = "true";
    paragraph_button.firstChild.innerText = "Default";

  }

  for (let index = 0; index < styles.length; index++ ) {
    if (styles[index].dataset.paragraph_style == "true") {
      styles[index].dataset.revealed = reveal_paragraph_styles;
    }
    else {
      styles[index].dataset.hidden = hide_other_styles;
    }
  }

};




function ToolBarButton(props) {
  const { icon, is_active, block_type, chosen_class, paragraph_style, ...otherProps } = props;
  return (
    <div
      variant="outline-primary"
      className={chosen_class}
      active={is_active.toString()}
      data-paragraph_style={paragraph_style}
      {...otherProps}>
        {block_type}
    </div>
  );
}



function ReceptiveToolbar({toolbar_type, dropdown_option_container, option_container, selection, previous_selection, 
  editor, relevant_document, document_save, document_submit, submit_only=null}) {
  let want_large_scope = false;
  useEffect(() => {
    const create_link_button = document.getElementById("HyperlinkSubmitButton");
    const hyperlink_input_field = document.getElementById("HyperlinkInputField");
        hyperlink_input_field.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                create_link_button.click();
            }
            })
  }, [])

  return (
    <div id={toolbar_type}>
      {/* Dropdown for paragraph styles */}
      
      <section id={option_container} disabled="false">

        {submit_only ? 
        <div className="ToolbarOption" onClick={() => document_submit(relevant_document)}>Submit</div>:
        <div className="ToolbarOption" onClick={() => document_save(relevant_document)}>
          <span className="ToolbarOptionSpan">Save</span>
        </div>
        }
        
          <div className="ToolbarOption" data-dropdown="true" eventkey={"h"} key={"h2"} onClick={reveal_paragraph_options}>
            <span className="ToolbarOptionSpan">Paragraph</span>
          </div>

          <ToolBarButton key={"Negate"} is_active="Never" chosen_class="ToolbarSmallOption" 
          block_type={<span className="ToolbarOptionSpan">⦸</span>} 
          paragraph_style="true" onMouseDown={(event) => {
            event.preventDefault();
            ["H1", "H2", "H3"].map((style) => {
              remove_style(editor, style);
              
            })
              
          }}/>

         {PARAGRAPH_STYLES.map((style) => (
            <ToolBarButton key={style} is_active={getActiveStyles(editor).has(style).toString()} chosen_class="ToolbarSmallOption" 
            block_type={<span className="ToolbarOptionSpan">{style}</span>} 
            paragraph_style="true" onMouseDown={(event) => {
              event.preventDefault();
              toggle_style(editor, style);
            }} />
          ))}
        
        
          <ToolBarButton key={"Bold"} is_active={getActiveStyles(editor).has("Bold").toString()} onMouseDown={(event) => {
              event.preventDefault();
              toggle_style(editor, "Bold");
          }} active="false" chosen_class="ToolbarSmallOption" block_type={<span className="ToolbarOptionSpan"
           style={{fontWeight: "bold"}}>B</span>}/>

          <ToolBarButton key={"Italic"} is_active={getActiveStyles(editor).has("Italic").toString()} onMouseDown={(event) => {
              event.preventDefault();
              toggle_style(editor, "Italic");
          }} active="false" chosen_class="ToolbarSmallOption" block_type={<span className="ToolbarOptionSpan"
           style={{fontStyle: "italic"}}>i</span>}/>

          <ToolBarButton key={"Underline"} is_active={getActiveStyles(editor).has("Underline").toString()} onMouseDown={(event) => {
              event.preventDefault();
              toggle_style(editor, "Underline");
          }} active="false" chosen_class="ToolbarSmallOption" block_type={<span className="ToolbarOptionSpan"
           style={{textDecoration: "underline"}}>U</span>}/>

          <ToolBarButton key={"Size"} is_active={getActiveStyles(editor).has("Size").toString()} onMouseDown={(event) => {
              event.preventDefault();
              toggleAttribute(editor, "Size", "50px");
          }} active="false" chosen_class="ToolbarSmallOption" block_type={<span className="ToolbarOptionSpan"
           style={{textDecoration: "wavy overline blue"}}>S</span>}/>
        
        

      <div className="ToolbarSmallOption" key="Link" is_active={getActiveStyles(editor).has("Link").toString()} 
      data-animation_state="0"
        onMouseDown={ (event) =>{
        event.preventDefault();
        open_hyperlink_creation();
        const interval_holder = document.getElementById("HyperlinkCollection");
        const animation_state_holder = event.target;

        toggleAttribute(editor, "highlight", "rgba(0, 0, 250, .25)");
        interval_holder.dataset.interval = setInterval(() => {
          if (animation_state_holder.dataset.animation_state === "0") {
            toggleAttribute(editor, "highlight", "rgba(0, 0, 250, .25)");
            animation_state_holder.dataset.animation_state = "1";
            }
            else {
            toggleAttribute(editor, "highlight", "rgba(0, 0, 250, .25)");
            animation_state_holder.dataset.animation_state = "0";
            }


          
        }, 1000)

        }} active="false" chosen_class="ToolbarOption" block_type={"Link"}>
            <span className="ToolbarOptionSpan">🔗</span>
          </div>

    {(want_large_scope) ? 
    <div className="ToolbarSmallOption" key="Image" is_active={getActiveStyles(editor).has("Link").toString()} 
      data-animation_state="0"
        onMouseDown={ (event) =>{
        event.preventDefault();
        open_image_append();


        }} active="false" chosen_class="ToolbarOption" block_type={"Link"}>
            <span className="ToolbarOptionSpan">🖼️</span>
          </div>
      :null}

      </section>
      
      <section className="ToolbarUrlInputCollection" data-interval={undefined} id="HyperlinkCollection">
        <input type="text" className="ToolbarUrlInputField" id="HyperlinkInputField"></input>
        <div className="ToolbarUrlCloseOption" onClick={() => close_hyperlink_creation(editor)}>
          <span className="EntreatyManagementSpan">Close</span>
          </div>
        <div className="ToolbarSubmitUrlButton" id="HyperlinkSubmitButton" onClick={() => create_hyperlink(editor)}>
          <span className="EntreatyManagementSpan">Add Link </span>
        </div>
      </section>

      <section className="ToolbarUrlInputCollection" data-interval={undefined} id="ImageCollection">
        <input type="text" className="ToolbarUrlInputField" id="ImageInputField"></input>
        <div className="ToolbarUrlCloseOption" onClick={() => close_image_append()}>
          <span className="EntreatyManagementSpan">Close</span>
          </div>
        <div className="ToolbarSubmitUrlButton" id="ImageSubmitButton" onClick={() => append_image(editor)}>
          <span className="EntreatyManagementSpan" style={{bottom: "0%"}}>Add Image Link</span>
        </div>
      </section>

    </div>
  );
};



export function EntreatyCreationToolbar({editor, relevant_document, selection, previous_selection}) {
  return (
    <ReceptiveToolbar toolbar_type="EntreatyCreationToolbar" option_container="EntreatyCreationToolbarOptionContainer"
    document_save={save_biography_document} editor={editor} relevant_document={relevant_document}
    selection={selection} previous_selection={previous_selection}></ReceptiveToolbar>
  )
}

export function EntreatyThreadToolbar({editor, relevant_document, selection, previous_selection}) {
  return (
    <ReceptiveToolbar toolbar_type="EntreatyThreadToolbar" option_container="EntreatyCreationToolbarOptionContainer"
    document_save={save_biography_document} editor={editor} relevant_document={relevant_document}
    selection={selection} previous_selection={previous_selection}></ReceptiveToolbar>
  )
}

export function ProfilePostToolbar({editor, relevant_document, document_save, selection, previous_selection}) {
  return (
    <ReceptiveToolbar toolbar_type="ProfilePostToolbar" option_container="EntreatyCreationToolbarOptionContainer"
    document_save={document_save} editor={editor} relevant_document={relevant_document}
    selection={selection} previous_selection={previous_selection}></ReceptiveToolbar>
  )
}

export function ProfileToolbar({editor, relevant_document, selection, previous_selection}) {
  return (
    <ReceptiveToolbar toolbar_type="ProfileToolbar" option_container="EntreatyCreationToolbarOptionContainer"
    document_save={save_biography_document} editor={editor} relevant_document={relevant_document}
    selection={selection} previous_selection={previous_selection}></ReceptiveToolbar>
  )
}


export function CommentToolbar({editor, relevant_document, document_save, selection, previous_selection, document_submit}) {
  return (
    <ReceptiveToolbar toolbar_type="CommentToolbar" option_container="EntreatyCreationToolbarOptionContainer"
    document_submit={document_submit} editor={editor} relevant_document={relevant_document}
    selection={selection} previous_selection={previous_selection} submit_only={true}></ReceptiveToolbar>
  )
}

