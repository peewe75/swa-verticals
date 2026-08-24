import { createJob } from './swa-platform/packages/db/src/index.js';

async function main() {
  try {
    const job = await createJob({
      tenant_id: '33333333-3333-3333-3333-333333333333',
      type: 'video_kenburns',
      payload: {
        images: [
          'https://picsum.photos/seed/test1/1920/1080.jpg',
          'https://picsum.photos/seed/test2/1920/1080.jpg',
          'https://picsum.photos/seed/test3/1920/1080.jpg',
          'https://picsum.photos/seed/test4/1920/1080.jpg'
        ],
        overlays: [
          { text: 'VW Golf 7 TDI 2021', from: 0.5, to: 5, size: 72, yRatio: 0.12 },
          { text: '89.000 km — EUR 18.500', from: 5, to: 11, size: 88 },
          { text: 'Richiedi info su WhatsApp', from: 12, to: 18.5, size: 56, yRatio: 0.85 }
        ],
        voiceText: 'Volkswagen Golf 7 TDI, anno 2021, 89 mila chilometri, full optional, prezzo 18.500 euro.'
      }
    });
    console.log('SUCCESS - Job creato:', job.id);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

main();