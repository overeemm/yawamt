/// <reference path="jquery.debug.js"/>
/// <reference path="jquery.timers.js"/>
/// <reference path="jquery.tinysort.js"/>
/// <reference path="jquery.fit2Box.js"/>
/// <reference path="jquery.sound.js"/>
/// <reference path="yawamt.timeline.js"/>
/// <reference path="yawamt.sound.js"/>

$.ajaxSetup({ error: displayError });

function displayError(XMLHttpRequest, textStatus, errorThrown) {
    $('span#error-indicator').show();
    
    $('div.error ul').append("<li>" + new Date() + "[" + textStatus + "] " + (errorThrown ? errorThrown : XMLHttpRequest.responseText) + "</li>");
}

$(document).ready(function() {

    //$('img.menu-stats').click(function() { openStatsFor(''); });

    $('img.menu-new').click(function() { newUrl(); });

    $('img.menu-audio').click(function() { playSound(); });

    $('img.menu-about').click(function() {
        $('div#info').toggle();
    });

    $('div#info').dblclick(function() {
        $('div#info').hide();
    });

    retrieveUrls(); // initiele urls vulling
    updateServiceStatus(); // initiele status bepaling

    $(document).everyTime("30s", "urls", retrieveUrls);   // om de 30s checken op nieuwe urls
    $(document).everyTime("15s", "status", updateStatus);  // om de 5s checken op nieuwe status
    $(document).everyTime("15s", "servicestatus", updateServiceStatus);  // om de 5s checken op nieuwe status
    $(document).everyTime("1s", "datum", convertDate); // om de halve sec checken voor datums
    $(document).everyTime("1s", "titel", updateTitel); // om de halve sec de titel bijwerken
    $(document).everyTime("10s", "resize", setSizeUrls); // om de halve sec de titel bijwerken
    //    $(window).bind('resize', function() {
    //        setSizeUrls();
    //    });

    initSound();

    $('#error-indicator').click(function() {
        $('.error').toggle();
    });
    $('.error').click(function() {
        $('.error').toggle();
    });
});

function sortUrls() {
    $('div.url').tsort({ attr: "sortkey" });
}

var lastdocumentwidth;
function setSizeUrls() {

    if (!$.browser.msie) // binnen firefox lijkt het niet lekker te werken
        return;

    var docwidth = $(document).innerWidth();

    if (docwidth === lastdocumentwidth)
        return;

    lastdocumentwidth = docwidth;

    var margin = 22;
    var minimalwidth = 300 + (2 * margin);

    // hoeveel ruimte hebben de divs:
    var hoeveelopeenrij = Math.floor(docwidth / minimalwidth);
    var benodigdemarge = hoeveelopeenrij * (2 * margin);

    var hoeveelruimte = docwidth - benodigdemarge;
    var width = Math.floor(hoeveelruimte / hoeveelopeenrij);

    $('div.url span').width(width - 70);
    $('div.url').css('margin', 10 + 'px');
    $('div.url').width(width);
    $('div.url span').each(function() { $(this).fit2Box() });
}

function newUrl() {
    /// <summary>Genereer een nieuw-url invoer formulier</summary>
    $('div.form').remove();

    $('div.about').before(
'    <div class="newform form">' +
'        <form action="' + url_insert + '" method="post" name="form-new" id="form-new">' +
'        <table>' +
'            <tr>' +
'                <td class="left" colspan="2">' +
'                  <img class="cancel" src="' + delete_png + '" alt="annuleer" />' +
'                  <img class="opslaan" src="' + save_png + '" alt="opslaan" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Naam</td>' +
'                <td><input type="text" name="naam" value="" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Url</td>' +
'                <td><input type="text" name="url" value="" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Settings</td>' +
'                <td><select name="setting"></select></td>' +
'            </tr>' +
'        </table>' +
'        <input type="hidden" name="id" value="-1" />' +
'        </form>' +
'    </div>');

    prepareForm('new');

    $('img.opslaan').click(function() {

        var form = $('#form-new');
        var action = form.attr('action');
        var formData = form.serialize();

        $.post(action, formData, function(data) {
            if (data != -1) {
                // opgegeslagen, dus even die div bijwerken
                addUrl(data
                      , $("input[name='naam']", form).val()
                      , $("input[name='url']", form).val()
                      , $("select", form).val());

                $('.newform').remove();
                $('div#' + data).dblclick(editUrl);
            } else {
                alert('Opslaan is niet gelukt.');
            }
        });

        return false;
    });
}

