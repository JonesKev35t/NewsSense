const fs = require('fs').promises;
const path = require('path');

const COMBINED_DATA_DIR = path.join(__dirname, '../../data/combined');
const HUGGINGFACE_DATA_DIR = path.join(__dirname, '../../data/huggingface');

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function convertToHuggingFaceFormat() {
    try {
        const datasetPath = path.join(COMBINED_DATA_DIR, 'dataset.json');
        const dataset = JSON.parse(await fs.readFile(datasetPath, 'utf8'));
        
        const huggingFaceDataset = {
            train: [],
            validation: [],
            test: []
        };
        
        // Convert each split to Hugging Face format
        for (const split of ['train', 'validation', 'test']) {
            huggingFaceDataset[split] = dataset[split].map(sample => ({
                text: `Stock: ${sample.symbol}\n` +
                      `Price: ${sample.price}\n` +
                      `Change: ${sample.change}\n` +
                      `Volume: ${sample.volume}\n` +
                      `Price Change %: ${sample.priceChangePercent}\n` +
                      `Volume Change %: ${sample.volumeChangePercent}\n` +
                      `Price Range: ${sample.priceRange}\n` +
                      `Volume Range: ${sample.volumeRange}\n` +
                      `Market Cap: ${sample.marketCap}\n` +
                      `PE Ratio: ${sample.peRatio}\n` +
                      `Dividend Yield: ${sample.dividendYield}\n` +
                      `52 Week High: ${sample.week52High}\n` +
                      `52 Week Low: ${sample.week52Low}`,
                label: sample.label,
                features: {
                    price: sample.price,
                    change: sample.change,
                    volume: sample.volume,
                    priceChangePercent: sample.priceChangePercent,
                    volumeChangePercent: sample.volumeChangePercent,
                    priceRange: sample.priceRange,
                    volumeRange: sample.volumeRange,
                    marketCap: sample.marketCap,
                    peRatio: sample.peRatio,
                    dividendYield: sample.dividendYield,
                    week52High: sample.week52High,
                    week52Low: sample.week52Low
                }
            }));
        }
        
        // Save Hugging Face formatted dataset
        const outputPath = path.join(HUGGINGFACE_DATA_DIR, 'dataset.json');
        await fs.writeFile(outputPath, JSON.stringify(huggingFaceDataset, null, 2));
        
        console.log(`Hugging Face dataset saved to ${outputPath}`);
        console.log(`Training samples: ${huggingFaceDataset.train.length}`);
        console.log(`Validation samples: ${huggingFaceDataset.validation.length}`);
        console.log(`Test samples: ${huggingFaceDataset.test.length}`);
    } catch (error) {
        console.error('Error converting to Hugging Face format:', error.message);
    }
}

async function main() {
    await ensureDirectoryExists(HUGGINGFACE_DATA_DIR);
    await convertToHuggingFaceFormat();
}

// Run the script
main().catch(console.error); 