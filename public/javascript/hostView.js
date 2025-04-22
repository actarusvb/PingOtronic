

$( document ).ready(function() {
	let host = new DataTable('#hostsTable',{
		lengthMenu: [
			[20, 60, 90, -1],
			[20, 60, 90, 'All']
		]
	});
	let badhost = new DataTable('#badHostsTable',{
		lengthMenu: [
			[20, 60, 90, -1],
			[20, 60, 90, 'All']
		]
	});
	const url="/processCtrlStatus";
	$.ajax({
	  method: "GET",
	  url: url,
	})	
	.done(function( msg ) {
		if(msg.status){
			$("#processStatus").removeClass("backGroudRed").addClass("backGroudGreen");
		}else{
			$("#processStatus").removeClass("backGroudGreen").addClass("backGroudRed");
		}
	})
	.fail(function() {
		alert( "error" );
	});
	
	$("#processStart").on("click",function(){
		console.log("request process start");
		const url="/processCtrl/";
		$.ajax({
		  method: "GET",
		  url: url+"run",
		})	
		.done(function( msg ) {
			// alert( "request Done: " + msg.result );
			location.reload();
		})
		.fail(function() {
			alert( "error" );
		});
	});
	
	$("#processStop").on("click",function(){
		console.log("request process stop");
		const url="/processCtrl/";
		$.ajax({
		  method: "GET",
		  url: url+"stop",
		})	
		.done(function( msg ) {
			// alert( "request Done: " + msg.result );
			location.reload();
		})
		.fail(function() {
			alert( "error" );
		});
	});
	
	$("#saveBtn").on("click",function(){
		console.log("Save File",$("#cfg").val());
		const url="/hostsWrite";
		$.ajax({
		  method: "POST",
		  url: url,
		  data: { fileCnt: $("#cfg").val()}
		})	
		.done(function( msg ) {
			alert( "Data Saved: " + msg.result );
			location.reload();
		})
		.fail(function() {
			alert( "error" );
		});
	});
});