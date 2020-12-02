
 import { numberofques } from 'Addition.js'
 import { correctques } from 'Addition.js'


      google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['correct',     11],
          ['incorrect',    7]
        ]);

        var options = {
          title: 'Progress',
          pieHole: 0.4,

        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
        chart.draw(data, options);
      }
