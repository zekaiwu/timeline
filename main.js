let filename = "example.json";
var xmlhttp = new XMLHttpRequest();
let requestNum=0;
let myObj;
let items = [];
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      
      if(requestNum<1){//
        myObj = JSON.parse(this.responseText);
      }
      document.getElementById("name").innerHTML = myObj.name;
      document.getElementById("id").innerHTML = myObj.id;
      document.getElementById("version").innerHTML = myObj.version;
      document.getElementById("modified_date").innerHTML = myObj.modified_date;
      document.getElementById("uuid").innerHTML = myObj.uuid;
      document.getElementById("remarks").innerHTML = myObj.remarks;
      //show actions in timeline
      if(requestNum<1){
        showTimeLine();
        requestNum+=1;
      }
      //change other information
      document.getElementById("nameButton").onclick = async function() {
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
      document.getElementById("versionButton").onclick = async function() {
        const {
          value: version
        } = await Swal.fire({
          input: 'text',
          inputPlaceholder: 'Enter the version'
        })

        if (version) {
          myObj.version = version;
          document.getElementById("version").innerHTML = myObj.version;
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
      document.getElementById("saveButton").onclick = function() {
        
        var data = new FormData();
        data.append('filename', "example.json");
        data.append('name', myObj.name);
        data.append('id', myObj.id);
        data.append('version',myObj.version);

        let currentTime = new Date();
        data.append('modified_date',currentTime.toString());
        data.append('uuid',myObj.uuid);
        data.append('remarks',myObj.remarks);
        for(let i=0;i < myObj.actions.length;i++){
          data.append('actions',myObj.actions[i].command);
          data.append('actions',myObj.actions[i].time);
        }
        xmlhttp.open("POST", "example.json", true);
        xmlhttp.send(data);
      };
      document.getElementById("newButton").onclick = function() {
        
        redraw();
      };
    }
    };
  xmlhttp.open("GET", filename, true);
  xmlhttp.send();

  //function to show timeline
  function showTimeLine() {
      // DOM element where the Timeline will be attached
      var container = document.getElementById('visualization');
      let startTime = new Date(2020, 0, 1, 0, 0, 0);
      let endTime = new Date(2020, 0, 1, 0, 5, 0);
      let length = 5000;
      for (let i = 0; i < myObj.actions.length; i++) {
        let tempTime = myObj.actions[i].time;
        items[i] = {
          id: i,
          content: myObj.actions[i].command,
          start: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000),
          end: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000 + length),
          length: length,
        };
        myObj.actions[i] = {
          id : i,
          command : items[i].content,
          time : tempTime,
        }
      }
      // Create a DataSet (allows two way data-binding)
    
    
      // Configuration for the Timeline
      var options = {
        timeAxis: {
          scale: 'second',
          step: 5
        },
        horizontalScroll: true,
        zoomKey: 'ctrlKey',
        min: startTime,
        max: endTime,
        start: startTime,
        end: endTime,
        height: '500px',
        editable: true,
        itemsAlwaysDraggable: {
          item: true,
        },
        format: {
          minorLabels: {
            millisecond: '',
            second: 'ss',
            minute: '',
            hour: '',
            weekday: '',
            day: '',
            week: '',
            month: '',
            year: ''
          },
          majorLabels: {
            millisecond: 'HH:mm:ss',
            second: 'mm:ss',
            minute: 'mm:ss',
            hour: 'mm:ss',
            weekday: '',
            day: '',
            week: '',
            month: '',
            year: ''
          }
        },
        onAdd: function(item, callback) {
          prettyPrompt('Add item', 'Enter text content for new item:', item.content, function(value) {
            if (value){
              //function to generate the id of items
              let tempID;
              for (let i = 0; i <= myObj.actions[i];i++){
                let occupied = false;
                for(let j=0; j<myObj.actions[j];j++){
                  if(myObj.actions[j].id == i){
                    occupied = true;
                    break;
                  }
                if (occupied == false){
                tempID = i;
                break;
                } 
                }
              }

              //set up items to add
              item.id = tempID;
              item.content = value[0] + ' ' + value[1];
              item.start = new Date().setTime(startTime.getTime() + value[2] * 1000);
              item.length = length;
              item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + length);
              let action = {
                command : item.content,
                time : value[2],
                id : tempID,
              };
              myObj.actions.push(action);
              callback(item); // send back adjusted new item
            } else {
              callback(null); // cancel item creation
            }
          });
        },
    
        onUpdate: function(item, callback) {
          prettyPrompt('Update item', 'Edit items text:', item.content, function(value) {
            if (value) {
              item.content = value[0] + ' ' + value[1];
              item.start = new Date().setTime(startTime.getTime() + value[2] * 1000);
              item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + length);

              //update myObj.actions
              for (let i=0;i<myObj.actions.length;i++){
                if (item.id == myObj.actions[i].id){
                  myObj.actions[i].time = value[2];
                  myObj.actions[i].command = value[0] + ' ' + value[1];
                  break;
                }
              }

              callback(item); // send back adjusted item
            } else {
              callback(null); // cancel updating the item
            }
          });
        },
    
        onRemove: function(item, callback) {
          prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function(ok) {
            if (ok) {
              
              //remove the action in myObj.actions
              for (let i=0;i<myObj.actions.length;i++){
                if (item.id == myObj.actions[i].id){
                  delete myObj.actions[i];
                  break;
                }
              }

              callback(item); // confirm deletion
            } else {
              callback(null); // cancel deletion
            }
          });
        },
        onMoving: function(item, callback) {
          if ((item.end - item.start) != item.length) {
            if (item.start + item.length - endTime >= 0) {
              item.start = endTime - item.length;
              item.end = endTime;
            } else {
              item.end.setTime(item.start.getTime() + item.length);
            }
          }
          if (item.start < startTime) {
            item.start = startTime;
            item.end.setTime(item.start.getTime() + item.length);
          }
          if (item.end > endTime) {
            item.end = endTime;
            item.start.setTime(item.end.getTime() - item.length);
          }

          //set time in actions
          for (let i=0;i<myObj.actions.length;i++){
            if (item.id == myObj.actions[i].id){
              myObj.actions[i].time = (item.start.getTime()-startTime.getTime())/1000;
              break;
            }
          }

          callback(item); // send back the (possibly) changed item
          document.getElementById('change').innerHTML = item.start.getMinutes()+":"+item.start.getSeconds();
        },
    
    
    
      };
    
      // Create a Timeline
      var timeline = new vis.Timeline(container, items, options);
      async function prettyPrompt(title, text, inputValue, callback) {
        const {
          value: formValues
        } = await Swal.fire({
          title: 'Multiple inputs',
          html: 'function' +
            '<select id="swal-input1" class="swal2-input" list="swal-input1" name="swal-input1">' +
            '<option value="WORKTEMP">WORKTEMP</option>' +
            '<option value="POURBOX">POURBOX</option>' +
            '</select>' +
            'parameter<input id="swal-input2" class="swal2-input">' +
            'time<input id="swal-input3" class="swal2-input">',
          focusConfirm: false,
          preConfirm: () => {
            return [
              document.getElementById('swal-input1').value,
              document.getElementById('swal-input2').value,
              document.getElementById('swal-input3').value,
            ]
          }
        })
        if (formValues) {
          callback(formValues);
        }
      }
    
      function prettyConfirm(title, text, callback) {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            callback(1);//callback true
          }
        })
      }
    }
  