

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