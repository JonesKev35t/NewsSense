const fs = require('fs').promises;
const path = require('path');

const PROCESSED_DATA_DIR = path.join(__dirname, '../../data/processed');
const TRAINING_DATA_DIR = path.join(__dirname, '../../data/training');

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

function calculateFeatures(data) {
    const features = [];
    
    for (let i = 0; i < data.length - 1; i++) {
        const current = data[i];
        const next = data[i + 1];
        
        // Calculate price change percentage
        const priceChange = ((next.close - current.close) / current.close) * 100;
        
        // Calculate volume change percentage
        const volumeChange = ((next.volume - current.volume) / current.volume) * 100;
        
        // Calculate price range
        const priceRange = (current.high - current.low) / current.close * 100;
        
        features.push({
            date: current.date,
            features: {
                open: current.open,
                high: current.high,
                low: current.low,
                close: current.close,
                volume: current.volume,
                priceChange,
                volumeChange,
                priceRange
            },
            label: priceChange > 0 ? 1 : 0 // 1 for price increase, 0 for decrease
        });
    }
    
    return features;
}

async function prepareTrainingData(filePath) {
    try {
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const features = calculateFeatures(data);
        
        const symbol = path.basename(filePath, '_processed.json');
        const outputPath = path.join(TRAINING_DATA_DIR, `${symbol}_training.json`);
        
        await fs.writeFile(outputPath, JSON.stringify(features, null, 2));
        console.log(`Training data saved to ${outputPath}`);
    } catch (error) {
        console.error(`Error preparing training data for ${filePath}:`, error.message);
    }
}

async function main() {
    await ensureDirectoryExists(TRAINING_DATA_DIR);
    
    try {
        const files = await fs.readdir(PROCESSED_DATA_DIR);
        const processedFiles = files.filter(file => file.endsWith('_processed.json'));
        
        for (const file of processedFiles) {
            const filePath = path.join(PROCESSED_DATA_DIR, file);
            await prepareTrainingData(filePath);
        }
    } catch (error) {
        console.error('Error reading processed data directory:', error.message);
    }
}

// Run the script
main().catch(console.error); 