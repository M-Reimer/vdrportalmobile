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

// Block Avatar images and some images which are hidden by CSS anyway
browser.webRequest.onBeforeRequest.addListener(
  function(requestDetails){return {cancel: true};},
  {urls: ["http://www.vdr-portal.de/wcf/images/avatars/*",
          "http://www.vdr-portal.de/icon/portalM.png",
          "http://www.vdr-portal.de/icon/indexM.png",
          "http://www.vdr-portal.de/icon/calendarM.png",
          "http://www.vdr-portal.de/wcf/icon/membersM.png",
          "http://www.vdr-portal.de/wcf/icon/galleryM.png",
          "http://www.vdr-portal.de/wcf/icon/mapM.png"],
   types: ["image"]},
  ["blocking"]
);
