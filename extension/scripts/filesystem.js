window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

var fs = window.requestFileSystem;
function download(fs,url,file,win,fail) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = "blob";
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if(xhr.status === 200){
        fs.root.getFile(file,{create:true},function(fileEntry){
          fileEntry.createWriter(function(writer){
            writer.onwriteend = win;
            writer.onerror = fail;
            writer.write(xhr.response);
          })
        },fail)
      } else {
        fail(xhr.status);
      }
    }
  };
  xhr.send();
  return xhr;
};