function prepareForm(urlid) {
    $.getJSON(url_settings, { "noCache": new Date().getTime() }, function (data) {
        $.each(data, function (index, data) {
            $('select').append('<option value="' + data.ID + '">' + data.Naam + '</option>');
        });
        $('select').attr('disabled', '');

        var settingid = $('div#' + urlid + ' div.setting').html();
        $("select option[value='" + settingid + "']").attr('selected', 'selected');

        $('img.save').click(function () {
            $('form')[0].submit(); // er is altijd maar 1 form!
        });

        $('img.delete').click(function () {
            if (confirm('weet u zeker dat u deze url wilt verwijderen, inclusief statistieken?')) {

                $.post(url_delete, { id: urlid }, function (data) {
                    if (data) {
                        $('div#' + urlid).remove();
                    } else {
                        alert('Verwijderen is niet gelukt.');
                    }
                });

                return false;
            }
        });

        $('img.cancel').click(function () {
            $('div:has(form)').remove();
        });
    });
}

function editUrl() {
    /// <summary>Genereer een edit-formulier.</summary>
    var urlid = this.id;
    $('.newform').remove();

    if ($(this).hasClass("urledit")) {
        $('.editform').remove();
        $(this).removeClass("urledit");
    } else {
        $('div.url').removeClass("urledit");
        $(this).addClass("urledit");
        $('.editform').remove();

        $(this).append(
'    <div class="editform form">' +
'        <form action="' + url_update + '" method="post" name="form-edit" id="form-edit">' +
'        <table>' +
'            <tr>' +
'                <td class="left" colspan="2">' +
'                  <img class="delete" src="' + delete_png + '" alt="verwijder" />' +
'                  <img class="opslaan" src="' + save_png + '" alt="opslaan" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Naam</td>' +
'                <td><input type="text" name="naam" value="' + $('span', this).html() + '" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Url</td>' +
'                <td><input type="text" name="url" value="' + $('a', this).attr('href') + '" /></td>' +
'            </tr>' +
'            <tr>' +
'                <td>Settings</td>' +
'                <td><select name="setting"></select></td>' +
'            </tr>' +
'        </table>' +
'        <input type="hidden" name="id" value="' + urlid + '" />' +
'        </form>' +
'    </div>'
                );

        prepareForm(urlid);

        $('img.opslaan').click(function() {

            var form = $('#form-edit');
            var action = form.attr('action');
            var formData = form.serialize();

            $.post(action, formData, function(data) {
                if (data) {
                    // opgegeslagen, dus even die div bijwerken
                    updateUrl($("input[name='id']", form).val()
                        , $("input[name='naam']", form).val()
                        , $("input[name='url']", form).val()
                        , $("select", form).val());

                    $('.editform').remove();
                    $('div#' + urlid).removeClass("urledit");
                } else {
                    alert('Opslaan is niet gelukt.');
                }
            });

            return false;
        });
    }
}

function updateServiceStatus() {

    $.getJSON(url_combinedservicestatus, { "noCache": new Date().getTime() }, function(data) {
        if (data.Status == "up")
            $('#yawamt-logo').attr('src', yawamt);
        else
            $('#yawamt-logo').attr('src', yawamt_down);
        $('#servicelaatste').attr('title', data.LaatstePulse);
        $('#servicevolgende').attr('title', data.VolgendePulse);
    });
}

function retrieveUrls() {

    ///<summary>Haalt de urls op en werk ze bij.</summary>
    $.getJSON(url_get, { "noCache": new Date().getTime() }, function(data) {

        $.each(data, function(index, url) {
            
            if ($('div#' + url.ID).length == 0) {
                addUrl(url.ID, url.Naam, url.Url, url.SettingID);
                $('div#' + url.ID).dblclick(editUrl);
            } else
                updateUrl(url.ID, url.Naam, url.Url, url.SettingID);
        });

        setSizeUrls();
        sortUrls();
    });
}

