import {MnistData} from './datas.js';
var canvas, context, saveButton, clearButton;
var pos = {x:0, y:0};
var rawimage;
var model;
	
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

function save() {
	var raw = tf.browser.fromPixels(rawimage,1);
	var resized = tf.image.resizeBilinear(raw, [28,28]);
	var tensor = resized.expandDims(0);
    var predicted = model.predict(tensor);
    var pIndex = tf.argMax(predicted, 1).dataSync();
    
	alert(pIndex);
}

function position(e){
	pos.x = e.clientX-100;
	pos.y = e.clientY-100;
}

function erase() {
	context.fillStyle = "black";
	context.fillRect(0,0,280,280);
}

async function runmodel() {  
	const data = new MnistData();
	await data.load();
	const model = TFModel();
	await train(model, data);
	initialise();
	alert("Training complete. Classify your handwriting!");
}
    
function initialise() {
	canvas = document.getElementById('canvas');
	rawimage = document.getElementById('canvasimage');
	context = canvas.getContext("2d");
	context.fillStyle = "black";
	context.fillRect(0,0,280,280);
	canvas.addEventListener("mousemove", drawing);
	canvas.addEventListener("mousedown", position);
	canvas.addEventListener("mouseenter", position);
	saveButton = document.getElementById('checker');
	saveButton.addEventListener("click", save);
	clearButton = document.getElementById('clearer');
	clearButton.addEventListener("click", erase);
}

document.addEventListener('DOMContentLoaded', runmodel);
