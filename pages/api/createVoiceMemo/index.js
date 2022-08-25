const faunadb = require('faunadb')
const secret = process.env.FAUNADB_SECRET_KEY
const q = faunadb.query
const client = new faunadb.Client({ secret })
const AWS = require('aws-sdk')

module.exports = async (req, res) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_1,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID
    })

    const { formData, audioURLFromS3 } = req.body
    const { Transcript } = formData

    // const synthesizeParams = {
    //   text: chapterText,
    //   accept: 'audio/mp3',
    //   voice: 'en-US_KevinV3Voice'
    // }

    // const buffer = await textToSpeech.synthesize(synthesizeParams)

    // const s3Params = {
    //   Bucket: 'waveforms',
    //   Key: `audioform/${uuid}.mp3`,
    //   Body: buffer.result,
    //   ContentType: 'audio/mp3',
    //   ACL: 'public-read'
    // }

    // await s3.upload(s3Params).promise()

    const dbs = await client.query(
      q.Create(q.Collection('voice'), {
        data: {
          text: Transcript,
          audio: audioURLFromS3,
        //   email: emailAddress
        }
      })
    )
    res.status(200).json(dbs.data)

    res.status(200)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
