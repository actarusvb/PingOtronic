
$( document ).ready(function() {
	var chart;
	const elapsed=$("#duration").text();
	const d = new Date();
	const y=d.getFullYear().toString().padStart(4, '0');
	const m=(d.getMonth()+1).toString().padStart(2, '0');
	const dy=d.getDate().toString().padStart(2, '0');
	const h =d.getHours().toString().padStart(2, '0');
	const mn=d.getMinutes().toString().padStart(2, '0');
	const strNow=[[y,m,dy].join("-"),[h,mn].join(":")].join("T");
	const strMax=[[y,m,dy].join("-"),['23','59'].join(":")].join("T");

	$("#stop-time").attr("max",strMax);
	$("#stop-time").attr("value",strNow);

	const sd = new Date(d-elapsed);
	const sy=sd.getFullYear().toString().padStart(4, '0');
	const sm=(sd.getMonth()+1).toString().padStart(2, '0');
	const sdy=sd.getDate().toString().padStart(2, '0');
	const sh =sd.getHours().toString().padStart(2, '0');
	const smn=sd.getMinutes().toString().padStart(2, '0');
	const sstrNow=[[sy,sm,sdy].join("-"),[sh,smn].join(":")].join("T");
	const sstrMax=[[sy,sm,sdy].join("-"),['23','59'].join(":")].join("T");

	$("#start-time").attr("max",sstrMax);
	$("#start-time").attr("value",sstrNow);

	function go(){
		$("#info").text("Waiting for data...x");	
		const ctx = document.getElementById('myChart');
		chart=new Chart(ctx,{
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					showLine: true,
					label: $("#hostip").text(),
					fill: true,
					lineTension: 0.1,
					backgroundColor: "rgba(75,192,192,0.4)",
					borderColor:  "rgba(75,122,192,1)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(75,192,192,1)",
					pointBackgroundColor: "#fff",
					pointHoverBorderWidth: 2,
					data: [],
				}]
			},
			options: {
				scales: {
					x: {
						type: 'time',
					}
				}
			}
		});

		const url="/chart/"+$("#hostip").text()+"/"+$("#start-time").val()+"/"+$("#stop-time").val();
		console.log(url)
		var jqxhr = $.get(url , function(dati) {
			$("#info").text("received "+dati.label.length+" records");	
			
			chart.data.labels = dati.label;
			chart.data.datasets[0].data = dati.data;
			chart.update();
		})
		.fail(function() {
			alert( "error" );
		});
	}
	$("#goBtn").on("click",function(){
		chart.destroy();
		go();
	});
	$("#closeThis").on("click",function(){
		window.close();
	});
	go();
})
