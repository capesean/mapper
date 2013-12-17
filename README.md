mapper.js
=========

A JQuery UI plugin that easily draws shapes on Google Maps.



Code4SA Overview
----------------

There's a lot of interesting data at provincial, district, municipal & ward level that would be great to visualise on a map, eg: IEC data (especially with upcoming elections), and the recent Census data.

Mapping the data is not entirely easy. The MDB provides shape files, which are tricky to work with, and are huge (50MB+) as they store every boundary point.

Loading them into Fusion Tables is a good idea, but there are limits (2kb) on the query string that you use to filter or style the data; so you can't colour each municipality, for example. Plus if you're working in Javascript, the data feels "separated" when stored up in Fusion Tables.

So the idea was to build a JQuery plugin, that would make it easy to create a map at one of the above levels, and style the shapes (areas) with the Google Maps styling options.

Hence: mapper.js

The mapper.js plugin stores simplified shape file data in JSON format, and uses this data to draw the shapes on Google Maps. The biggest file is 10MB for the full wards file; however, the wards are also stored in separate files by province, ranging from 0.5MB to 2.5MB in size. (It's recommended to use these files, rather than the full ward file.)

Demo
----

For a working demo with several different examples, see: http://www.capesean.co.za/mapper


