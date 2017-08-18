// Function Call to Run the experiment
function runExperiment(trials, subjCode, workerId, assignmentId, hitId, whichyes) {
    let whichno = whichyes=="z" ? "/": "z";
    let whichyesKey = whichyes=="z" ? 90 : 191;
    let whichnoKey = whichyes=="z" ? 191 : 90;
    let timeline = [];

    // Sounds to play for audio trials
    let bleep = new Audio('stimuli/sounds/bleep.wav');
    let buzz = new Audio('stimuli/sounds/buzz.wav');

    // Data that is collected for jsPsych
    let turkInfo = jsPsych.turk.turkInfo();
    let participantID = makeid() + 'iTi' + makeid()

    jsPsych.data.addProperties({
        subject: participantID,
        condition: 'explicit',
        group: 'shuffled',
        workerId: workerId,
        assginementId: assignmentId,
        hitId: hitId
    });

    let welcome_block = {
        type: "text",
        cont_key: ' ',
        text: `<h1>TYP_v2</h1>
        <p>Welcome to the experiment. Thank you for participating! Press SPACE to begin.</p>`
    };

    timeline.push(welcome_block);

    let continue_space = "<div class='right small'>(press SPACE to continue, or BACKSPACE to head back)</div>";

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

            `<p>Press the '${whichyes}' key for 'Yes' and the '${whichno}' key for 'No'.
            </p> ${continue_space}`
        ]
    };

    timeline.push(instructions);

    // Pushes each audio trial to timeline
    _.forEach(trials, (trial) => {
        
        // Empty Response Data to be sent to be collected
        let response = {
            subjCode: subjCode,
            seed: '101',    //seed can be changed in TYP_genTrials.py file
            whichYes: 'z',
            data: "subject",
            initials: 'gl',
            cueCategory: trial.cueCategory,
            cueType: trial.cueType,
            cueAnimate: trial.cueAnimate,
            picCategory: trial.picCategory,
            picType: trial.picType,
            picAnimate: trial.picAnimate,
            picFile: trial.picFile,
            soa : trial.soa,
            isMatch: trial.isMatch,
            sameAnimacy: trial.sameAnimacy,
            block: trial.block,
            whichPart: 'test',
            curTrialIndex: 0,
            expTimer : -1,
            isRight: -1,
            rt: -1,
            workerId: workerId,
            assignmentId: assignmentId,
            hitId: hitId,
            screenRes: screen.width+'x'+screen.height,
            windowSize: screen.availWidth+'x'+screen.availHeight,
            whichyes: whichyes
        }	

        // Audio plays for its duration plus variable delay
        let audioTrial = {
            type: 'single-audio',
            stimulus: 'stimuli/sounds/' + trial.soundFile+'.wav',
            timing_response: 600 + Number(trial.soa) *1000
        }
        
        timeline.push(audioTrial);

        // Picture Trial
        let pictureTrial = {
            type: 'multi-stim-multi-response',
            stimuli: ['stimuli/pictures/'+trial.picFile+'.jpg'],
            choices: [[90,191]],
            timing_stim: [-1],
            timing_post_trial: 1000,
            on_finish: function (data) {
                
                // Check for match
                let key = data.key_press.replace(/\D+/g, '');   // Keeps only digits
                if ((trial.isMatch == 1 && key == whichyesKey) || (trial.isMatch == 0 && key == whichnoKey)) {
                    bleep.play();
                    response.isRight = '1';
                }
                else{
                    buzz.play();
                    response.isRight ='0';
                }

                response.rt = data.rt.replace(/\D+/g, '');
                response.expTimer = data.time_elapsed / 1000;

                response.screenRes = screen.width+'x'+screen.height,
                response.windowSize = $(window).width()+'x'+$(window).height()

                // POST response data to server
                $.ajax({
                    url: '/data',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(response),
                    success: function () {
                        console.log(response);
                    }
                })
            }
        }
        timeline.push(pictureTrial);
    })


    let endmessage = `Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
        MTurk to get paid. If you have any questions or comments, please email jsulik@wisc.edu.`



    jsPsych.init({
        default_iti: 0,
        timeline: timeline,
        fullscreen: true,
        on_finish: function (data) {
            jsPsych.endExperiment(endmessage);
        }
    });
}