function updateUrl(id, naam, url, setting) {
    ///<summary>Update de div van de gegeven Url.</summary>
    $('div#' + id + ' span').html(naam);
    $('div#' + id + ' span').attr('title', $.trim(url));
    $('div#' + id + ' a').attr('href', $.trim(url));
    $('div#' + id + ' div.setting').html(setting);
}

function addUrl(id, naam, url, setting) {
    ///<summary>Voegt een nieuwe div toe voor de gegeven Url.</summary>

    var html =
'    <div id="' + id + '" class="url">' +
'        <div class="hidden setting">' + setting + '</div>' +
'        <span title="' + $.trim(url) + '">' + naam + '</span> ' +
'        <a href="' + $.trim(url) + '" title="open" target="_blank">' +
'        <img src="' + globe_png + '" alt="open" /></a>' +
'        <img class="stats" src="' + stats_png + '" alt="statistieken" />' +
'        <p class="info">laatste update <em class="date"></em>, huidige periode <em class="periode"></em> s</p>' +
'    </div>';

    // altijd aan het einde toevoegen:
    $('div.about').before(html);
    $('div#' + id).attr('sortkey', '4' + naam);

    $('img.stats').mousedown(function() {
        //openStatsFor(id);
    });
}

function updateStatus() {
    ///<summary>Loopt alle divs met css-class 'url' langs en bepaalt de huidige status.</summary>
    $.getJSON(url_status, { "noCache": new Date().getTime() }, function(data) {

        $.each(data, function(index, optionData) {

            var urlid = optionData.ID;
            var status = optionData.Status;
            var div = $('div#' + urlid);

            if (!div.hasClass('urledit')) { // niet als in edit-mode

                div.addClass(status);
                if (status != "hard") div.removeClass("hard");
                if (status != "soft") div.removeClass("soft");
                if (status != "none") div.removeClass("none");

                div.attr('sortkey', (status == "hard" ? "1" :
                                     status == "soft" ? "2" : "3") + $('span', 'div#' + urlid).text());

                if ($('div.hard').length > 0)
                    startSound();
                else
                    stopSound();

                var date = new Date();
                //alert(date.toString() === new Date(date.toString()).toString());
                $('div#lastupdate #webupdate').attr("title", new Date().toString());

                $('p em.date', div).attr('title', optionData.LaatstePulse);
                $('p em.periode', div).html(optionData.Periode);
                sortUrls();
            }
        });

        var date = new Date();
        //alert(date.toString() === new Date(date.toString()).toString());
        $('div#lastupdate #webupdate').attr("title", new Date().toString());
    });
    //  });
}

function updateTitel() {
    var hardcount = $('div.hard').length;
    var softcount = $('div.soft').length;

    if ((hardcount + softcount) > 0)
        document.title = "[" + (hardcount + softcount) + " down] yet another web app monitoring tool";
    else
        document.title = "[all fine] yet another web app monitoring tool";
}

function convertDate() {
    /// <summary>Converteert de inhoud van alle elementen met css-class 'date' naar een relatieve datum.
    /// De absolute datum moet als title zijn gezet.</summary>
    $('.date').each(function() {
        try {
            var stringdate = $(this).attr("title");
            if (stringdate == "") {
                $(this).html('onbekend');
            } else {
                var date = new Date(stringdate);
                var datenow = new Date();
                var elapsedms = Math.abs(datenow.getTime() - date.getTime());

                if (elapsedms > 3600000) // uren
                    $(this).html(Math.ceil(elapsedms / 3600000) + ' uren');
                else if (elapsedms > 600000) // minuten
                    $(this).html(Math.ceil(elapsedms / 60000) + ' minuten');
                else if (elapsedms > 60000) // minuten
                    $(this).html(Math.ceil(elapsedms / 60000) + ' minuten ' + Math.ceil((elapsedms % 60000) / 1000) + ' seconden');
                else if (elapsedms > 1000) // minuten
                    $(this).html(Math.ceil(elapsedms / 1000) + ' seconden');
                else
                    $(this).html('0 seconden');
            }
        } catch (Error) { }
    });
}