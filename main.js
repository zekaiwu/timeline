//get file

import {
  showTimeLine
} from '/timeline.js';

let filename = "example.json";
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
      //show actions in timeline
      showTimeLine(myObj);
      //change other information
      document.getElementById("nameBotton").onclick = async function() {
        const {
          value: name
        } = await Swal.fire({
          input: 'text',
          inputPlaceholder: 'Enter the name'
        })

        if (name) {
          myObj.name = name;
          document.getElementById("name").innerHTML = myObj.name;
        }

      };
      document.getElementById("remarksBotton").onclick = async function() {
        const {
          value: text
        } = await Swal.fire({
          input: 'textarea',
          inputPlaceholder: 'Type your message here...',
          inputAttributes: {
            'aria-label': 'Type your message here'
          },
          showCancelButton: true
        })

        if (text) {
          Swal.fire(text);
          myObj.remarks = text;
          document.getElementById("remarks").innerHTML = myObj.remarks;
        }

      };
    }
    };
    xmlhttp.open("GET", filename, true);
    xmlhttp.send();