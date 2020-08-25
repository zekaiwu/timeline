let command_dict = new Map([
  ['WOKOIL', '起鑊'],
  ['POURBOX', '倒盒'],
  ['PWATER', '加水'],
  ['POIL', '下油'],
  ['PSTARCH', '芡汁'],
  ['WOKTEMP', '設置溫度'],
  ['POURFOOD', '上菜'],
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
var xmlhttp = new XMLHttpRequest(), xmlhttp1 = new XMLHttpRequest();
let filename = "example.json";
let myObj = {
  filename: '',
  name: '',
  id: 0,
  uuid: '',
  modified_date: '',
  version: 0,
  remarks: '',
  actions: [],
  box: [{ id: -1 }, { id: -1 }, { id: -1 }, { id: -1 }, { id: -1 }],
  water: [],
  oil: [],
  starch: []
};
let ingredientForBoxSelect = [];
let firstDraw = true;
var container = document.getElementById('visualization');
let startTime = new Date(2020, 0, 1, 0, 0, 0);
let endTime = new Date(2020, 0, 1, 0, 5, 0);
let numOil, numWater, numStarch, ingredients;
let data = new FormData();
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
            let words = myObj.actions[i].command.split(' ');
            if (words[0] == 'PWATER')
              numWater--;
            if (words[0] == 'POIL')
              numWater--;
            if (words[0] == 'PSTARCH')
              numStarch--;
            myObj.actions.splice(i, 1);
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
    if((item.end - item.start) == item.length){
      item.start.setTime(item.start);
      item.end.setTime(item.end);
    }
    //set time in actions
    for (let i = 0; i < myObj.actions.length; i++) {
      if (item.id == myObj.actions[i].id) {
        myObj.actions[i].time = (item.start.getTime() - startTime.getTime()) / 1000;
        myObj.actions[i].start = item.start.getTime();
        myObj.actions[i].start = item.end.getTime();
        break;
      }
    }

    callback(item); // send back the (possibly) changed item
    document.getElementById('change').innerHTML = item.start.getMinutes() + ":" + item.start.getSeconds();
  },



};
let timeline = new vis.Timeline(container, myObj.actions, options);
data.append('f', 'BOX');
xmlhttp.open("POST", 'ingredient.json', true);
xmlhttp.send(data);
//resive data from server
xmlhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    let rec = JSON.parse(this.responseText);
    if (rec.name == 'box') {
      ingredients = rec;
      generateIngredientForBoxSelect(ingredients);
    }
    else {
      console.log(rec.name);
      myObj = JSON.parse(this.responseText);
      document.getElementById("name").innerHTML = myObj.name;
      document.getElementById("id").innerHTML = myObj.id;
      document.getElementById("version").innerHTML = myObj.version;
      document.getElementById("modified_date").innerHTML = myObj.modified_date;
      document.getElementById("uuid").innerHTML = myObj.uuid;
      document.getElementById("remarks").innerHTML = myObj.remarks;
      numWater = myObj.water.length; numOil = myObj.oil.length; numStarch = myObj.starch.length;
      document.getElementById("box1id").innerHTML = myObj.box[0].id;
      document.getElementById("box2id").innerHTML = myObj.box[1].id;
      document.getElementById("box3id").innerHTML = myObj.box[2].id;
      document.getElementById("box4id").innerHTML = myObj.box[3].id;
      document.getElementById("box5id").innerHTML = myObj.box[4].id;
      showTimeLine();
    }
  }
};
window.onload = async function () {
  const { value: file } = await Swal.fire({
    title: 'Select file',
    input: 'file',
    showCancelButton: true,
    inputAttributes: {
      'aria-label': 'select your json file here'
    },
    cancelButtonText: 'New',
    allowOutsideClick: false
  })

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      Swal.fire({
        title: 'Your select file',
      })
    }
    reader.readAsDataURL(file);
    filename = file.name;
    main(true);
  }
  else {
    main(false);
  }
  document.getElementById("b1").onclick = function () {
    updateBox(1);
  }
  document.getElementById("b2").onclick = function () {
    updateBox(2);
  }
  document.getElementById("b3").onclick = function () {
    updateBox(3);
  }
  document.getElementById("b4").onclick = function () {
    updateBox(4);
  }
  document.getElementById("b5").onclick = function () {
    updateBox(5);
  }
}

