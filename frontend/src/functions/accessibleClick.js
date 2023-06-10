function accessibleClick(e, stopPropagation=false) {
    if (stopPropagation != false) {
        e.stopPropagation();
    }
    if (e.key == "Enter") {
        e.currentTarget.click();
    }
}

export default accessibleClick