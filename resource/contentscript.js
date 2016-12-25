/*
VDR-Portal Mobile - Mobile style for http://www.vdr-portal.de/
Copyright (C) 2016  Manuel Reimer <manuel.reimer@gmx.de>

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

// Inject "meta viewport" header
var viewporttag = document.createElement("meta");
viewporttag.name = "viewport";
viewporttag.content = "width=device-width";
document.head.appendChild(viewporttag);

// Modify the "Search dropdown" handling. Default is to pop up if the text
// field is clicked. On Android this would pop up the keyboard.
var popupbutton = document.createElement("img");
popupbutton.src = browser.extension.getURL("resource/search-dropdown.png");
popupbutton.id = "searchInputPopup";
var textinput = document.getElementById("searchInput");
textinput.parentNode.insertBefore(popupbutton, textinput);
var searchinputmenu = document.getElementById("searchInputMenu");
searchinputmenu.id = "searchInputPopupMenu";
var script = document.createElement("script");
script.text =
"var index = popupMenuList.menus.indexOf('searchInput');\
 if (index >= 0)\
   popupMenuList.menus.splice(index, 1);\
 popupMenuList.register('searchInputPopup');";
document.head.appendChild(script);
