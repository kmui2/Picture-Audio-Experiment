#!/usr/bin/env python
############################
#  Import various modules  #
############################
import time, os
from baseDefsPsychoPy import *
from stimPresPsychoPy import *
import TYP_genTrials_v2 as genTrials

#Open Google survey at the end of the experiment
import webbrowser as web

class Exp:
	def __init__(self):
		self.expName = 'TYP_v2'
		self.surveyURL = 'https://docs.google.com/spreadsheet/viewform?formkey=dEFiTS1yVWMwUGJhR0RPWWRHVWJDVlE6MA'
		self.path = os.getcwd()
		self.subjInfo = {
				'1':  {	'name' : 'subjCode',
						'prompt' : 'EXP_XXX',
						'options': 'any',
						'default':self.expName+'_101'},
				'2':  {	'name' : 'seed',
						'prompt' : 'Seed: ',
						'options': 'any',
						'default': 101},
				'3':  {	'name' : 'whichYes',
						'prompt' : 'Which Yes: ',
						'options': ['z', 'slash'],
						'default': 'slash'},
				'4' : {	'name' : 'data',
						'prompt' : 'subject / practice',
						'options' : ("subject","practice"),
						'default':'subject'},
				'5' : {	'name' : 'initials',
						'prompt' : 'experimenter initials',
						'options' : 'any',
						'default' : ''}
				}

		optionsReceived = False
		fileOpened = False
		while not fileOpened:
			[optionsReceived, self.subjVariables] = enterSubjInfo(self.expName, self.subjInfo)
			if not optionsReceived:
				popupError(self.subjVariables)
			elif self.subjVariables['data'] == 'practice':
				fileOpened = True
				self.subjVariables['subjCode'] = 'XXX'
				self.outputFile = open('data/'+self.subjVariables['subjCode']+'_test.txt','w')
			elif not os.path.isfile('data/'+self.subjVariables['subjCode']+'_test.txt'):
				fileOpened = True
				self.outputFile = open('data/'+self.subjVariables['subjCode']+'_test.txt','w')
			else:
				fileOpened = False
				popupError('That subject code already exists!')
				
		self.inputDevice="keyboard"
		if self.subjVariables['whichYes']=='slash':
			self.validResponses = {'0':'z','1':'slash'} #change to whatever keys you want to use
			responseInfo = " Press the '/' key for 'Yes' and the 'z' key for 'No'."
		elif self.subjVariables['whichYes']=='z':
			self.validResponses = {'1':'z','0':'slash'} #change to whatever keys you want to use
			responseInfo = " Press the 'z' key for 'Yes' and the '/' key for 'No'."		
		breakInfo = "Press any key to continue."
			
		self.win = visual.Window(fullscr=True, color=[.6,.6,.6], allowGUI=False, monitor='testMonitor', units='pix', winType='pyglet')
		try:
			winsound
			print "Using winSound..."
			self.soundType = 'winSound'
			self.hasWinSound = True
		except NameError:
			print "winSound not found..."
			self.soundType = 'sound'
			self.hasWinSound = False

		genTrials.main(self.subjVariables['subjCode'], self.subjVariables['seed'])
		#populate survey with subject code
		self.surveyURL += '&entry_0='+self.subjVariables['subjCode']
		
		self.preFixationDelay  = 	1.000
		self.postFixationDelay  = 	0.250

		self.stimPositions = {'center':(0,0)}		
		self.numPracticeTrials = 6
		self.takeBreakEveryXTrials = 100

		self.instructions = \
"""
Thank you for participating!
	In this experiment, you will hear various words or sounds - such as the word 'cat' or
the sound of a cat meowing - and see pictures of those animals or objects. Sometimes the sound you hear will match the picture. For example, you'll hear a car honking 
and then see a picture of a car. Other times, the picture you see will not match the sound.

	Your task is to decide as quickly as possible if the word or sound you hear matches the
picture you see. For example, if you hear the word 'bird' and see a picture of a bird, you
will press the button for 'Yes', but if you see a picture of a dog, you will press the button
for 'No'.

	Please concentrate and see how quickly you can answer the questions. If you make a mistake,
you will hear a buzzing sound. If you are making many mistakes, you might be rushing. Let the
experimenter know when you have completed reading these instructions.

"""
		self.instructions+=responseInfo+breakInfo

		self.takeBreak = "Please take a short break.\n\n" + breakInfo
		self.practiceTrials = "The first few trials are practice.\n\n" + breakInfo
		self.realTrials = "Now you will start the real trials! Remember to respond as quickly and accurately as you can.\n\n" + breakInfo
		self.finalText = \
"""
You've come to the end of the experiment! 

A short survey should appear on the screen when you exit the experiment with the first two
questions filled in. If the survey does not appear on your screen, or the first two answers
are not already filled in, please alert the experimenter. Thank you for participating!

""" + breakInfo
			
class trial(Exp):
	def __init__(self):
		firstStim=''
	
