const AWS = require('aws-sdk')
const { randomUUID } = require('crypto')
const { Deepgram } = require('@deepgram/sdk')

export default async function handler (req, res) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_1,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: 'us-east-2',
    signatureVersion: 'v4'
  })

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  const s3 = new AWS.S3()
  const uuid = randomUUID()

  const s3Params = {
    Bucket: 'waveforms',
    Key: `voicememo/${uuid}.mp3`,
    Body: Buffer.concat(chunks),
    ContentType: 'audio/mpeg',
    ACL: 'public-read'
  }

  await s3.upload(s3Params).promise()

  const file = `https://waveforms.s3.us-east-2.amazonaws.com/voicememo/${uuid}.mp3`

  // Mimetype for the file you want to transcribe
  // Only necessary if transcribing a local file
  // Example: audio/wav
  const mimetype = 'audio/mp3'

  // Initialize the Deepgram SDK
  const deepgramApiKey = process.env.YOUR_DEEPGRAM_API_KEY
  const deepgram = new Deepgram(deepgramApiKey)

  const source = {
    url: file
  }

  //   deepgram.transcription
  //     .preRecorded(source, {
  //       punctuate: true
  //     })
  //     .then(response => {
  //       // Write the response to the console
  //       //   console.dir(response, { depth: null })

  //       // Write only the transcript to the console
  //       //   console.dir(response.results.channels[0].alternatives[0].transcript, {
  //       //     depth: null
  //       //   })
  //       res.send(response.results.channels[0].alternatives[0].transcript)
  //     })
  //     .catch(err => {
  //       console.log(err)
  //     })

  const response = await deepgram.transcription.preRecorded(source, {
    punctuate: true,
    tier: 'enhanced'
  })

  const trans = response.results.channels[0].alternatives[0].transcript
  res.status(200).json({ DString: trans, audioURL: file })
}

export const config = {
  api: { bodyParser: false }
}
