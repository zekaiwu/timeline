export function showTimeLine(recipe) {
  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');
  let actions = recipe.actions;
  let startTime = new Date(2020, 0, 1, 0, 0, 0);
  let endTime = new Date(2020, 0, 1, 0, 5, 0);
  let length = 5000;
  let items = new vis.DataSet();
  for (let i = 0; i < actions.length; i++) {
    items.add({
      id: i,
      content: actions[i].command,
      start: new Date().setTime(startTime.getTime() + actions[i].time * 1000),
      end: new Date().setTime(startTime.getTime() + actions[i].time * 1000 + length),
      length: length,
    })
  }
  // Create a DataSet (allows two way data-binding)


  // Configuration for the Timeline
  var options = {
    timeAxis: {
      scale: 'second',
      step: 5
    },
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
        second: '',
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
        if (value) {
          item.content = value[0] + ' ' + value[1];
          item.start = new Date().setTime(startTime.getTime() + value[2] * 1000);
          item.length = length;
          item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + length),
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
          item.end = new Date().setTime(startTime.getTime() + value[2] * 1000 + length),
            callback(item); // send back adjusted item
        } else {
          callback(null); // cancel updating the item
        }
      });
    },

    onRemove: function(item, callback) {
      prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function(ok) {
        if (ok) {
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
      callback(item); // send back the (possibly) changed item
      document.getElementById('change').innerHTML = item.start.getMinutes()+":"+item.start.getSeconds();
    },



  };

  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
  /*
  items.on('*', function (event, properties) {
    logEvent(event, properties);
  });

  function logEvent(event, properties) {
    var log = document.getElementById('log');
    var msg = document.createElement('div');

  }
  */
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
        callback(1);
      }
    })
  }
}
