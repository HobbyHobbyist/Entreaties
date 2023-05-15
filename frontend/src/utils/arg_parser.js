

export function arg_parser(argument_string) {  
    let refined_args = {};
    let separated_args = argument_string.split("&");
    for (let separated_arg of separated_args) {
        let halved_arg = separated_arg.split("=");
        refined_args[halved_arg[0]] = halved_arg[1];
    }
    return refined_args

};

export default arg_parser