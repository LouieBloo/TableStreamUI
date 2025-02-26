import { Component, Input, OnInit } from '@angular/core';
import ApexCharts from 'apexcharts'

@Component({
  selector: 'app-bar-graph',
  standalone: true,
  imports: [],
  templateUrl: './bar-graph.component.html',
  styleUrl: './bar-graph.component.css'
})
export class BarGraphComponent {
  chart: any;

  @Input() seriesName: string = "";
  @Input() id: string = "";
  @Input() yAxis: number[]|null = [];
  @Input() xAxis: string[]|null = [];

  constructor(){}

  ngAfterViewInit(){
    let chartConfig = {
      series: [
        {
          name: this.seriesName,
          data: this.yAxis
        },
      ],
      chart: {
        type: "bar",
        height: 240,
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#020617"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 2,
        },
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: this.xAxis,
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    };
    this.chart = new ApexCharts(document.querySelector(`#${this.id}`), chartConfig);
    this.chart.render();

  }

  }

