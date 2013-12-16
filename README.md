mapper
======

A JQuery UI plugin that easily draws shapes on Google Maps.



Code4SA Overview
================

There's a lot of interesting data at provincial, district, municipal & ward level that would be great to visualise on a map, eg: IEC data (especially with upcoming elections), and the recent Census data.

Mapping the data is not entirely easy. The MDB provides shape files, which are tricky to work with, and are huge as they store every boundary point.

Loading them into Fusion Tables is a good idea, but there are limits (2kb) on the query string that you use to filter or style the data; so you can't colour each municipality, for example. Plus if you're working in Javascript, the data feels "separated" when stored up in Fusion Tables.

So the idea was to build a JQuery plugin, that would make it easy to create a map at one of the above levels, and style the shapes (areas) with the Google Maps styling options.

Hence: mapper.js

For a working demo with several different examples, see: http://www.capesean.co.za/mapper


