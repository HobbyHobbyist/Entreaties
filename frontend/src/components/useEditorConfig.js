import { DefaultElement } from "slate-react";
import { toggleStyle } from "../utils/EditorUtils";

export default function useEditorConfig(editor) {
  return { renderElement, renderLeaf  };
}

function renderElement(props) {
  const { element, children, attributes } = props;
  switch (element.type) {
    case "H1":
      return <h1 {...attributes}>{children}</h1>;
    case "H2":
      return <h2 {...attributes}>{children}</h2>;
    case "H3":
      return <h3 {...attributes}>{children}</h3>;

    default:
      // For the default case, we delegate to Slate's default rendering. 
      return <DefaultElement {...props} />;
  }
};

function renderLeaf({ attributes, children, leaf}) {
    let el = <>{children}</>;
    let colored = false;
    let bold = false;
    let highlighted = false;
    let image = false;
    let size = false;
  
    if (leaf.Code) {
      el = <code>{el}</code>;
    }
  
    if (leaf.Italic) {
      el = <em>{el}</em>;
    }
  
    if (leaf.Underline) {
      el = <u>{el}</u>;
    }

    if (leaf.H1) {
      el = <h1>{el}</h1>;
    }

    if (leaf.H2) {
      el = <h2>{el}</h2>;
    }

    if (leaf.H3) {
      el = <h3>{el}</h3>
    }
    
    if (leaf.hasOwnProperty("Bold") & leaf.Bold) {
      bold = true;
    }

    if (leaf.hasOwnProperty("color")) {
      colored = true;
    }

    if (leaf.hasOwnProperty("Size")) {
      size = true;
    }

    if (leaf.hasOwnProperty("Link")) {
      el = <a href={leaf.Link} target="_blank" rel="noopener noreferrer">{el}</a>;
      
    }

    if (leaf.hasOwnProperty("Image")) {
      ;
    }

    if (leaf.hasOwnProperty("highlight")) {
      highlighted = true;
    }
  
    return <span {...attributes} style={{color: colored ? leaf.color: "black", fontWeight: bold ? "bold": "normal",
           boxShadow: highlighted ? "inset 0vw 3vh 0 0 " + leaf.highlight: "none", fontSize: size ? leaf.Size: "inherit"}}>
            {el}
          </span>;
};