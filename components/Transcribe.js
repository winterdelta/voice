import MicRecorder from 'mic-recorder-to-mp3'
import { useEffect, useState, useRef } from 'react'
import styles from '../styles/Transcribe.module.css'
import { useForm } from 'react-hook-form'
import Router from 'next/router'
import Image from 'next/image'
import { PauseFilled, PlayFilledAlt, SendAltFilled } from '@carbon/icons-react'
import { StopFilledAlt } from '@carbon/icons-react'
import { Microphone } from '@carbon/icons-react'

export default function Record () {
  const recorder = useRef(null) //Recorder
  const audioPlayer = useRef(null) //Ref for the HTML Audio Tag

  const [audioBlob, setAudioBlob] = useState(null)
  const [blobURL, setBlobUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [audioURLFromS3, setAudioURL] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    //Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 })
  }, [])

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true)
    })
  }

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, 'audio.mp3', {
          type: blob.type,
          lastModified: Date.now()
        })
        setAudioBlob(blob)
        const newBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(newBlobUrl)
        setIsRecording(false)
        setAudioFile(file)
      })
      .catch(e => console.log(e))
  }

  const togglePlayPause = () => {
    const prevValue = isPlaying
    setIsPlaying(!prevValue)
    if (!prevValue) {
      audioPlayer.current.play()
    } else {
      audioPlayer.current.pause()
    }
  }

  const submitVoiceMemo = async () => {
    const response = await fetch('/api/download-audio', {
      method: 'POST',
      body: audioBlob
    })
    const data = await response.json()
    setTranscription(data.DString)
    setAudioURL(data.audioURL)
  }

  useEffect(() => {
    if (audioBlob) {
      submitVoiceMemo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob])

  const handleTextAreaChange = event => {
    setTranscription(event.target.value)
  }

  const onSubmit = handleSubmit(async formData => {
    // if (errorMessage) setErrorMessage('')
    try {
      const res = await fetch('/api/createVoiceMemo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioURLFromS3, formData })
      })
      if (res.status === 200) {
        Router.reload()
      } else {
        throw new Error(await res.text())
      }
    } catch (error) {
      console.error(error)
      //   setErrorMessage(error.message)
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.component}>
        <div className={styles.playerContainer}>
          {audioBlob && (
            <div className={styles.player}>
              <div className={styles.playerBtn} onClick={togglePlayPause}>
                {blobURL ? (
                  isPlaying ? (
                    <>
                      <PauseFilled size='16' />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <PlayFilledAlt size='16' />
                      PLAY
                    </>
                  )
                ) : null}
              </div>
            </div>
          )}
        </div>
        <div className={styles.row}>
          <div className={styles.record}>
            <div
              className={styles.recordText}
              onClick={!isRecording ? startRecording : stopRecording}
            >
              <div className={isRecording ? styles.pulse : styles.micBtn}>
                {!isRecording ? (
                  <>
                    <Microphone size='36' />
                  </>
                ) : (
                  <>
                    <StopFilledAlt size='32' />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <audio ref={audioPlayer} src={blobURL} />
        <div className={styles.transcript}>
          {audioBlob ? (
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <textarea
                value={transcription}
                className={styles.transcriptionTextArea}
                {...register('Transcript', {
                  required: true,
                  maxLength: 3000
                })}
                onChange={handleTextAreaChange}
              ></textarea>

              {/* <button className={styles.sendBtn} type='submit'>
                <div className={styles.logoBtnActive}>
                  <div className={styles.logoBtnTextActive}>
                    <div className={audioBlob ? styles.pulse : null}>
                      <SendAltFilled size='24' />
                    </div>
                    <SendAltFilled size='24' />
                  </div>
                </div>
              </button> */}
            </form>
          ) : null}
          {/* {!audioBlob && (
            <div className={styles.logoBtn}>
              <div className={styles.logoBtnText}>
                <SendAltFilled size='24' />
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
