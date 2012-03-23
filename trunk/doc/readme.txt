Yet Another Web App Monitoring Tool, 2009

overeemm@gmail.com
http://yawamt.codeplex.com/

>> Purpose:
The purpose of this tool is the monitoring of different web apps (urls so to say).
This monitoring is done in one place (through a windows service), but the results
can be viewed on different clients through the website.

Monitoring is done by examening the http status code returned by the url.
If this is different then the 200 OK message, downtime is registered.

Downtime comes in two flavors: hard and soft. Soft means that the downtime is not
yet confirmed by a X number of retries (X is configurable). Hard means that the downtime
is confirmed and thus critical.

>> Architecture:
As said, the application consists of two components: windows service and a website.
Both components use SQL Server 2005, the service pushes status into the database, the website
polls the database for status updates.

The application uses .NET framework 3.5, LINQ to SQL, JQuery, and some other things.

>> Roadmap (not in order of importance):
- WPF system tray client
- regular expression support, to check result for certain content
- e-mail (or sms) notifications
- better support for large number of URLS and different monitor sizes