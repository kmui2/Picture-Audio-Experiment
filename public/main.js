
$(document).ready(function(){

    // This listens to the form on-submit action
    $("form").submit(function(){    // Remove


        //////////////////////////////////////////
        // DEFINE workerId, hitId, assignmentId HERE
        //////////////////////////////////////////
        let subjCode = $("#subjCode").val().slice();
        let workerId = 'workerId';
        let assignmentId = 'assignmentId';
        let hitId = 'hitId';

        $("form").remove();
        $("#loading").html('Loading trials... please wait. </br> <img src="img/preloader.gif">')

        // This calls server to run python generate trials (judements.py) script
        // Then passes the generated trials to the experiment
        $.ajax({
            url: '/trials',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({subjCode: subjCode}),
            success: function (data) {
                console.log(data);
                runExperiment(data.trials, subjCode, workerId, assignmentId, hitId);
            }
        })
    }); // Remove
    

});