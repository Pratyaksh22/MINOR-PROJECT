const imgSize = 784;
const classNum = 10;
const datasetElements = 65000;
const ratio = 5 / 6;
const trainingElements = Math.floor(ratio * datasetElements);
const testingElements = datasetElements - trainingElements;
const spritePath = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const labelPath = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';
export class MnistData {
  constructor() {
    this.trainIndexShuffled = 0;
    this.testIndexShuffled = 0;
  }
  
  async load() {
    const image = new Image();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imageRequest = new Promise((resolve, reject) => {
      image.crossOrigin = '';
      image.onload = () => {
        image.width = image.naturalWidth;
        image.height = image.naturalHeight;
        const datasetBytes = new ArrayBuffer(datasetElements * imgSize * 4);
        const chunksSize = 5000;
        canvas.width = image.width;
        canvas.height = chunksSize;
        for (let i = 0; i < datasetElements / chunksSize; i++) {
          const datasetByteView = new Float32Array(
              datasetBytes, i * imgSize * chunksSize * 4,
              imgSize * chunksSize);
          context.drawImage(
              image, 0, i * chunksSize, image.width, chunksSize, 0, 0, image.width,
              chunksSize);
          const imageDetails = context.getImageData(0, 0, canvas.width, canvas.height);
          for (let j = 0; j < imageDetails.data.length / 4; j++) {
            datasetByteView[j] = imageDetails.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytes);
        resolve();
      };
      image.src = spritePath;
    });
    const labelsRequest = fetch(labelPath);
    const [imgResponse, labelsResponse] = await Promise.all([imageRequest, labelsRequest]);
    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());
    this.trainIndices = tf.util.createShuffledIndices(trainingElements);
    this.testIndices = tf.util.createShuffledIndices(testingElements);
    this.trainImages = this.datasetImages.slice(0, imgSize * trainingElements);
    this.testImages = this.datasetImages.slice(imgSize * trainingElements);
    this.trainLabels = this.datasetLabels.slice(0, classNum * trainingElements);
    this.testLabels = this.datasetLabels.slice(classNum * trainingElements);
  }

  followingBatch(batchSize, data, index) {
    const imageBatchArray = new Float32Array(batchSize * imgSize);
    const labelsBatchArray = new Uint8Array(batchSize * classNum);

    for (let i = 0; i < batchSize; i++) {
      const id = index();

      const image = data[0].slice(id * imgSize, id * imgSize + imgSize);
      imageBatchArray.set(image, i * imgSize);

      const label = data[1].slice(id * classNum, id * classNum + classNum);
      labelsBatchArray.set(label, i * classNum);
    }

    const xs = tf.tensor2d(imageBatchArray, [batchSize, imgSize]);
    const labels = tf.tensor2d(labelsBatchArray, [batchSize, classNum]);

    return {xs, labels};
  }

  followingTestingBatch(batchSize) {
    return this.followingBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.testIndexShuffled = (this.testIndexShuffled + 1) % this.testIndices.length;
      return this.testIndices[this.testIndexShuffled];
    });
  }

  followingTrainingBatch(batchSize) {
    return this.followingBatch(
        batchSize, [this.trainImages, this.trainLabels], () => {
          this.trainIndexShuffled = (this.trainIndexShuffled + 1) % this.trainIndices.length;
          return this.trainIndices[this.trainIndexShuffled];
        });
  }
}
