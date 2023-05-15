import { useEffect, useRef } from "react";
import * as ReactDom from "react-dom/client";
import { useNavigate } from "react-router-dom";
import SettingOption from "./SettingOption";


export function TagAdder({tags, cancel_function, cancel_button, save_and_exit_function, save_and_exit_text, id,
                        text_input_field}) {
    const tags_container = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        const root = document.getElementById("TagsContainer");
        tags_container.current = ReactDom.createRoot(root);
        tags_container.current.render(
tags.map((tag) =>          
<SettingOption setting_name={tag[0]} default_status={tag[1]}  id={tag[2]} key={tag[2]}/>
        
    )
        )
    }, []);
    return (
<div id={id ? id: "GenericPageRoot"}>
    <section id="CustomOptionsContainer">
        {(cancel_button != false) ?
        <div className="StandardOption" onClick={() => {
            let cancel_func = cancel_function();
            if (cancel_func.callback) {
                switch (cancel_func.callback) {
                    case "trigger navigate":
                        navigate("/Profile");
                        break;
                }

            }
        }}>
            <span className="StandardSpan">Cancel</span>
        </div>
        : null}

        <div className="StandardOption" onClick={() => {
            let save_and_exit_func = save_and_exit_function();
            if (save_and_exit_func.callback) {
                switch (save_and_exit_func.callback) {
                    case "trigger navigate":
                        navigate("/Profile");
                        break;
                }

            }
        }}>
            <span className="StandardSpan">{save_and_exit_text ? save_and_exit_text : "Save & Exit"}</span>
        </div>

        {text_input_field ? <input type="text" id="CustomTagTextField">

        </input>
        : null}
    </section>
    <section id="TagsContainer"></section>
</div>
)
}

export default TagAdder