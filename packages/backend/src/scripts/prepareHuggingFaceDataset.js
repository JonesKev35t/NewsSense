const { combineTrainingData } = require('./combineTrainingData');
const { convertToHuggingFaceFormat } = require('./convertToHuggingFaceFormat');

async function prepareHuggingFaceDataset() {
    try {
        console.log('Starting dataset preparation...');
        
        // First combine all training data
        console.log('Combining training data...');
        await combineTrainingData();
        
        // Then convert to Hugging Face format
        console.log('Converting to Hugging Face format...');
        await convertToHuggingFaceFormat();
        
        console.log('Dataset preparation completed successfully!');
    } catch (error) {
        console.error('Error preparing Hugging Face dataset:', error.message);
        process.exit(1);
    }
}

// Run the script
prepareHuggingFaceDataset().catch(console.error); 