function main(selectFile) {
  if (selectFile) {
    xmlhttp.open("GET", filename, true);
    xmlhttp.send();
  }
  else {
    newObj();
    showTimeLine();
  }
  function newObj() {
    allowEdit();
    myObj.id = 0; document.getElementById("id").innerHTML = myObj.id;
    myObj.name = ""; document.getElementById("name").innerHTML = myObj.name;
    myObj.version = 0; document.getElementById("version").innerHTML = myObj.version;
    myObj.uuid = ""; document.getElementById("uuid").innerHTML = myObj.uuid;
    myObj.remarks = ""; document.getElementById("remarks").innerHTML = myObj.remarks;
    myObj.actions = [];
  }
  document.getElementById("new").onclick = async function () {
    newObj();
    showTimeLine();
  };
}

// for double click to add actions
async function addPrompt(title, text, inputValue, callback) {
  const { value: p0 } = await Swal.fire({
    title: 'function',
    input: 'select',
    showCancelButton: true,
    inputOptions: {
      WOKTEMP: '設置溫度',
      WOKOIL: '起鑊',
      POURBOX: '倒盒',
      WOKCLEAN: '洗鍋',
      WOKY: '設置轉速',
      POURFOOD: '上菜',
      '液體': {
        'PWATER': '加水',
        'POIL': '下油',
        'PSTARCH': '芡汁',
      },
    }
  })
  if (p0) {
    let result = [];
    result.push(p0);
    if (p0 == 'WOKTEMP' || p0 == 'WOKY' || p0 == 'POURBOX') {
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

//for double click actions to update the action
async function updatePrompt(title, text, inputValue, callback) {
  const {
    value: formValues
  } = await Swal.fire({
    title: 'Multiple inputs',
    showCancelButton: true,
    html: updateHTML(inputValue),
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

function sendObj(filename, myObj) {
  let data = new FormData();
  data.append('f', 'WRITE');
  let tactions = [], t2actions = myObj.actions;
  for(let i=0;i<myObj.actions.length;i++){
    tactions.push({command : myObj.actions[i].command, time : myObj.actions[i].time});
  }
  let tobj = myObj;
  tobj.actions = tactions;
  let result = JSON.stringify(tobj);
  myObj.actions=t2actions;
  console.log(JSON.stringify(myObj))
  data.append('obj', result);
  xmlhttp.open("POST", filename, true);
  xmlhttp.send(data);
}
function commandToContent(command) {
  let words = command.split(' ');
  let tempContent;
  if (words[0] == 'PWATER' || words[0] == 'WOKTEMP' || words[0] == 'WOKY' || words[0] == 'POURBOX' || words[0] == 'POIL' || words[0] == 'PSTARCH') {
    tempContent = command_dict.get(words[0]) + words[1];
  }
  else tempContent = command_dict.get(words[0]);
  return tempContent;
}
//change other information when click the botton
document.getElementById("showobj").onclick = function(){
  console.log(JSON.stringify(myObj));
}
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
    myObj.id = parseInt(id);
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
      allowEdit()
    }
  })
};
function allowEdit() {
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
  timeline = new vis.Timeline(container, myObj.actions, options);
  timeline.on('select', onSelect);
}

document.getElementById("addButton").onclick = async function () {
  if (myObj.actions.length >= 255) {
    alertMaxAction();
  }
  else {
    const {
      value: formValues
    } = await Swal.fire(
      {
        title: 'Add Actions',
        showCancelButton: true,
        html: addHTML(),
        customClass: 'swal2-overflow',
        onOpen: function () {
          $('#timepicker').timepicker({
            minuteMax: 4,
            timeFormat: 'mm:ss',
            showButtonPanel : false,
          });
        },
        focusConfirm: false,
        preConfirm: () => {
          let t = calculateSeconds(document.getElementById('timepicker').value);
          let p1 = document.getElementById('swal-input1').value;
          let p2 = document.getElementById('swal-input2').value;
          let words = p1.split(' ');
          let result;   
          if (p1 == 'WOKTEMP' || p1 == 'WOKY' || p1 == 'POURBOX' || p1 == 'PWATER' || p1 == 'POIL' || p1 == 'PSTARCH') {
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
      let words = formValues.command.split(' ');
      if (liquidMax(words[0])) {
        alertMaxLiquid();
        return;
      }
      if(words[0]=='WOKY'){
        if (parseInt(words[1])<0 || parseInt(words[1])>2000){
          alertWOKY();
          return;
        }
      }
      if(words[0]=='POURBOX'){                
        if (parseInt(words[1])<1 || parseInt(words[1])>5){
          alertBox();
          return;
        }
      }

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
      console.log("add id "+tempID);
      let newAction = {
        id: tempID,
        command: formValues.command,
        time: formValues.time,
        content: commandToContent(formValues.command),
        length: time_dict.get(words[0]),
        start: new Date().setTime(startTime.getTime() + formValues.time * 1000),
        end: new Date().setTime(startTime.getTime() + formValues.time * 1000 + time_dict.get(words[0])),
      };
      myObj.actions.push(newAction);
      timeline.setItems(myObj.actions);
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
      if (myObj.name == '') {
        alertNoName();
        return;
      }
      else if (myObj.id == 0) {
        alertNoID();
        return;
      }
      updateMyObj();
      myObj.filename = myObj.id + '_v' + myObj.version.toString() + '.json';
      sendObj(myObj.filename, myObj);
    }
  })
};


async function updateBox(number) {
  const { value: ingredient } = await Swal.fire({
    title: 'Select id of the box',
    input: 'select',
    inputOptions: ingredientForBoxSelect,
    inputPlaceholder: 'Select a box',
    showCancelButton: true,
  })
  if (ingredient) {
    console.log(number-1);
    myObj.box[number-1].id = ingredients.box[ingredient].id;
    document.getElementById("box" + number + "id").innerHTML = myObj.box[number-1].id;

  }
}

let openFile = function (event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var dataURL = reader.result;
  };
  reader.readAsDataURL(input.files[0]);
  filename = input.files[0].name;
  main(true);
};

function onSelect(properties) {
  let id = properties.items[0];
  console.log(id);
  let ti;
  for (let i = 0; i < myObj.actions.length; i++) {//find the selected element in myObj array
    if (myObj.actions[i].id == id)
      ti = i;
  }
  console.log(ti);
  let words = myObj.actions[ti].command.split(' ');
  console.log(myObj.actions[ti]);
  if (words[0] == 'POURBOX') {
    for (let i = 0; i < ingredients.box.length; i++) {
      if (myObj.box[parseInt(words[1])-1].id == 
        ingredients.box[i].id) {
        showBox(ingredients.box[i].content);
      }
    }
  }
  document.getElementById("updateButton").onclick = async function () {
    const {
      value: formValues
    } = await Swal.fire({
      title: myObj.actions[ti].command,
      showCancelButton: true,
      html: updateHTML(myObj.actions[ti].command),
      customClass: 'swal2-overflow',
      onOpen: function () {
        $('#timepicker').timepicker({
          minuteMax: 4,
          timeFormat: 'mm:ss',
          showButtonPanel : false,
        });
      },
      focusConfirm: false,
      preConfirm: () => {
        let t = calculateSeconds(document.getElementById('timepicker').value);
        return [
          document.getElementById('swal-input2').value,
          t,
        ]
      }
    })
    if (formValues) {
      if (words[0] == 'WOKTEMP' || words[0] == 'WOKY' || words[0] == 'POURBOX') {
        myObj.actions[ti].command = words[0] + ' ' + formValues[0];
      }
      myObj.actions[ti].content = commandToContent(myObj.actions[ti].command);
      if (formValues[1]) {
        myObj.actions[ti].start = new Date().setTime(startTime.getTime() + formValues[1] * 1000);
        myObj.actions[ti].end = new Date().setTime(startTime.getTime() + formValues[1] * 1000 + myObj.actions[ti].length);
        myObj.actions[ti].time = formValues[1];
      }
      timeline.setItems(myObj.actions);
    }
  }

};
function showBox(content) {
  document.getElementById("boxContent").innerHTML = content;
}
function liquidMax(command) {
  if (command == 'PWATER')
    if (numWater >= 3)
      return true;
    else numWater++;
  if (command == 'POIL')
    if (numOil >= 3)
      return true;
    else numOil++;
  if (command == 'PSTARCH')
    if (numStarch >= 3)
      return true;
    else numStarch++;
  return false;
}
function updateMyObj() {
  myObj.uuid = uuidv4();
  myObj.version = parseInt(myObj.version) + 1;
  myObj.water = [];
  myObj.oil = [];
  myObj.starch = [];
  myObj.actions.forEach(updateArray);
  myObj.modified_date = (new Date()).toString();
  document.getElementById("modified_date").innerHTML = myObj.modified_date;
  document.getElementById("version").innerHTML = myObj.version;
  document.getElementById("uuid").innerHTML = myObj.uuid;
  function updateArray(item) {
    let words = item.command.split(' ');
    let tempItem;
    if (words[0] == 'PWATER') {
      tempItem = {
        portion: parseInt(words[1]),
        time: item.time
      };
      myObj.water.push(tempItem);
    }
    if (words[0] == 'POIL') {
      tempItem = {
        portion: parseInt(words[1]),
        time: item.time
      };
      myObj.oil.push(tempItem);
    }
    if (words[0] == 'PSTARCH') {
      tempItem = {
        portion: parseInt(words[1]),
        time: item.time
      };
      myObj.starch.push(tempItem);
    }
  }
}
function calculateSeconds(string) {
  words = string.split(':');
  return parseInt(words[0]) * 60 + parseInt(words[1]);
}
function updateHTML(command) {
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
  result += 'time<input id="timepicker" class="swal2-input">' +
    '</html>';
  return result;
}
function addHTML() {
  let result = 'function' +
    '<select id="swal-input1" class="swal2-input" list="swal-input1" name="swal-input1">' +
    '<option value="WOKTEMP">設置溫度</option>' +
    '<option value="POURBOX">倒盒</option>' +
    '<option value="WOKOIL">起鑊</option>' +
    '<optgroup label="加液體">' +
    '<option value="PWATER">加水</option>' +
    '<option value="POIL">下油</option>' +
    '<option value="PSTARCH">芡汁</option>' +
    '</optgroup>' +
    '<option value="POURFOOD">上菜</option>' +
    '<option value="WOKY">設置轉速</option>' +
    '</select>' +
    'parameter<input id="swal-input2" class="swal2-input">' +
    'time<input id="timepicker" class="swal2-input" value="00:00">';
  return result;
}
function showTimeLine() {
  for (let i = 0; i < myObj.actions.length; i++) {
    let tempTime = myObj.actions[i].time;
    let words = myObj.actions[i].command.split(' ');
    let tempContent = commandToContent(myObj.actions[i].command);
    myObj.actions[i] = {
      id: i,
      content: tempContent,
      command: myObj.actions[i].command,
      length: time_dict.get(words[0]),
      start: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000),
      end: new Date().setTime(startTime.getTime() + myObj.actions[i].time * 1000 + time_dict.get(words[0])),
      time: tempTime,
    }
  }
  // Create a Timeline
  if (firstDraw) {
    timeline.destroy();
    console.log("firstTimeline")
    timeline = new vis.Timeline(container, myObj.actions, options);
    timeline.on('select', onSelect);
    firstDraw = false;
  }
  else {
    timeline.destroy();
    timeline = new vis.Timeline(container, myObj.actions, options);
    timeline.on('select', onSelect);
    timeline.redraw();
  }

}
function generateIngredientForBoxSelect(ingredients) {
  ingredientForBoxSelect = [];
  ingredients.box.forEach(function (element) {
    ingredientForBoxSelect.push(element.id.toString() + element.name + ' ' + element.content);
  })
}





function alertMaxAction() {
  Swal.fire(
    'Maximun amount of action is 255'
  )
}
function alertMaxLiquid() {
  Swal.fire(
    'You can only pour 1 liquid 3 times'
  )
}
function alertNoName() {
  Swal.fire(
    'Please input your name'
  )
}
function alertNoID() {
  Swal.fire(
    'Please input your ID'
  )
}
function alertWOKY() {
  Swal.fire(
    'Range of WOKY should be 0-2000'
  )
};
function alertBox() {
  Swal.fire(
    'Range of BOX should be 1-5'
  )
}