class ExpPresentation(trial):
	def __init__(self,experiment):
		self.experiment = experiment

	def initializeExperiment(self):
		self.expTimer = core.Clock()
		showText(self.experiment.win, "Loading files...", color="black", waitForKey=False)
		self.pictureMatrix = loadFiles('stimuli/pictures', ['jpg','png'], 'image', self.experiment.win)
		
		self.soundMatrix = loadFiles('stimuli/sounds','wav',self.experiment.soundType)
		
		(self.trialListMatrix, self.fieldNames) = importTrials('trials/trials_'+self.experiment.subjVariables["subjCode"]+'.csv', method="sequential")
		self.fixSpot = visual.TextStim(self.experiment.win,text="+",height = 50,color="black")

	def checkExit(self):
		if event.getKeys() == ['equal','equal']:
			sys.exit("Exiting experiment...")
	
	"""
	#use playAndWait from stimPresPsychopy
	def playAndWait(self,sound,winSound=False):
		if winSound:
			soundFile = self.experiment.path + "/stimuli/sounds/" + sound +".wav"
			winsound.PlaySound(soundFile, winsound.SND_FILENAME|winsound.SND_ASYNC)
			return
		else:
			sys.exit("No winSound...")
	"""
	def giveFeedback(self,isRight):
		if isRight == 1:
			playAndWait(self.soundMatrix['bleep'], winSound=self.experiment.hasWinSound)
		else:
			playAndWait(self.soundMatrix['buzz'], winSound=self.experiment.hasWinSound)
		
			
	def presentTestTrial(self, whichPart, curTrial, curTrialIndex):
		self.checkExit()
		core.wait(self.experiment.preFixationDelay)
		setAndPresentStimulus(self.experiment.win, self.fixSpot) #show fixation cross
		core.wait(self.experiment.postFixationDelay)
		self.curPic = self.pictureMatrix[curTrial['picFile']][0]
		
		self.experiment.win.flip()
		playAndWait(self.soundMatrix[curTrial['soundFile']], winSound=self.experiment.hasWinSound)
		core.wait(float(curTrial['soa']))
		setAndPresentStimulus(self.experiment.win,self.curPic)
		
		correctResp = self.experiment.validResponses[str(curTrial['isMatch'])]
		(response,rt) = getKeyboardResponse(self.experiment.validResponses.values())
		
		isRight = 0
		if response == correctResp:
			isRight = 1
		self.giveFeedback(isRight)
		self.experiment.win.flip()
		
		fieldVars=[]
		for curField in self.fieldNames:
			fieldVars.append(curTrial[curField])
		[header, curLine] = createRespNew(self.experiment.subjInfo, self.experiment.subjVariables, self.fieldNames, fieldVars,
										a_whichPart = whichPart,
										b_curTrialIndex = curTrialIndex,
										c_expTimer = self.expTimer.getTime(),
										d_isRight = isRight,
										e_rt = rt*1000)
		writeToFile(self.experiment.outputFile,curLine)
		
		if curTrialIndex==0 and not whichPart=='practice':
			print "Writing header to file..."
			dirtyHack = {}
			dirtyHack['trialNum']=1
			writeHeader(dirtyHack, header,'header_'+self.experiment.expName)
		
	def cycleThroughExperimentTrials(self,whichPart):
		curTrialIndex = 0
		if whichPart == "practice":
			trialIndices = random.sample(range(1,50),self.experiment.numPracticeTrials)
			for curPracticeTrial in trialIndices:
				self.presentTestTrial(whichPart, self.trialListMatrix.getFutureTrial(curPracticeTrial), curTrialIndex)
		else:
			for curTrial in self.trialListMatrix:
				if curTrialIndex>0 and curTrialIndex % self.experiment.takeBreakEveryXTrials == 0:
					showText(self.experiment.win, self.experiment.takeBreak, color=(0,0,0), inputDevice=self.experiment.inputDevice) #take a break
				self.presentTestTrial(whichPart, curTrial, curTrialIndex)
				curTrialIndex += 1
			self.experiment.outputFile.close()
			
currentExp = Exp()
currentPresentation = ExpPresentation(currentExp)
currentPresentation.initializeExperiment()
showText(currentExp.win,currentExp.instructions,color=(-1,-1,-1),inputDevice=currentExp.inputDevice) #show the instructions for test
showText(currentExp.win,currentExp.practiceTrials,color=(-1,-1,-1),inputDevice=currentExp.inputDevice)
currentPresentation.cycleThroughExperimentTrials("practice")
showText(currentExp.win,currentExp.realTrials,color=(-1,-1,-1),inputDevice=currentExp.inputDevice)
currentPresentation.cycleThroughExperimentTrials("test")
showText(currentExp.win,currentExp.finalText,color=(-1,-1,-1),inputDevice=currentExp.inputDevice) #thank the subject
web.open(currentExp.surveyURL)
