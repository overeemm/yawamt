
function openStatsFor(id) {

    // create a popup with a div
    var html = "<div id=\"stats\"></div>";
    $('div.about').after(html);
    setHeightStatsPopup();
    createTimeline(id);

    $(window).resize(setHeightStatsPopup);
    $(document).dblclick(function() { $('div#stats').remove(); tl = null; });
}

var resizeTimerID = null;
var tl;

function setHeightStatsPopup() {
    $('div#stats').css('height', ($(window).height() - 40) + 'px');

    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            tl.layout();
        }, 500);
    }
}

function createTimeline(id) {

    var now = new Date();
    var datestring = now.toUTCString();

    var eventSource = new Timeline.DefaultEventSource();
    var bandInfos = [
    Timeline.createBandInfo({
        showEventText: false,
        eventSource: eventSource,
        date: datestring,
        width: "70%",
        intervalUnit: Timeline.DateTime.HOUR,
        intervalPixels: 100
    }),
    Timeline.createBandInfo({
        showEventText: false,
        trackHeight: 0.5,
        trackGap: 0.2,
        eventSource: eventSource,
        date: datestring,
        width: "20%",
        intervalUnit: Timeline.DateTime.DAY,
        intervalPixels: 200
    }),
    Timeline.createBandInfo({
        showEventText: false,
        trackHeight: 0.5,
        trackGap: 0.2,
        eventSource: eventSource,
        date: datestring,
        width: "10%",
        intervalUnit: Timeline.DateTime.MONTH,
        intervalPixels: 200
    })];

    bandInfos[1].syncWith = 0;
    bandInfos[1].highlight = true;
    bandInfos[2].syncWith = 0;
    bandInfos[2].highlight = true;
    tl = Timeline.create(document.getElementById("stats"), bandInfos);

    Timeline.loadXML(url_timeline + id, function(xml, url) { eventSource.loadXML(xml, url); });
}