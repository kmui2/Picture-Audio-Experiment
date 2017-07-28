function runExperiment(trials, subjCode) {
    let timeline = [];
    let audioTimeline = [];
    let bleep = new Audio('stimuli/sounds/bleep.wav');
    let buzz = new Audio('stimuli/sounds/buzz.wav');
    bleep.play();

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
        // console.log(trial);
        // let response = {
        //     subjCode: subjCode,
        //     Datetime: moment().format('MMMM Do YYYY, h:mm:ss a'),
        //     Block_ix: trial[5],
        //     Trial_ix: trial[0],
        //     Sound_x: trial[1].match(/\d+/)[0],
        //     Sound_y: trial[2].match(/\d+/)[0],
        //     Reversed: trial[3],
        //     Category: trial[4],
        //     Similarity: -1,
        //     Notes: 'None',
        //     Repeat: -1,
        //     Response_time: -1,
        //     workerId: workerId,
        //     assignmentId: assignmentId,
        //     hitId: hitId
        // };
        let audioTrial = {
            type: 'single-audio',
            stimulus: 'stimuli/sounds/' + trial.soundFile+'.wav',
            timing_response: 3000
        }
        let block = {
            type: 'multi-stim-multi-response',
            stimuli: ['stimuli/pictures/'+trial.picFile+'.jpg'],
            choices: [[90,191]],
            timing_stim: [-1],
            prompt: 'Rate the similarity of the two sounds on a scale of 1-7 or repeat the trial',
            on_finish: function (data) {
                // response.Similarity = data.button_pressed + 1; 
                // response.Response_time = data.rt;
                // console.log(response);
                bleep.play();
            }
        }
        timeline.push(audioTrial);
        timeline.push(block);
        // $.ajax({
        //     url: '/record',
        //     type: 'POST',
        //     contentType: 'application/json',
        //     data: JSON.stringify(response),
        //     success: function (trials) {
        //         console.log(trials);
        //         runExperiment(trials);
        //     }
        // })
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