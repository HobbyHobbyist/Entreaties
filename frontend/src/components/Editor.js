import { Editable, Slate, withReact } from "slate-react";

import { createEditor, Transforms, Editor } from "slate";
import { useMemo,useCallback, useEffect } from "react";
  
import useEditorConfig from "./useEditorConfig.js";
import useSelection from "./useSelection.js";
import {EntreatyCreationToolbar, ProfileToolbar, ProfilePostToolbar, CommentToolbar, EntreatyThreadToolbar} from "./Toolbar.js";


export function ProfileEditorExample({ relevant_document, onChange}) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const { renderElement, renderLeaf } = useEditorConfig(editor);

  const [selection, setSelection] = useSelection(editor);
  const onChangeHandler = useCallback(
    (document) => {
      onChange(document);
      setSelection(editor.selection);
    },
    [editor.selection, onChange, setSelection]
  );


  return (
    <div>
      <ProfileToolbar selection={selection} editor={editor} relevant_document={relevant_document}/>
      <div id="ProfileDescriptionBox">
        <Slate editor={editor} value={relevant_document} onChange={onChangeHandler}>
          <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
        </Slate>
      </div>
    </div>
  );
}



function ReceptiveEditor({ relevant_document, onChange, description_box, document_save, ToolbarComponent, must_update_editor,
                          document_submit, display="block"}) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const { renderElement, renderLeaf } = useEditorConfig(editor);

  const [selection, setSelection] = useSelection(editor);
  const onChangeHandler = useCallback(
    (document) => {
      onChange(document);
      setSelection(editor.selection);
    },
    [editor.selection, onChange, setSelection]
  );

  useEffect(() => {
    // Get initial total nodes to prevent deleting affecting the loop
  let totalNodes = editor.children.length;

  // No saved content, don't delete anything to prevent errors
  if (relevant_document.length <= 0) return;

  // Remove every node except the last one
  // Otherwise SlateJS will return error as there's no content
  for (let i = 0; i < totalNodes - 1; i++) {
      console.log(i)
      Transforms.removeNodes(editor, {
          at: [totalNodes-i-1],
      });
  }

  // Add content to SlateJS
  for (const value of relevant_document ) {
      Transforms.insertNodes(editor, value, {
          at: [editor.children.length],
      });
  }

  // Remove the last node that was leftover from before
  Transforms.removeNodes(editor, {
      at: [0],
  });
  }, [must_update_editor]);

  return (
<div id="Editor" style={{display: display}}>
  <ToolbarComponent selection={selection} editor={editor} relevant_document={relevant_document} document_save={document_save} 
  document_submit={document_submit} />
  
  <div id={description_box} onClick={(e) => {
    console.log(e.currentTarget.children[0]);
    e.currentTarget.children[0].focus();
    
  }}>
    <Slate editor={editor} value={relevant_document} onChange={onChangeHandler}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  </div>
</div>
  );
};


export function EntreatyCreationEditor({relevant_document, onChange}) {
  return (
<ReceptiveEditor relevant_document={relevant_document} onChange={onChange} description_box="EntreatyCreationDescriptionBox"
ToolbarComponent={EntreatyCreationToolbar}></ReceptiveEditor>
  )
};


export function EntreatyThreadEditor({relevant_document, onChange, document_save, must_update_editor, document_submit}) {
  return (
<ReceptiveEditor relevant_document={relevant_document} onChange={onChange} description_box="EntreatyThreadDescriptionBox"
document_submit={document_submit} must_update_editor={must_update_editor} ToolbarComponent={EntreatyThreadToolbar} />
  )
};


export function ProfileEditor({relevant_document, onChange}) {
  return (
<ReceptiveEditor relevant_document={relevant_document} onChange={onChange} description_box="ProfileDescriptionBox"
ToolbarComponent={ProfileToolbar}></ReceptiveEditor>
  )
};


export function ProfilePostEditor({relevant_document, onChange, document_save, must_update_editor}) {
  return (
<ReceptiveEditor relevant_document={relevant_document} onChange={onChange} description_box="ProfilePostDescriptionBox"
document_save={document_save} must_update_editor={must_update_editor} ToolbarComponent={ProfilePostToolbar}></ReceptiveEditor>
  )
};


export function CommentEditor({relevant_document, onChange, document_save, must_update_editor, document_submit}) {
  return (
<ReceptiveEditor relevant_document={relevant_document} onChange={onChange} description_box="CommentDescriptionBox"
document_submit={document_submit} must_update_editor={must_update_editor} ToolbarComponent={CommentToolbar}
display="none"></ReceptiveEditor>
  )
};



