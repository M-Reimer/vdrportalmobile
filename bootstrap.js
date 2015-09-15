/*
VDR-Portal Mobile - Mobile style for http://www.vdr-portal.de/
Copyright (C) 2015  Manuel Reimer <manuel.reimer@gmx.de>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import('resource://gre/modules/devtools/Console.jsm');

function startup(data, reason) {
  Services.obs.addObserver(httpRequestObserver, "http-on-examine-response", false);
  Services.obs.addObserver(httpRequestObserver, "http-on-examine-cached-response", false);
}

function shutdown(data, reason) {
  Services.obs.removeObserver(httpRequestObserver, "http-on-examine-response");
  Services.obs.removeObserver(httpRequestObserver, "http-on-examine-cached-response");
}

function install(data, reason) {
}

function uninstall(data, reason) {
}

var httpRequestObserver = {
  observe: function(aSubject, aTopic, aData) {
    if (aSubject instanceof Components.interfaces.nsIHttpChannel) {

      // We only modify www.vdr-portal.de
      if (aSubject.URI.host != "www.vdr-portal.de")
        return;

      // Ignore status 3xx
      if (aSubject.responseStatus >= 300 && aSubject.responseStatus < 400)
        return;

      // Only interested in HTML pages
      visitor = new HttpHeaderVisitor();
      aSubject.visitResponseHeaders(visitor);
      if (!visitor.contentType.match(/text\/html/))
        return;

      var newListener = new TracingListener();
      aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
      newListener.originalListener = aSubject.setNewListener(newListener);
    }
  },

  QueryInterface: function(aIID) {
    if (aIID.equals(Components.interfaces.nsIObserver) ||
      aIID.equals(Components.interfaces.nsISupports)) {
      return this;
    }

    throw Components.results.NS_NOINTERFACE;
  }
};

function HttpHeaderVisitor() {
  this.contentType = "";
}
HttpHeaderVisitor.prototype = {
  visitHeader: function(aHeader, aValue) {
    if (aHeader.indexOf("Content-Type") !== -1)
        this.contentType = aValue;
  }
};

function TracingListener(aModifyFunc) {
  this.originalListener = null;
  this.receivedData = [];
}
TracingListener.prototype = {
  onDataAvailable: function(request, context, inputStream, offset, count) {
    var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
    binaryInputStream.setInputStream(inputStream);
    var data = binaryInputStream.readBytes(count);
    this.receivedData.push(data);
  },

  onStartRequest: function(request, context) {
    this.originalListener.onStartRequest(request, context);
  },

  onStopRequest: function(request, context, statusCode) {
    var storageStream = Components.classes["@mozilla.org/storagestream;1"].createInstance(Components.interfaces.nsIStorageStream);
    var binaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);

    var data = ModifyHTML(this.receivedData.join(""));
    if (data == "") // Workaround to get rid of NS_ERROR_OUT_OF_MEMORY
      data = " ";

    storageStream.init(8192, data.length, null);
    binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
    binaryOutputStream.writeBytes(data, data.length);

    this.originalListener.onDataAvailable(request, context, storageStream.newInputStream(0), 0, data.length);
    this.originalListener.onStopRequest(request, context, statusCode);
  },

  QueryInterface: function (aIID) {
    if (aIID.equals(Ci.nsIStreamListener) ||
        aIID.equals(Ci.nsISupports)) {
      return this;
    }
    throw Components.results.NS_NOINTERFACE;
  }
};

function ModifyHTML(aContent) {
    // Inject loading of our built-in mobile CSS
    aContent = aContent.replace(/(<\/head>)/, '<link rel="stylesheet" href="resource://vdrportalmobile/mobile.css"/> $1');

    // Inject "meta viewport" header
    aContent = aContent.replace(/(<\/head>)/, '<meta name="viewport" content="width=device-width"/> $1');

    // Modify the "Search dropdown" handling. Default is to pop up if the text
    // field is clicked. On Android this would pop up the keyboard.
    aContent = aContent.replace(/(<div class=\"searchContainer\">)/, '$1 <img src="resource://vdrportalmobile/search-dropdown.png" id="searchInputPopup"/>');
    aContent = aContent.replace(/id="searchInputMenu"/, 'id="searchInputPopupMenu"');
    aContent = aContent.replace(/popupMenuList\.register\("searchInput"\)/, 'popupMenuList.register("searchInputPopup")');

    // Modify the "mark read" feature in the search result page.
    // Default is to mark read on doubleclick. Just "click" after modification.
    aContent = aContent.replace(/(<script [^>]*src=\"js\/ThreadMarkAsRead\.class\.js\"><\/script>)/, '$1 <script>threadMarkAsRead.init = function(threadID) { var icon = document.getElementById("threadEdit" + threadID); if (icon) { icon.threadID = threadID; icon.onclick = function() { threadMarkAsRead.markAsRead(parseInt(this.threadID)); } } };</script>');

    // Drop avatar images
    aContent = aContent.replace(/<img src=\"wcf\/images\/avatars\/[^>]+>/g, "");

    // Drop some more images, which are hidden by CSS anyway
    aContent = aContent.replace(/<img src=\"icon\/portalM.png\"[^>]+>/, "");
    aContent = aContent.replace(/<img src=\"icon\/indexM.png\"[^>]+>/, "");
    aContent = aContent.replace(/<img src=\"icon\/calendarM.png\"[^>]+>/, "");
    aContent = aContent.replace(/<img src=\"wcf\/icon\/membersM.png\"[^>]+>/, "");
    aContent = aContent.replace(/<img src=\"wcf\/icon\/galleryM.png\"[^>]+>/, "");
    aContent = aContent.replace(/<img src=\"wcf\/icon\/mapM.png\"[^>]+>/, "");
    return aContent;
}
