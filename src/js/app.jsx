import React from "react";
import ReactDom from "react-dom";

import HelloBox from "./modules/hellobox.jsx";
console.log("hello world");

function startApp() {
    ReactDom.render(<HelloBox />, document.getElementById("main"));

}

export default startApp;
