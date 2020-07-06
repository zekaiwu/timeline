
  // note that months are zero-based in the JavaScript Date object, so month 3 is April
  var items = new vis.DataSet([
    {id: 4, content: 'item 4', start: new Date(2020,0,1,0,1,0), end: new Date(2020,0,1,0,2,0)},
  ]);

  let min = new Date(2020,0,1,0,0,0);
  let max = new Date(2020,0,1,0,10,0);

  var container = document.getElementById('visualization');
  var options = {
    min: min,
    max: max,
    start: min,
    end: max,
    height: '500px',
    editable: true,
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

    onAdd: function (item, callback) {
      prettyPrompt('Add item', 'Enter text content for new item:', item.content, function (value) {
        if (value) {
          item.content = value;
          callback(item); // send back adjusted new item
        }
        else {
          callback(null); // cancel item creation
        }
      });
    },

    onMoving: function (item, callback) {
      if (item.start < min) item.start = min;
      if (item.start > max) item.start = max;
      if (item.end   > max) item.end   = max;

      callback(item); // send back the (possibly) changed item
    },

    onUpdate: function (item, callback) {
      prettyPrompt('Update item', 'Edit items text:', item.content, function (value) {
        if (value) {
          item.content = value;
          callback(item); // send back adjusted item
        }
        else {
          callback(null); // cancel updating the item
        }
      });
    },

    onRemove: function (item, callback) {
      prettyConfirm('Remove item', 'Do you really want to remove item ' + item.content + '?', function (ok) {
        if (ok) {
          callback(item); // confirm deletion
        }
        else {
          callback(null); // cancel deletion
        }
      });
    }
  };
  var timeline = new vis.Timeline(container, items, options);

  items.on('*', function (event, properties) {
    logEvent(event, properties);
  });

  function logEvent(event, properties) {
    var log = document.getElementById('log');
    var msg = document.createElement('div');
    msg.innerHTML = 'event=' + JSON.stringify(event) + ', ' +
        'properties=' + JSON.stringify(properties);
    log.firstChild ? log.insertBefore(msg, log.firstChild) : log.appendChild(msg);
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

  function prettyPrompt(title, text, inputValue, callback) {
    swal({
      title: title,
      text: text,
      type: 'input',
      showCancelButton: true,
      inputValue: inputValue
    }, callback);
  }
