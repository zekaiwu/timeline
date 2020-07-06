//get file
import {showTimeLine} from '/timeline.js';
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let myObj = JSON.parse(this.responseText);
    document.getElementById("name").innerHTML = myObj.name;
    document.getElementById("id").innerHTML = myObj.id;
    document.getElementById("version").innerHTML = myObj.version;
    document.getElementById("modified_date").innerHTML = myObj.modified_date;
    document.getElementById("uuid").innerHTML = myObj.uuid;
    document.getElementById("remarks").innerHTML = myObj.remarks;
    showTimeLine(myObj);
  }
};
xmlhttp.open("GET", "example.json", true);
xmlhttp.send();
