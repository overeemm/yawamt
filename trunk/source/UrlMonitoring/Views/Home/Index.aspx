<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="YAWAMT.Web.Views.Home.Index" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <title>yet another web app monitoring tool</title>
    <link href="~/Content/style/Site.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/yawamt.ico" rel="shortcut icon" />
    <link href="~/Home/Feed" rel="alternate" type="application/rss+xml" title="RSS" />

    <script src="<%= Url.Content("~/Content/script/jquery.debug.js")%>" type="text/javascript"></script>
    <script src="<%= Url.Content("~/Content/script/jquery.tinysort.js")%>" type="text/javascript"></script>
    <script src="<%= Url.Content("~/Content/script/jquery.timers.js")%>" type="text/javascript"></script>
    <script src="<%= Url.Content("~/Content/script/jquery.fit2Box.js")%>" type="text/javascript"></script>
    <script src="<%= Url.Content("~/Content/script/soundmanager2.js")%>" type="text/javascript"></script>
    <%--<script src="http://simile.mit.edu/timeline/api/timeline-api.js" type="text/javascript"></script>--%>
    
    <script src="<%= Url.Content("~/Content/script/yawamt.js")%>" type="text/javascript"></script>
    <%--<script src="<%= Url.Content("~/Content/script/yawamt.timeline.js")%>" type="text/javascript"></script>--%>
