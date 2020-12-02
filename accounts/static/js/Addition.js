import {MnistData} from './Mnistdata.js';

export {numberofques};
export {correctques};
var canvas, canvas1, context, context1, checkButton, clearButton, nextQuestionButton;
var pos = {x:0, y:0};
var pos1 = {x:0, y:0};
var rawimage;
var rawimage1;
var model;
var correctanswer;
var numberofques=0;
var correctques=0;
	
function TFModel() {
	model = tf.sequential();

	model.add(tf.layers.conv2d({inputShape: [28, 28, 1], kernelSize: 3, filters: 8, activation: 'relu'}));
	model.add(tf.layers.maxPooling2d({poolSize: [2, 2]}));
	model.add(tf.layers.conv2d({filters: 16, kernelSize: 3, activation: 'relu'}));
	model.add(tf.layers.maxPooling2d({poolSize: [2, 2]}));
	model.add(tf.layers.flatten());
	model.add(tf.layers.dense({units: 128, activation: 'relu'}));
	model.add(tf.layers.dense({units: 10, activation: 'softmax'}));

	model.compile({optimizer: tf.train.adam(), loss: 'categoricalCrossentropy', metrics: ['accuracy']});

	return model;
}

async function train(model, data) {
	const metrics = ['loss', 'val_loss', 'accuracy', 'val_accuracy'];
	const container = { name: 'Model Training', styles: { height: '640px' } };
	const bSize = 512;
	const trainDataSize = 5500;
	const testDataSize = 1000;

	const [trainXs, trainYs] = tf.tidy(() => {
		const d = data.followingTrainingBatch(trainDataSize);
		return [
			d.xs.reshape([trainDataSize, 28, 28, 1]),
			d.labels
		];
	});

	const [testXs, testYs] = tf.tidy(() => {
		const d = data.followingTestingBatch(testDataSize);
		return [
			d.xs.reshape([testDataSize, 28, 28, 1]),
			d.labels
		];
	});

	return model.fit(trainXs, trainYs, {
		batchSize: bSize,
		validationData: [testXs, testYs],
		epochs: 20,
		shuffle: true,
	});
}
    
function drawing(e) {
	if(e.buttons!=1) return;
	context.beginPath();
	context.lineWidth = 24;
	context.lineCap = 'round';
	context.strokeStyle = 'white';
	context.moveTo(pos.x, pos.y);
	position(e);
	context.lineTo(pos.x, pos.y);
	context.stroke();
	rawimage.src = canvas.toDataURL('image/png');
}

function drawing1(e) {
	if(e.buttons!=1) return;
	context1.beginPath();
	context1.lineWidth = 24;
	context1.lineCap = 'round';
	context1.strokeStyle = 'white';
	context1.moveTo(pos1.x, pos1.y);
	position1(e);
	context1.lineTo(pos1.x, pos1.y);
	context1.stroke();
	rawimage1.src = canvas1.toDataURL('image/png');
}

function check() {
	numberofques+=1;
	var raw = tf.browser.fromPixels(rawimage,1);
	var resized = tf.image.resizeBilinear(raw, [28,28]);
	var tensor = resized.expandDims(0);
    var predicted = model.predict(tensor);
	var pIndex = tf.argMax(predicted, 1).dataSync();
	var raw1 = tf.browser.fromPixels(rawimage1,1);
	var resized1 = tf.image.resizeBilinear(raw1, [28,28]);
	var tensor1 = resized1.expandDims(0);
    var predicted1 = model.predict(tensor1);
	var pIndex1 = tf.argMax(predicted1, 1).dataSync();
	var c=Number(document.getElementById('num1').innerHTML)+Number(document.getElementById('num2').innerHTML);
	if(Number(pIndex)*10+Number(pIndex1)==c){
		correctques+=1;
		document.getElementById('answer').innerHTML ="Your answer is: "+(Number(pIndex)*10+Number(pIndex1))+". It is correct!";
		
	}
	else{
		document.getElementById('answer').innerHTML="Your answer is: "+(Number(pIndex)*10+Number(pIndex1))+". It is incorrect."
	}
	
}

function erase() {
	document.getElementById('answer').innerHTML=" ";
	context.fillStyle = "black";
	context.fillRect(0,0,280,280);
	context1.fillStyle = "black";
	context1.fillRect(0,0,280,280);
}

function newAdditionQuestion(){
    erase();
	const firstnumber=Math.floor(Math.random()*51);
	document.getElementById('num1').innerHTML = firstnumber;
	const secondnumber=Math.floor(Math.random()*50);
	document.getElementById('num2').innerHTML = secondnumber;
	correctanswer=firstnumber+secondnumber;
}

function position(e){
	pos.x = e.clientX-420;
	pos.y = e.clientY-130;
}

function position1(e){
	pos1.x = e.clientX-725;
	pos1.y = e.clientY-130;
}

async function runmodel() {  
	const data = new MnistData();
	await data.load();
	const model = TFModel();
	await train(model, data);
	initialise();
	alert("Training complete. Let's start the addition exercise!");
}

    
function initialise() {
	canvas = document.getElementById('canvas');
	canvas1 = document.getElementById('canvas1');
	rawimage = document.getElementById('canvasimage');
	rawimage1 = document.getElementById('canvasimage1');
	context = canvas.getContext("2d");
	context1 = canvas1.getContext("2d");
	context.fillStyle = "black";
	context.fillRect(0,0,280,280);
	context1.fillStyle = "black";
	context1.fillRect(0,0,280,280);
	canvas.addEventListener("mousemove", drawing);
	canvas.addEventListener("mousedown", position);
	canvas.addEventListener("mouseenter", position);
	canvas1.addEventListener("mousemove", drawing1);
	canvas1.addEventListener("mousedown", position1);
	canvas1.addEventListener("mouseenter", position1);
	checkButton = document.getElementById('checker');
	checkButton.addEventListener("click", check);
	clearButton = document.getElementById('clearer');
	clearButton.addEventListener("click", erase);
	nextQuestionButton = document.getElementById('next');
	nextQuestionButton.addEventListener("click", newAdditionQuestion);
}

document.addEventListener('DOMContentLoaded', runmodel);