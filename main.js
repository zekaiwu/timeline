let command_dict = new Map([
  ['WOKOIL', '起鑊'],
  ['LOADBOX', '取盒'],
  ['LOADBOXF', '取盒'],
  ['POURBOX', '倒盒'],
  ['POURBOXF', '倒盒'],
  ['PSDS', new Map([['0', '假的'], ['1', '下糖'], ['2', '下鹽'], ['3', '胡椒'], ['4', '自定調料']])],
  ['PLQS', new Map([['0', '假的'], ['1', '加水'], ['2', '下油'], ['3', '3號泵噴出'], ['4', '4號泵噴出'], ['5', '5號泵噴出'],
  ['6', '芡汁'], ['7', '7號泵噴出'], ['8', '8號泵噴出']])],
  ['WOKTEMP', '設置溫度'],
  ['WAIT', '翻炒'],
  ['POURFOOD', '上菜'],
  ['WOKCLEAN', '洗鍋'],
  ['WOKY', '設置轉速'],
  ['END', '完成'],
  ['INIT', '初始化'],
]);
let time_dict = new Map([
  ['WOKOIL', 1189],
  ['LOADBOX', 6907],
  ['LOADBOXF', 6907],
  ['POURBOX', 4000],
  ['POURBOXF', 4000],
  ['PSDS', 8628],
  ['PLQS', 3025],
  ['WOKTEMP', 1],
  ['POURFOOD', 8053],
  ['WOKCLEAN', 14082],
  ['WOKY', 1],
  ['END', 1],
  ['INIT', 50026],
  ['START', 1],
  ['WAIT', 1]
]);
let filename = "example.json";
var xmlhttp = new XMLHttpRequest();
document.getElementById("openButton").onclick = function () {
  location.reload();
};
main();
function main() {
  let requestNum = 0;
  let myObj;
  let items = [];
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      if (requestNum < 1) {//when receive 1st request
        myObj = JSON.parse(this.responseText);
      }
      document.getElementById("name").innerHTML = myObj.name;
      document.getElementById("id").innerHTML = myObj.id;
      document.getElementById("version").innerHTML = myObj.version;
      document.getElementById("modified_date").innerHTML = myObj.modified_date;
      document.getElementById("uuid").innerHTML = myObj.uuid;
      document.getElementById("remarks").innerHTML = myObj.remarks;
      //show actions in timeline
      if (requestNum < 1) {
        showTimeLine();
        requestNum += 1;
      }

      //change other information when click the botton
      document.getElementById("nameButton").onclick = async function () {
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
      document.getElementById("versionButton").onclick = async function () {
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
      document.getElementById("remarksBotton").onclick = async function () {
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

      //save recipe
      document.getElementById("saveButton").onclick = function () {
        let confirm = false;
        Swal.fire({
          title: 'Save?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Save'
        }).then((result) => {
          if (result.value) {
            confirm = true;
          }
        })
        if (confirm) {
          let data = new FormData();
          data.append('filename', "example.json");
          data.append('name', myObj.name);
          data.append('id', myObj.id);
          data.append('version', myObj.version);

          let currentTime = new Date();
          data.append('modified_date', currentTime.toString());
          data.append('uuid', myObj.uuid);
          data.append('remarks', myObj.remarks);
          for (let i = 0; i < myObj.actions.length; i++) {
            data.append('actions', myObj.actions[i].command);
            data.append('actions', myObj.actions[i].time);
          }
          xmlhttp.open("POST", "example.json", true);
          xmlhttp.send(data);
        }
      };
      document.getElementById("newButton").onclick = function () {
      };
    }
  };
  xmlhttp.open("GET", filename, true);
  xmlhttp.send();

  //function to show timeline
  function showTimeLine() {

    // DOMelement where the Timeline will be attached
    var container = document.getElementById('visualization');
    let startTime = new Date(2020, 0, 1, 0, 0, 0);
    let endTime = new Date(2020, 0, 1, 0, 5, 0);
    for (let i = 0; i < myObj.actions.length; i++) {
      let tempTime = myObj.actions[i].time;
      let words = myObj.actions[i].command.split(' ');
      let tempContent = commandToContent(myObj.actions[i].command);
      items[i] = {
        id: i,
        content: tempContent,
        command: myObj.actions[i].command,
        length: time_dict.get(words[0]),
        start: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000),
        end: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000 + time_dict.get(words[0])),
      };
      myObj.actions[i] = {
        id: i,
        command: items[i].command,
        time: tempTime,
      }
    }


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
      onAdd: function (item, callback) {
        addPrompt('Add item', 'Enter text content for new item:', item.content, function (value) {
          console.log(value);
          if (value) {
            //function to generate the id of items
            let tempID;
            for (let i = 0; i <= myObj.actions[i]; i++) {
              let occupied = false;
              for (let j = 0; j < myObj.actions[j]; j++) {
                if (myObj.actions[j].id == i) {
                  occupied = true;
                  break;
                }
                if (occupied == false) {
                  tempID = i;
                  break;
                }
              }
            }

            //set up items to add
            item.id = tempID;
            if (value[0] == 'WOKTEMP' || value[0] == 'WOKY' || value[0] == 'POURBOX' || value[0] == 'LOADBOX') {
              item.command = value[0] + ' ' + value[1];
            }
            else {
              item.command = value[0];
            }
            item.content = commandToContent(item.command);
            console.log(item.content);
            item.start = new Date().setTime(startTime.getTime() + value[2] * 1000);
            let words = item.command.split(' ');
            item.length = time_dict.get(words[0]);
            item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + item.length);
            let action = {
              command: item.command,
              time: value[2],
              id: tempID,
            };
            myObj.actions.push(action);
            callback(item); // send back adjusted new item
          } else {
            callback(null); // cancel item creation
          }
        });
      },

      onUpdate: function (item, callback) {
        console.log('onupdate');
        updatePrompt('Update item', 'Edit items text:', item.command, function (value) {
          if (value) {
            if (value[0] == 'WOKTEMP' || value[0] == 'WOKY' || value[0] == 'POURBOX' || value[0] == 'LOADBOX') {
              item.command = value[0] + ' ' + value[1];
            }
            else {
              item.command = value[0];
            }
            item.content = commandToContent(item.command);
            item.start = new Date().setTime(startTime.getTime() + value[2] * 1000);
            let words = item.command.split(' ');
            item.length = time_dict.get(words[0]);
            item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + item.length);
            //update myObj.actions
            for (let i = 0; i < myObj.actions.length; i++) {
              if (item.id == myObj.actions[i].id) {
                myObj.actions[i].time = value[2];
                myObj.actions[i].command = item.command;
                break;
              }
            }

            callback(item); // send back adjusted item
          } else {
            callback(null); // cancel updating the item
          }
        });
      },

      onRemove: function (item, callback) {
        prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function (ok) {
          if (ok) {

            //remove the action in myObj.actions
            for (let i = 0; i < myObj.actions.length; i++) {
              if (item.id == myObj.actions[i].id) {
                console.log('delete ' + myObj.actions[i].command);
                console.log('array length ' + myObj.actions.length);
                myObj.actions.splice(i, 1);
                console.log('array length ' + myObj.actions.length);
                break;
              }
            }

            callback(item); // confirm deletion
          } else {
            callback(null); // cancel deletion
          }
        });
      },

      onMoving: function (item, callback) {
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
        for (let i = 0; i < myObj.actions.length; i++) {
          if (item.id == myObj.actions[i].id) {
            myObj.actions[i].time = (item.start.getTime() - startTime.getTime()) / 1000;
            break;
          }
        }

        callback(item); // send back the (possibly) changed item
        document.getElementById('change').innerHTML = item.start.getMinutes() + ":" + item.start.getSeconds();
      },



    };

    // Create a Timeline
    var timeline = new vis.Timeline(container, items, options);

    function commandToContent(command) {
      let words = command.split(' ');
      let tempContent;
      if (words[0] == 'PSDS' || words[0] == 'PLQS') {
        tempContent = command_dict.get(words[0]).get(words[1]);
      }
      else if (words[0] == 'LOADBOX' || words[0] == 'WOKTEMP' || words[0] == 'WOKY') {
        tempContent = command_dict.get(words[0]) + words[1];
      }
      else tempContent = command_dict.get(words[0]);
      return tempContent;
    }

    async function addPrompt(title, text, inputValue, callback) {
      const { value: p0 } = await Swal.fire({
        title: 'function',
        input: 'select',
        inputOptions: {
          WOKTEMP: '設置溫度',
          WOKOIL: '起鑊',
          POURBOX: '倒盒',
          LOADBOX: '取盒',
          WAIT: '翻炒',
          POURFOOD: '上菜',
          WOKCLEAN: '洗鍋',
          WOKY: '設置轉速',
          END: '完成',
          INIT: '初始化',
          '調料': {
            'PSDS 0': '假的',
            'PSDS 1': '下糖',
            'PSDS 2': '下鹽',
            'PSDS 3': '下胡椒',
            'PSDS 4': '自定調料'
          },
          '液體': {
            'PLQS 0': '假的',
            'PLQS 1': '加水',
            'PLQS 2': '下油',
            'PLQS 3': '3號泵噴出',
            'PLQS 4': '4號泵噴出',
            'PLQS 5': '5號泵噴出',
            'PLQS 6': '芡汁',
            'PLQS 7': '7號泵噴出',
            'PLQS 8': '8號泵噴出',
          },
        }
      })
      if (p0) {
        let result = [];
        result.push(p0);
        if (p0 == 'WOKTEMP' || p0 == 'WOKY' || p0 == 'POURBOX' || p0 == 'LOADBOX') {
          const { value: p1 } = await Swal.fire({
            title: 'parameter',
            input: 'text',
          })
          result.push(p1);
        }
        else result.push("");
        const { value: p2 } = await Swal.fire({
          title: 'time',
          input: 'text',
        })
        result.push(p2);
        callback(result);
      }
    }

    async function updatePrompt(title, text, inputValue, callback) {
      const {
        value: formValues
      } = await Swal.fire({
        title: 'Multiple inputs',
        html: generateHTML(inputValue),
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
        console.log(inputValue);
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
}
function generateHTML(command){
  let words = command.split(' ');
  let result = "";
  let content = command_dict.get(words[0]);
  result+=content;
  if (words[0] == 'LOADBOX' || words[0] == 'WOKTEMP' || words[0] == 'WOKY'){
    result +='parameter<input id="swal-input2" class="swal2-input"></input>';
}
console.log(result);
}