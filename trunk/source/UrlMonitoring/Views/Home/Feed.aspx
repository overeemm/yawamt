<%@ Page ContentType="application/rss+xml" Language="C#" AutoEventWireup="true" CodeBehind="Feed.aspx.cs" Inherits="YAWAMT.Web.Views.Home.Feed" %><?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
<channel>
<title>yet another web app monitoring tool</title>
<link>http://<%= Request.Url.Host %></link>
<description>Status RSS feed for yawamt</description>
<lastBuildDate><%= DateTime.Now.ToUniversalTime().ToString("r") %></lastBuildDate>
<language>nl-NL</language>
<% 
if (ViewData["urllist"] != null)
{
    foreach (YAWAMT.UrlStatus s in (ViewData["urllist"] as List<YAWAMT.UrlStatus>)) { 
%>
    <item>
    <title>[<%=s.Down == null ? "fine" : s.Down.Value ? "error" : "warning"%>] <%= Html.Encode(s.Url.Naam) %></title>
    <link><%= Html.Encode( s.Url.UrlAsUri.ToString() ) %></link>
    <guid><%= s.Url.ID %></guid>
    <pubDate><%= DateTime.Now.ToUniversalTime().ToString("r")%></pubDate>
    <description>[<%=s.Down == null ? "fine" : s.Down.Value ? "error" : "warning"%>] &lt;a href=&quot;<%= Html.Encode( s.Url.UrlAsUri.ToString() ) %>&quot;&gt;<%= Html.Encode(s.Url.Naam) %>&lt;/a&gt;</description>
    </item>
<%  }
}
%>
</channel>
</rss>
