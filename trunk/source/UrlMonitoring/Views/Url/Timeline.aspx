<%@ Page ContentType="text/xml" Language="C#" AutoEventWireup="true" CodeBehind="Timeline.aspx.cs" Inherits="YAWAMT.Web.Views.Url.Timeline" %>
<data>
<% 
if (ViewData["events"] != null)
{
    foreach (YAWAMT.TimelineEvent e in (ViewData["events"] as List<YAWAMT.TimelineEvent>))
    { 
%>
    <event start="<%=e.Begintijd%>" end="<%=e.Eindtijd %>" isDuration="<%=e.Duration %>" classname="<%= e.CSSClass %>" title="<%= e.Title %>">
        <%= HttpUtility.HtmlEncode(e.Description) %>
    </event>
<% 
    }
}
%>
</data>
