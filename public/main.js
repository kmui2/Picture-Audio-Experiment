
$(document).ready(function(){

    // This listens to the form on-submit action
    $("form").submit(function(){

        // Define your workerId, assignmentId, and hitId here
        let subjCode = $("#subjCode").val().slice();

        $("form").remove();
        $("#loading").html('Loading trials... please wait. </br> <img src="img/preloader.gif">')

        // This calls server to run python generate trials (judements.py) script
        // Then passes the generated trials to the experiment
        $.ajax({
            url: '/trials',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({subjCode: subjCode}),
            success: function (trials) {
                console.log(trials);
                runExperiment(trials, subjCode);
            }
        })
    });
    

});

//preloader