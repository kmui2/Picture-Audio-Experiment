function runExperiment(trials, subjCode) {
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
        text: `<h1>TYP_v2</h1>
        <p>Welcome to the experiment. Thank you for participating! Press SPACE to begin.</p>`
    };

    timeline.push(welcome_block);



    let instructions = {
        type: "instructions",
        key_forward: ' ',
        key_backward: 8,
        pages: [
            `<p>In this experiment, you will hear various words or sounds - such as the word 'cat' or
            the sound of a cat meowing - and see pictures of those animals or objects. Sometimes the sound you hear will match the picture. For example, you'll hear a car honking 
            and then see a picture of a car. Other times, the picture you see will not match the sound.
            </p> ${continue_space}`,

            `<p>Your task is to decide as quickly as possible if the word or sound you hear matches the
            picture you see. For example, if you hear the word 'bird' and see a picture of a bird, you
            will press the button for 'Yes', but if you see a picture of a dog, you will press the button
            for 'No</p> ${continue_space}`,

            `<p>Please concentrate and see how quickly you can answer the questions. If you make a mistake,
            you will hear a buzzing sound. If you are making many mistakes, you might be rushing. Let the
            experimenter know when you have completed reading these instructions.
            </p> ${continue_space}`,
            
            `<p>Press the '/' key for 'Yes' and the 'z' key for 'No'.
            </p> ${continue_space}`
        ]
    };

    timeline.push(instructions);

    _.forEach(trials, (trial) => {
        let nested_timeline = [];
        let response = {
            Name: subjCode,
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
            stimulus: 'img/speaker_icon.png',
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