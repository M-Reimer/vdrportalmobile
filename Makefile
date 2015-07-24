# -*- Mode: Makefile -*-
#
# Makefile for VDR-Portal Mobile
#

.PHONY: xpi

xpi: clean
	zip -r9 vdrportalmobile-trunk.xpi install.rdf \
                                 chrome.manifest \
                                 resource \
                                 bootstrap.js
clean:
	rm -f vdrportalmobile-trunk.xpi
