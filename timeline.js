export function showTimeLine(recipe) {
  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');
  let actions = recipe.actions;
  let startTime = new Date(2020, 0, 1, 0, 0, 0);
  let endTime = new Date(2020, 0, 1, 0, 10, 0);
  let length = 60000;
  let items = new vis.DataSet();
  for (let i=0;i<actions.length;i++){
    items.add({
      id: i,
      content: actions[i].command,
      start: new Date(2020, 0, 1, 0, 1, 0),
      end: new Date(2020, 0, 1, 0, 2, 0),
      length: length,
    })
  }
  // Create a DataSet (allows two way data-binding)


  // Configuration for the Timeline
  var options = {
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
        millisecond: 'mm:ss',
        second: 'mm:ss',
        minute: 'mm:ss',
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
          item.content = value;
          callback(item); // send back adjusted new item
        } else {
          callback(null); // cancel item creation
        }
      });
    },

    onUpdate: function(item, callback) {

      prettyPrompt('Update item', 'Edit items text:', item.content, function(value) {
        if (value) {
          item.content = value;
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
  function prettyPrompt(title, text, inputValue, callback) {
    swal({
      title: title,
      text: text,
      type: 'input',
      showCancelButton: true,
      inputValue: inputValue
    }, callback);
  }

  function prettyConfirm(title, text, callback) {
    swal({
      title: title,
      text: text,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#DD6B55"
    }, callback);
  }
}
