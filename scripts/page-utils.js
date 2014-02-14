var NUM_POSTS = 5;
var text = "";
var rest = "";
var span;
var p;
function git_comments () {
    (function() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                response = JSON.parse(xmlhttp.responseText);
                text = "Updates:<br>";
                for (var i = 0; i < response.length; i++) {
                    var commit = response[i];
                    var author_link = "<a href=" + commit['author']['html_url'] + ">" + commit['committer']['login'] + "</a>";
                    var message = commit['commit']['message']
                    var date = new Date(commit['commit']['committer']['date']);
                    var month = date.getMonth() + 1 + ""; 
                    var day = date.getDay() + 1 + ""; 
                    var year = date.getFullYear().toString().substring(2); 
                    var hours = date.getHours() + "";
                    var minutes = date.getMinutes() + "";
                    if (i < NUM_POSTS) {
                        text += month + "/" + day + "/" + year + " " + hours + ":" + minutes + " " + author_link + ":<br>" + message + "<br><br>";
                    } else {
                        rest += month + "/" + day + "/" + year + " " + hours + ":" + minutes + " " + author_link + ":<br>" + message + "<br><br>";
                    }
                 }
            }
            p = document.getElementById("git-commits");
            p.innerHTML = text + "<span id=\"expand\" onclick=\"more()\">...</span>";
        }
        
        xmlhttp.open("GET", "https://api.github.com/repos/cdosborn/superrun/commits", true);
        xmlhttp.send();
    })();
}

function more() {
    p.innerHTML = text + rest;
};

var google_analytics = function () {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga'); 
    ga('create', 'UA-41300363-2', 'cdosborn.github.io'); 
    ga('send', 'pageview');
};
