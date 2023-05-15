
export function html_parser(post_content, uuid) {
    var converted_html = [];
    for (let line_index = 0; line_index < post_content.length; line_index++) {
        var target = post_content[line_index];
        var target_len = target["children"].length;
        console.log(target);

        for (let child_index = 0; child_index < target_len; child_index++) {
            var styling = {}

            var typing = target["type"];
            var traits = target["children"][child_index];
            var text = traits["text"];
            var traits = Object.keys(traits);
            var linked = false;
            let url = null;
            traits.forEach(trait => {
                if (trait == "Bold") {
                    styling.fontWeight = "bold";}

                else if (trait == "Italic") {
                    styling.fontStyle = "italic";}

                else if (trait == "Underline") {
                    styling.textDecoration = "underline"}

                else if (trait == "Link") {
                    linked = true;
                    url = target["children"][child_index]["Link"]}

                
                else if (trait === "Size") {
                    styling.fontSize = "50px";
                }
                
                
            });
            //alert(Object.keys(styling))
            if (linked == true){
                var html_element = //
                <span style={{color: "blue", cursor: "pointer", fontWeight: "bolder", textDecoration: "wavy overline",
                textDecorationColor: "var(--emphasizedComplimentaryCol)", ...styling}} 
                key={uuid + line_index + child_index} onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(url, "_blank");
                }}>
                    {text}
                </span>;
            }
            else{
                var html_element = <span style={styling} key={uuid + line_index + child_index}>{text}</span>
            }
            converted_html.push(html_element);  
        }
        converted_html.push(<br key={uuid + line_index + "end"}></br>)
    };
    return converted_html;
};

export default html_parser;