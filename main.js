
let command_dict = new Map([
  ['WOKOIL', '起鑊'],
  ['POURBOX', '倒盒'],
  ['PWATER', '加水'],
  ['POIL', '下油'],
  ['PSTARCH', '芡汁'],
  ['WOKTEMP', '設置溫度'],
  ['POURFOOD', '上菜'],
  ['WOKCLEAN', '洗鍋'],
  ['WOKY', '設置轉速'],
]);
let time_dict = new Map([
  ['WOKOIL', 1189],
  ['LOADBOX', 6907],
  ['LOADBOXF', 6907],
  ['POURBOX', 4000],
  ['POURBOXF', 4000],
  ['PSDS', 8628],
  ['PLQS', 3025],
  ['PWATER', 3025],
  ['POIL', 3025],
  ['PSTARCH', 3025],
  ['WOKTEMP', 1],
  ['POURFOOD', 8053],
  ['WOKCLEAN', 14082],
  ['WOKY', 1],
  ['END', 1],
  ['INIT', 50026],
  ['START', 1],
  ['WAIT', 1]
]);
var xmlhttp = new XMLHttpRequest();
let filename = "example.json", filename1;
let myObj;
let items = [];
let firstDraw = true;
var container = document.getElementById('visualization');
let startTime = new Date(2020, 0, 1, 0, 0, 0);
let endTime = new Date(2020, 0, 1, 0, 5, 0);