</head>
<body>

    <script type="text/javascript">
        var delete_png = '<%=this.ResolveClientUrl("~/Content/images/delete.png") %>';
        var save_png = '<%=this.ResolveClientUrl("~/Content/images/save.png") %>';
        var globe_png = '<%=this.ResolveClientUrl("~/Content/images/globe.png") %>';
        var stats_png = '<%=this.ResolveClientUrl("~/Content/images/stats.png") %>';
        var new_png = '<%=this.ResolveClientUrl("~/Content/images/new.png") %>';

        var yawamt = '<%=this.ResolveClientUrl("~/Content/images/yawamt.png") %>';
        var yawamt_down = '<%=this.ResolveClientUrl("~/Content/images/yawamt_down.png") %>';

        var url_insert = '<%=Url.Action("Insert", "Url") %>/';
        var url_settings = '<%=Url.Action("Settings", "Url") %>/';
        var url_update = '<%=Url.Action("Update", "Url") %>/';
        var url_delete = '<%=Url.Action("Delete", "Url") %>/';
        var url_get = '<%=Url.Action("Get", "Url") %>/';
        var url_status = '<%=Url.Action("CombinedStatus", "Url") %>/';
        var url_timeline = '<%=Url.Action("Timeline", "Url") %>/';
        var url_combinedservicestatus = '<%=Url.Action("GetCombinedServiceStatus", "Service") %>/';

        var alarmsound = '<%=this.ResolveClientUrl("~/Content/audio/siren_1.mp3") %>';
        var flash_dir = '<%=this.ResolveClientUrl("~/Content/flash/") %>';
    </script>

    <script src="<%= Url.Content("~/Content/script/yawamt.audio.js")%>" type="text/javascript"></script>

    <div class="error">
        <ul>
        <li>errors</li>
        </ul>
    </div>

    <div class="about">
        <div id="menu">
            <img src="<%=this.ResolveClientUrl("~/Content/images/about.png") %>" alt="Info" title="Info" class="menu-about" />
            <img src="<%=this.ResolveClientUrl("~/Content/images/stats.png") %>" alt="Statistieken" title="Statistieken" 
                class="menu-stats" />
            <a target="_blank" href="<%=this.ResolveClientUrl("~/Home/Feed") %>"><img src="<%=this.ResolveClientUrl("~/Content/images/feed.png") %>" alt="Feed" title="Feed" 
                class="menu-feed" /></a>
            <img src="<%=this.ResolveClientUrl("~/Content/images/audio.png") %>" alt="Preview alarm" title="Preview alarm" 
                class="menu-audio" />
            <img src="<%=this.ResolveClientUrl("~/Content/images/newurl.png") %>" alt="Voeg url toe" title="Voeg url toe" 
                class="menu-new" />
            <a target="_blank" href="<%=this.ResolveClientUrl("~/Data/Settings/Listdetails.aspx") %>"><img src="<%=this.ResolveClientUrl("~/Content/images/feed.png") %>" alt="Instellingen" title="Instellingen" 
                class="menu-feed" /></a>
        </div>
        <span id="error-indicator">errors</span>
        
        <div id="lastupdate">
            laatste statusupdate website: <em class="date" title="" id="webupdate"></em><br />
            laatste pulse service: <em class="date" title="" id="servicelaatste"></em><br />
            volgende pulse service: <em class="date" title="" id="servicevolgende"></em>
        </div>
        <img src="<%=this.ResolveClientUrl("~/Content/images/yawamt.png") %>" title="yawamt" id="yawamt-logo"
            alt="yawamt" />
    </div>
    
    <div id="info">
        <p>Yet Another Web App Monitoring Tool v0.5</p>
        <p>
            <a href="http://www.codeplex.com/yawamt">codeplex.com/yawamt</a>
        </p>
        <p>
            Using the following components
            <ul>
                <li><a target="_blank" href="http://www.microsoft.com/netherlands/sql/default.aspx">
                    SQL Server</a></li>
                <li><a target="_blank" href="http://asp.net/">ASP.NET v3.5</a></li>
                <li><a target="_blank" href="http://asp.net/mvc/">ASP.NET MVC</a></li>
                <li><a target="_blank" href="http://asp.net/dynamicdata/">ASP.NET Dynamic Data</a></li>
                <li><a target="_blank" href="http://www.jquery.com">jQuery (<a target="_blank" href="http://jquery.offput.ca/every/">timers</a>,
                    <a target="_blank" href="http://www.mathias-bank.de/2006/10/30/jquery-plugin-fit2box/">
                        fit2Box</a>, <a target="_blank" href="http://plugins.jquery.com/project/TinySort">tinysort</a>,
                    <a target="_blank" href="http://dev.jquery.com/browser/trunk/plugins/sound/jquery.sound.js?rev=5750">
                        sound</a>)</li>
                <li><a target="_blank" href="http://www.schillmania.com/projects/soundmanager2/doc/#smsoundmethods">SoundManager 2</a></li>
                <li><a target="_blank" href="http://simplythebest.net/sounds/MP3/events_MP3/alarm_mp3.html">Example alarm sounds</a></li>
                <li><a target="_blank" href="http://www.iconarchive.com/">iconarchive</a>
                    <ul>
                        <li><a target="_blank" href="http://www.aha-soft.com/">aha-soft</a> (pie-chart)</li>
                        <li><a target="_blank" href="http://www.devcom.com/">devcom</a> (globe, signal)</li>
                        <li><a target="_blank" href="http://www.rubysoftware.nl/">rubysoftware</a> (save, new, break, play, about)</li>
                    </ul>
                </li>
            </ul>
        </p>
    </div>
    
    <!--
pie-chart    http://www.iconarchive.com/show/business-icons-by-aha-soft/pie-chart-icon.html

http://www.aha-soft.com/

globe        http://www.iconarchive.com/show/network-icons-by-devcom/globe-Vista-icon.html
antenne      http://www.iconarchive.com/show/network-icons-by-devcom/signal-Vista-icon.html

http://www.devcom.com/

break        http://www.iconarchive.com/show/toolbar-icons-by-ruby-software/break-icon.html
save         http://www.iconarchive.com/show/toolbar-icons-by-ruby-software/save-icon.html
new          http://www.iconarchive.com/show/toolbar-icons-by-ruby-software/new-icon.html
about        http://www.iconarchive.com/show/toolbar-icons-by-ruby-software/about-icon.html
play         http://www.iconarchive.com/show/toolbar-6-icons-by-ruby-software/play-icon.html

http://www.rubysoftware.nl/    



Software License Agreement (BSD License)

Copyright (c) 2007, Scott Schiller (schillmania.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this 
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of schillmania.com nor the names of its contributors may be
  used to endorse or promote products derived from this software without
  specific prior written permission from schillmania.com.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    -->
    
</body>
</html>
