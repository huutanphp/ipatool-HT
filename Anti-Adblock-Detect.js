// ==UserScript==
// @name         Anti Adblock Detect
// @namespace    github.com
// @version      1.2
// @description  Unlock all Fireship PRO courses/lessons.
// @author       huutan
// @match        https://traffic1s.com/*
// @icon         https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/325/fire_1f525.png
// @require  https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

waitForKeyElements ("[id$='ignielAdBlock']", killNode);

function killNode (jNode) {
    jNode.remove ();
}
