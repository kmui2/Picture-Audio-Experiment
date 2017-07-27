function runExperiment(trials, name, workerId, assignmentId, hitId) {
    let timeline = [];
    let audioTimeline = [];

    let turkInfo = jsPsych.turk.turkInfo();

    let participantID = makeid() + 'iTi' + makeid()
    
    jsPsych.data.addProperties({
        subject: participantID,
        condition: 'explicit',
        group: 'shuffled',
        workerId: turkInfo.workerId,
        assginementId: turkInfo.assignmentId,
        hitId: turkInfo.assignmentId
    });

    let continue_space = "<div class='right small'>(press SPACE to continue, or BACKSPACE to head back)</div>";

    let welcome_block = {
        type: "text",
        cont_key: ' ',
        text: `<h1>Judge the similarity between two sounds</h1>
        <p>Welcome to the experiment. Press SPACE to begin.</p>`
    };

    timeline.push(welcome_block);



    let instructions = {
        type: "instructions",
        key_forward: ' ',
        key_backward: 8,
        pages: [
            `<p>On each trial, you will hear two sounds played in succession. To help you distinguish them, during the first
            you will see the number 1, and during the second a number 2. After hearing the second sound, you will be asked 
            to rate how similar the two sounds are on a 7-point scale.</p> ${continue_space}`,

            `<p>A 7 means the sounds are nearly identical. That is, if you were to hear these two sounds played again, you would 
            likely be unable to tell whether they were in the same or different order as the first time you heard them. A 1 
            on the scale means the sounds are entirely different and you would never confuse them. Each sound in the pair 
            will come from a different speaker, so try to ignore differences due to just people having different voices. For 
            example, a man and a woman saying the same word should get a high rating.
            </p> ${continue_space}`,

            `<p>Please try to use as much of the scale as you can while maximizing the likelihood that if you did this again, you 
            would reach the same judgments. If you need to hear the sounds again, you can press 'r' to repeat the trial. If 
            one of the sounds is a non-verbal sound (like someone tapping on the mic), or if you only hear a single sound, 
            or if you are otherwise unable to judge the similarity between the sounds, press the 'e' key to report the error. 
            Pressing 'q' will quit the experiment. Your progress will be saved and you can continue later. Press the SPACEBAR 
            to begin the experiment.
            </p> ${continue_space}`
        ]
    };

    timeline.push(instructions);

    _.forEach(trials, (trial) => {
        let nested_timeline = [];
        let response = {
            Name: name,
            Datetime: moment().format('MMMM Do YYYY, h:mm:ss a'),
            Block_ix: trial[5],
            Trial_ix: trial[0],
            Sound_x: trial[1].match(/\d+/)[0],
            Sound_y: trial[2].match(/\d+/)[0],
            Reversed: trial[3],
            Category: trial[4],
            Similarity: -1,
            Notes: 'None',
            Repeat: -1,
            Response_time: -1,
            workerId: workerId,
            assignmentId: assignmentId,
            hitId: hitId
        };
        let audio1Trial = {
            type: 'single-audio',
            prompt: '<div class="center"><h1>' + (((response.Reversed) % 2) + 1) + '</h1><img src="img/speaker_icon.png" /></div>',
            stimulus: trial[1].slice(2),
            timing_response: 3000
        }

        let audio2Trial = {
            type: 'single-audio',
            prompt: '<div class="center"><h1>' + (((response.Reversed + 1) % 2) + 1) + '</h1><img src="img/speaker_icon.png" /></div>',
            stimulus: trial[2].slice(2),
            timing_response: 3000
        }

        let block = {
            type: 'button-response',
            stimulus:'img/speaker_icon.png',
            choices: ['1', '2', '3', '4', '5', '6', '7', 'Repeat'],
            timing_stim: [-1],
            prompt: 'Rate the similarity of the two sounds on a scale of 1-7 or repeat the trial',
            on_finish: function (data) {
                response.Repeat++;
                response.Similarity = data.button_pressed + 1; // buttons are 0 indexed
                response.Datetime = moment().format('MMMM Do YYYY, h:mm:ss a');
                response.Response_time = data.rt;
                console.log(response);
            }
        }

        if (trial[3] == 1) {
            nested_timeline.push(audio2Trial);
            nested_timeline.push(audio1Trial);
        } else {
            nested_timeline.push(audio1Trial);
            nested_timeline.push(audio2Trial);
        }
        nested_timeline.push(block);

        var repeat_trial = {
            timeline: nested_timeline,
            loop_function: function (data) {
                if (jsPsych.data.getLastTrialData().button_pressed == 7) {
                    console.log("repeated!");
                    return true;
                } else {
                    $.ajax({
                        url: '/record',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(response),
                        success: function (trials) {
                            console.log(trials);
                            runExperiment(trials);
                        }
                    })
                    return false;
                }
            }
        }
        timeline.push(repeat_trial);
    })


    let endmessage = `Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
            MTurk to get paid. If you have any questions or comments, please email jsulik@wisc.edu.`
    

    
    jsPsych.init({
        default_iti: 0,
        timeline: timeline,
        on_finish: function (data) {
            jsPsych.endExperiment(endmessage);
            console.log("finished initTimeline");

        }
    });
}