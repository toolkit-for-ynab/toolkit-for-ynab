# Upgrading HighCharts
Toolkit Reports make use of HighCharts.js for all of the charting. Rather than
loading the library from the internet, we just bundle it directly into the Toolkit
and load it when the Reports feature is enabled.

If you ever want to update HighCharts, simply grab their latest version from:

Core:
https://code.highcharts.com/highcharts.js

Drilldown:
https://code.highcharts.com/modules/drilldown.js

And concatenate them into the lib file that gets loaded into the extension:

`src/extension/legacy/lib/highcharts-<version>/highcharts.js`

Note: HighCharts has a fancy build tool that we may be able to leverage one day that
lives [here](https://www.highcharts.com/download) but I've yet to figure out which
dependencies we need so for now we just throw the entire library into the toolkit.
