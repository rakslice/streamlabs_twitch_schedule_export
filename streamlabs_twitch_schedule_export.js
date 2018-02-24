// ==UserScript==
// @name         Streamlabs Twitch Schedule Export
// @namespace    http://rakslice.net/userscripts/streamlabs_twitch_schedule_export
// @version      0.1
// @description  Export schedule from streamlabs schedule widget
// @author       rakslice
// @match        https://*.ext-twitch.tv/*
// @grant        none
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require https://fastcdn.org/FileSaver.js/1.1.20151003/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';

    /* Notes:
     * - basically untested
     * - Google csv import does not allow specifying weekly repeated events afaict
     * - some random cdn used for FileSaver
     */

    function startsWith(s, prefix) {
        return (s.length >= prefix.length) && (s.substr(0, prefix.length) == prefix);
    }

    function endsWith(s, suffix) {
        return (s.length >= suffix.length) && (s.substr(s.length - suffix.length) == suffix);
    }

    function deprefix(s, prefix) {
        if (startsWith(s, prefix)) {
            return s.substr(prefix.length);
        } else {
            return s;
        }
    }

    function desuffix(s, suffix) {
        if (endsWith(s, suffix)) {
            return s.substr(0, s.length - suffix.length);
        } else {
            return s;
        }
    }

    var dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    function mod(x, n) {
        return ((x % n) + n) % n;
    }

    $(function() {
        //console.log("jq onload");
        var countdownDates = $("ul.countdown__dates");
        if (countdownDates.length > 0) {
            // give it a sec in case data takes time to load
            setTimeout(function() {
                var tzText = $("div.countdown__time-info").text();
                tzText = deprefix(tzText, "Times shown as ");
                console.log(tzText);

                var channelName = desuffix(deprefix($('div.countdown__message').text(), "Countdown to"), "'supcoming Twitch Stream");
                var subject = channelName + " stream";
                console.log("subject", subject);

                var csvLines = ["Subject,Start Date,Start Time"];

                var li = $('li', countdownDates);
                li.each(function(i, dayEntry) {
                    // go through days
                    console.log("each", dayEntry);

                    var dayName = $('p.countdown__dates-day', dayEntry).text();

                    $('div.countdown__dates-time', dayEntry).each(function(j, timeEntry) {
                        var timeText = $(timeEntry).text().trim();

                        var dayNum = dayNames.indexOf(dayName);
                        var day = new Date();
                        var dayOffset = mod(dayNum - day.getDay(), 7);
                        day.setDate(day.getDate() + dayOffset);
                        var dateStamp = day.toISOString().substr(0,10);
                        csvLines.push(subject + "," + dateStamp + "," + timeText);
                    });
                });

                console.log("found schedule widget contents");
                var csv = csvLines.join("\n");

                function saveFile() {
                    var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
                    var filename = subject + ".csv";
                    saveAs(blob, filename);
                }

                var button = $('<button type="button">Save to CSV</button>');
                var countdown = $('div.countdown');
                countdown.prepend($('<a href="https://calendar.google.com/calendar/r/settings/export" target="_blank">Google Calendar CSV Import</a>'));
                countdown.prepend(button);
                button.click(function() { saveFile(); });
            }, 2500);
        }
    });

})();