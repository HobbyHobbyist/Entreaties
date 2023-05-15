import { Editor } from "slate";

export function getActiveStyles(editor) {
  const target = new Set(Object.keys(Editor.marks(editor) ?? {})); // Consecutive selections of the same selection do not invert marks
   // as intended. "Editor.activeMarks" would solve this, but Slate-React seems to lack the function. The issue occurs because editor.marks
   // returns true if any of the surveyed text has a mark (as in, editor.marks is an "if-any function") whereas editor.activeMarks
   // only returns true if all the surveyed text shares said mark.

  return target
}

export function toggle_style(editor, style) {
  const activeStyles = getActiveStyles(editor);
  if (activeStyles.has(style)) {
    Editor.removeMark(editor, style);
    alert("success")

      } 
      else 
      {
      Editor.addMark(editor, style, true);
      alert("failure")
    }

 };

 export function remove_style(editor, style) {
  Editor.removeMark(editor, style);
 }

export function toggleAttribute(editor, attribute, attribute_value) {
  const activeStyles = getActiveStyles(editor);
  
  if (activeStyles.has(attribute)) {
    Editor.removeMark(editor, attribute);
    } else {
    Editor.addMark(editor, attribute, attribute_value);
    }
};