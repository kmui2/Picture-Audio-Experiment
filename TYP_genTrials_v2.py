#!/usr/bin/env python
import random
import sys

categories = ['baby','bee','bird','dog','cat','key','chain','bowling','car','scissors']
isAnimate = {	'baby':1,'bee':1,'bird':1,'dog':1,'cat':1,
				'key':0,'chain':0,'bowling':0,'car':0,'scissors':0	}
cueTypes = ['sound','label']
onsets = [0.200,1.500]
picTypes = ['label','sound','both','neither']


def circularList(lst,seed):
	if not isinstance(lst,list):
		lst = range(lst)
	i = 0
	random.seed(int(seed))
	random.shuffle(lst)
	while True:
		yield lst[i]
		if (i+1) % len(lst) == 0:
			random.shuffle(lst)
		i = (i + 1)%len(lst)

def randomButNot(cat,sameAnimacy):
	randIndex = categories.index(cat)
	if sameAnimacy == 1:
		while randIndex == categories.index(cat) or not isAnimate[categories[randIndex]] == isAnimate[cat]:
			randIndex = random.randint(0, len(categories)-1)
	else:
		while randIndex == categories.index(cat) or isAnimate[categories[randIndex]] == isAnimate[cat]:
			randIndex = random.randint(0, len(categories)-1)
	return categories[randIndex]


def	main(subjCode,seed):

	#Number of trials/blocks calculations
	percentMatch = 75.0
	matchLength = len(categories)*len(cueTypes)*len(onsets)*len(picTypes)
	nonMatchLength = int(matchLength*((100-percentMatch)/percentMatch))
	blockLength = matchLength + nonMatchLength
	maxTrials = 450
	blocks = maxTrials/blockLength

	#Generators for the nonmatching trials
	random.seed(int(seed))
	nonmatchType = circularList([1,0],random.randint(1,100))
	catGen = circularList(categories,random.randint(1,100))
	cueGen = circularList(cueTypes,random.randint(1,100))
	onsetsGen = circularList(onsets,random.randint(1,100))
	picGen = circularList(picTypes,random.randint(1,100))

	header = ['cueCategory', 'cueType', 'cueAnimate', 'soundFile', 'picCategory', 'picType', 'picAnimate', 'picFile', 'soa', 'isMatch', 'sameAnimacy', 'block']
	separator = ','

	testFile = open('trials/trials_'+subjCode+'.csv','w')
	print >> testFile, separator.join(header)
	random.seed(int(seed))
	
	block = []
	
	#Append all possible matching trials
	for cat in categories:
		for cue in cueTypes:
			for soa in onsets:
				for pic in picTypes:
					cueFile = '%s_%s' % (cat,cue)
					picFile = '%s_pic_%s' % (cat,pic)
					animate = isAnimate[cat]
					sameAnimacy = '*'
					isMatch = 1
					newTrial = map(str,(cat, cue, animate, cueFile, cat, pic, animate, picFile, soa, isMatch, sameAnimacy))
					block.append(separator.join(newTrial))
	
	#Append enough nonmatching trials to match the percentMatch 
	for i in range(nonMatchLength):
		cat = catGen.next()
		cue = cueGen.next()
		cueAnimate = isAnimate[cat]
		cueFile = '%s_%s' % (cat,cue)
		sameAnimacy = nonmatchType.next()
		picCat = randomButNot(cat,sameAnimacy)
		pic = picGen.next()
		picAnimate = isAnimate[picCat]
		picFile = '%s_pic_%s' % (picCat,pic)
		soa = onsetsGen.next()
		isMatch = 0
		newTrial = map(str,(cat, cue, cueAnimate, cueFile, picCat, pic, picAnimate, picFile, soa, isMatch, sameAnimacy))
		block.append(separator.join(newTrial))
				
	for b in range(blocks):
		random.shuffle(block)
		for curTrial in block:
			print >> testFile, separator.join((curTrial,str(b)))
					
	return True

if __name__ == "__main__":
	if (len(sys.argv) != 2):
		print 'Usage: python TYP_genTrials_v2.py <subjCode>'
		quit()
	trialList = main(sys.argv[1],101)
	print trialList