// Configuration for the Timeline
let options = {
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
  editable: {
    add: false,
    remove: false,
    updateTime: false,
    overrideItems: false,
  },
  itemsAlwaysDraggable: {
    item: false,
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
let timeline = new vis.Timeline(container, items, options);

main();
function main() {
  let requestNum = 0;
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let rec = JSON.parse(this.responseText);
      if (rec.name == 'box') {
        showBox(rec);
      }
      else {
        myObj = JSON.parse(this.responseText);
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
      }
    }
  };
  xmlhttp.open("GET", filename, true);
  xmlhttp.send();

  function showTimeLine() {
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



    // Create a Timeline
    if (firstDraw) {
      timeline.destroy();
      console.log("firstTimeline")
      timeline = new vis.Timeline(container, items, options);
      timeline.on('select', onSelect);
      firstDraw = false;
    }
    else {
      timeline.destroy();
      timeline = new vis.Timeline(container, items, options);
      timeline.on('select', onSelect);
      timeline.redraw();
    }

  }
}
async function addPrompt(title, text, inputValue, callback) {
  const { value: p0 } = await Swal.fire({
    title: 'function',
    input: 'select',
    showCancelButton: true,
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
    showCancelButton: true,
    html: generateHTML(inputValue),
    focusConfirm: false,
    preConfirm: () => {
      return [
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
function alertMaxAction() {
  Swal.fire(
    'Maximun amount of action is 255'
  )
}
function generateHTML(command) {
  let words = command.split(' ');
  let result = '<!doctype html>' +
    '<html>' +
    '<head>' +
    '</head>' +
    '<body>';
  if (words[0] == "WOKTEMP" || words[0] == "LOADBOX" || words[0] == "POURBOX" || words[0] == "WOKY") {
    result += 'parameter<input id=swal-input2 class="swal2-input" name="swal-input2">';
  }
  else {
    result += '<span id=swal-input2 value=""></span>';
  }
  result += 'time<input id="swal-input3" class="swal2-input">' +
    '</html>';
  return result;
}
function addHTML() {
  let result = 'function' +
    '<select id="swal-input1" class="swal2-input" list="swal-input1" name="swal-input1">' +
    '<option value="WOKTEMP">設置溫度</option>' +
    '<option value="POURBOX">倒盒</option>' +
    '<option value="WOKOIL">起鑊</option>' +
    '<option value="LOADBOX">取盒</option>' +
    '<optgroup label="下調料">' +
    '<option value="PSDS 0">假的</option>' +
    '<option value="PSDS 1">下糖</option>' +
    '<option value="PSDS 2">下鹽</option>' +
    '<option value="PSDS 3">下胡椒</option>' +
    '<option value="PSDS 4">下自定調料</option>' +
    '</optgroup>' +
    '<optgroup label="加液體">' +
    '<option value="PLQS 0">假的</option>' +
    '<option value="PLQS 1">加水</option>' +
    '<option value="PLQS 2">下油</option>' +
    '<option value="PLQS 3">3號泵噴出</option>' +
    '<option value="PLQS 4">4號泵噴出</option>' +
    '<option value="PLQS 5">5號泵噴出</option>' +
    '<option value="PLQS 6">勾汁</option>' +
    '<option value="PLQS 7">7號泵噴出</option>' +
    '<option value="PLQS 8">8號泵噴出</option>' +
    '</optgroup>' +
    '<option value="LOADBOX">取盒</option>' +
    '<option value="WAIT">翻炒</option>' +
    '<option value="POURFOOD">上菜</option>' +
    '<option value="WOKCLEAN">洗鍋</option>' +
    '<option value="WOKY">設置轉速</option>' +
    '<option value="END">完成</option>' +
    '<option value="INIT">初始化</option>' +
    '</select>' +
    'parameter<input id="swal-input2" class="swal2-input">' +
    '</if>' +
    'time<input id="swal-input3" class="swal2-input">';
  return result;
}
function sendObj(filename, myObj) {
  let data = new FormData();
  data.append('f', 'WRITE');
  data.append('filename', filename);
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
  xmlhttp.open("POST", filename, true);
  xmlhttp.send(data);
}
function commandToContent(command) {
  let words = command.split(' ');
  let tempContent;
  if (words[0] == 'PSDS' || words[0] == 'PLQS') {
    tempContent = command_dict.get(words[0]).get(words[1]);
  }
  else if (words[0] == 'LOADBOX' || words[0] == 'WOKTEMP' || words[0] == 'WOKY' || words[0] == 'POURBOX') {
    tempContent = command_dict.get(words[0]) + words[1];
  }
  else tempContent = command_dict.get(words[0]);
  return tempContent;
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
document.getElementById("idButton").onclick = async function () {
  const {
    value: id
  } = await Swal.fire({
    input: 'text',
    inputPlaceholder: 'Enter the id'
  })

  if (id) {
    myObj.id = id;
    document.getElementById("id").innerHTML = myObj.id;
  }

};
document.getElementById("remarksButton").onclick = async function () {
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
document.getElementById("edit").onclick = async function () {
  Swal.fire({
    title: 'Edit?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.value) {
      document.getElementById("nameButton").disabled = false;
      document.getElementById("versionButton").disabled = false;
      document.getElementById("remarksButton").disabled = false;
      document.getElementById("saveButton").disabled = false;
      //document.getElementById("saveAs").disabled = false;
      document.getElementById("addButton").disabled = false;
      document.getElementById("updateButton").disabled = false;
      document.getElementById("idButton").disabled = false;
      options.editable = {
        add: false,
        remove: true,
        updateTime: true,
        overrideItems: true,
      };
      options.itemsAlwaysDraggable = { item: true };
      timeline.destroy();
      timeline = new vis.Timeline(container, items, options);
      timeline.on('select', onSelect);
    }
  })
};
document.getElementById("addButton").onclick = async function () {
  if (myObj.actions.length >= 255) {
    alertMaxAction();
  }
  else {
    const {
      value: formValues
    } = await Swal.fire({
      title: 'Multiple inputs',
      showCancelButton: true,
      html: addHTML("WOKOIL"),
      focusConfirm: false,
      preConfirm: () => {
        let t = document.getElementById('swal-input3').value;
        let p1 = document.getElementById('swal-input1').value;
        let p2 = document.getElementById('swal-input2').value;
        let words = p1.split(' ');
        let result;
        if (words[0] == 'PSDS' || words[0] == 'PLQS') {
          result = {
            command: p1,
            time: t
          }
          return result;
        }
        else if (p1 == 'WOKTEMP' || p1 == 'WOKY' || p1 == 'POURBOX' || p1 == 'LOADBOX') {
          result = {
            command: p1 + ' ' + p2,
            time: t
          }
          return result;
        }
        else {
          result = {
            command: p1,
            time: t
          }
          return result;
        }
      }
    })
    if (formValues) {
      //console.log(inputValue);
      console.log(formValues.command);
      let tempID;
      for (let i = 0; i <= myObj.actions.length; i++) {
        let occupied = false;
        for (let j = 0; j < myObj.actions.length; j++) {
          if (myObj.actions[j].id == i) {
            occupied = true;
            break;
          }
        }
        if (!occupied) {
          tempID = i;
          break;
        }
      }
      let newAction = {
        id: tempID,
        command: formValues.command,
        time: formValues.time,
      };
      myObj.actions.push(newAction);
      let words = formValues.command.split(' ');
      let newItem = {
        id: tempID,
        content: commandToContent(formValues.command),
        command: formValues.command,
        length: time_dict.get(words[0]),
        start: new Date().setTime(startTime.getTime() + formValues.time * 1000),
        end: new Date().setTime(startTime.getTime() + formValues.time * 1000 + time_dict.get(words[0])),
      };
      items.push(newItem);
      timeline.setItems(items);
    }
  }
};
//save recipe
document.getElementById("saveButton").onclick = async function () {
  Swal.fire({
    title: 'Save?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Save'
  }).then((result) => {
    if (result.value) {
      myObj.uuid = uuidv4();
      myObj.version = parseInt(myObj.version) + 1;
      filename = myObj.id + '_v' + myObj.version.toString() + '.json';
      console.log(filename);
      sendObj(filename, myObj);
    }
  })
};
let openFile = function (event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var dataURL = reader.result;
  };
  reader.readAsDataURL(input.files[0]);
  filename = input.files[0].name;
  main();
};
/*
<input id="saveAs" type='file' accept='' class="saveAs" onchange='saveAs(event)' disabled></input>
let saveAs = function(event){
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var dataURL = reader.result;
  };
  reader.readAsDataURL(input.files[0]);
  filename = input.files[0].name;
  myObj.uuid = uuidv4();
  myObj.version = parseInt(myObj.version)+1;
  sendObj(filename,myObj);
}*/

function onSelect(properties) {
  let id = properties.items[0];
  let ti, ti2;
  for (let i = 0; i < items.length; i++) {//find the selected element in items array
    if (items[i].id == id)
      ti = i;
  }
  for (let i = 0; i < myObj.actions.length; i++) {//find the selected element in myObj array
    if (myObj.actions[i].id == id)
      ti2 = i;
  }
  let type;
  console.log(myObj.actions[ti2]);
  let words = myObj.actions[ti2].command.split(' ');
  if (words[0] == "POURBOX" || words[0] == "LOADBOX") {
    myObj.box.forEach(function myFunction(item, index) {
      if (item.id == parseInt(words[1]))
        type = item.type;
    })
    let data = new FormData();
    data.append('f', 'BOX');
    data.append('type', type);
    xmlhttp.open("POST", filename, true);
    xmlhttp.send(data);
  }

  document.getElementById("updateButton").onclick = async function () {
    const {
      value: formValues
    } = await Swal.fire({
      title: 'Multiple inputs',
      showCancelButton: true,
      html: generateHTML(items[ti].command),
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
        ]
      }
    })
    if (formValues) {
      if (words[0] == 'WOKTEMP' || words[0] == 'WOKY' || words[0] == 'POURBOX' || words[0] == 'LOADBOX') {
        items[ti].command = words[0] + ' ' + formValues[0];
      }
      items[ti].content = commandToContent(items[ti].command);
      myObj.actions[ti2].command = items[ti].command;
      if (formValues[1]) {
        items[ti].start = new Date().setTime(startTime.getTime() + formValues[1] * 1000);
        items[ti].end = new Date().setTime(startTime.getTime() + formValues[1] * 1000 + items[ti].length);
        myObj.actions[ti2] = formValues[1];
      }
      timeline.setItems(items);
    }
  }
};
function showBox(rec){
  document.getElementById("boxInfo").innerHTML = rec.content;
}