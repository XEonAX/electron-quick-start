// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

module.exports = {
    Hide : function () {
        require('electron').remote.getCurrentWindow().hide();
    },
    Exit: function(){
        require('electron').remote.app.exit();
    }
}