
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
                $("#loading").remove();

                // For parsing url params
                $.urlParam = function(name){
                    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    if (results==null){
                        return null;
                    }
                    else{
                        return decodeURI(results[1]) || 0;
                    }
                }

                let whichyes = Math.random() < 0.5 ? 'z' : '/';
                if ($.urlParam('whichyes')) {
                    console.log('set yes key manually to ' + $.urlParam('whichyes'));
                    whichyes = $.urlParam('whichyes');
                }
                else {
                    console.log('set yes key randomly to ' + whichyes);
                }
                runExperiment(data.trials, subjCode, workerId, assignmentId, hitId, whichyes);
            }
        })
    }); // Remove
    

});